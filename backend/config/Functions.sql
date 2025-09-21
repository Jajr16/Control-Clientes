-- Query para histórico de ADEUDOS
DROP FUNCTION IF EXISTS obtener_adeudos_por_empresa(VARCHAR);

CREATE OR REPLACE FUNCTION obtener_adeudos_por_empresa(empresa_cif_input VARCHAR)
RETURNS TABLE (
    num_factura TEXT,
    concepto TEXT,
    proveedor TEXT,
    ff DATE,
    importe NUMERIC,
    iva NUMERIC,
    retencion NUMERIC,
    num_liquidacion INT,
    f_adeudo_creacion TIMESTAMP,
    num_protocolo TEXT,
    cs_iva NUMERIC,
    total NUMERIC,
    honorarios_base NUMERIC,
    honorarios_iva NUMERIC,
    estado TEXT,
    fecha_liquidacion TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.num_factura::TEXT,
        a.concepto::TEXT,
        a.proveedor::TEXT,
        a.ff,
        a.importe,
        a.iva,
        a.retencion,
        a.num_liquidacion,
        a.fecha_creacion AS f_adeudo_creacion, 
        COALESCE(p.num_protocolo, '-')::TEXT AS num_protocolo,
        COALESCE(p.cs_iva, 0) AS cs_iva,
        (COALESCE(a.importe,0) 
         + COALESCE(a.iva,0) 
         - COALESCE(a.retencion,0) 
         + COALESCE(p.cs_iva,0)) AS total,
        COALESCE(h.honorario, 0) AS honorarios_base,
        COALESCE(h.iva, 0) AS honorarios_iva,
        a.estado::TEXT,
        h.fecha_creacion AS fecha_liquidacion
    FROM adeudo a
    LEFT JOIN protocolo p 
        ON a.num_factura = p.num_factura 
       AND a.empresa_cif = p.empresa_cif
    LEFT JOIN honorario h 
        ON a.num_liquidacion = h.num_liquidacion 
       AND a.empresa_cif = h.empresa_cif
    WHERE a.empresa_cif = empresa_cif_input
    ORDER BY 
        CASE WHEN a.num_liquidacion IS NULL THEN 0 ELSE 1 END,
        COALESCE(a.num_liquidacion, 999999) DESC, 
        a.ff ASC;
END;
$$ LANGUAGE plpgsql;

-- Modificaciones Tabla ADEUDO
ALTER TABLE adeudo DROP COLUMN iva;
ALTER TABLE adeudo DROP COLUMN retencion;

ALTER TABLE adeudo
ADD COLUMN iva NUMERIC NOT NULL GENERATED ALWAYS AS (importe * 0.21) STORED;

ALTER TABLE adeudo 
ADD COLUMN retencion NUMERIC NOT NULL GENERATED ALWAYS AS (importe * 0.15) STORED;

-- Query para RMM del Histórico de ADEUDOS
-- Función que combina adeudos existentes con entradas RMM pendientes
CREATE OR REPLACE FUNCTION obtener_adeudos_con_rmm_por_empresa(p_empresa_cif VARCHAR)
RETURNS TABLE(
    num_factura VARCHAR,
    concepto VARCHAR,
    proveedor VARCHAR,
    ff DATE,
    importe NUMERIC,
    iva NUMERIC,
    retencion NUMERIC,
    num_liquidacion INT,
    empresa_cif VARCHAR,
    fecha_creacion TIMESTAMP,
    estado VARCHAR,
    num_protocolo VARCHAR,
    cs_iva NUMERIC,
    total NUMERIC,
    fecha_liquidacion DATE,
    -- Campos específicos de RMM
    es_rmm BOOLEAN,
    num_entrada VARCHAR,
    anticipo_pagado NUMERIC,
    fecha_anticipo DATE,
    diferencia NUMERIC,
    fecha_devolucion_diferencia DATE
) AS $$
BEGIN
    RETURN QUERY
    WITH adeudos_existentes AS (
        -- Obtener todos los adeudos existentes
        SELECT 
            a.num_factura,
            a.concepto,
            a.proveedor,
            a.ff,
            a.importe,
            a.iva,
            a.retencion,
            a.num_liquidacion,
            a.empresa_cif,
            a.fecha_creacion,
            a.estado,
            COALESCE(p.num_protocolo, ''::VARCHAR) as num_protocolo,
            COALESCE(p.cs_iva, 0::NUMERIC) as cs_iva,
            (a.importe + a.iva - a.retencion + COALESCE(p.cs_iva, 0)) as total,
            h.fecha_creacion::DATE as fecha_liquidacion,
            -- Campos RMM
            CASE WHEN a.proveedor = 'Registro Mercantil de Madrid' THEN true ELSE false END as es_rmm,
            rmm.num_entrada,
            rmm.anticipo_pagado,
            rmm.fecha_anticipo,
            rmm.diferencia,
            rmm.fecha_devolucion_diferencia
        FROM adeudo a
        LEFT JOIN honorario h ON a.empresa_cif = h.empresa_cif AND a.num_liquidacion = h.num_liquidacion
        LEFT JOIN entrada_rmm rmm ON a.num_factura = rmm.num_factura_final AND a.empresa_cif = rmm.empresa_cif
        LEFT JOIN protocolo p ON a.num_factura = p.num_factura AND a.empresa_cif = p.empresa_cif
        WHERE a.empresa_cif = p_empresa_cif
    ),
    entradas_rmm_pendientes AS (
        -- Obtener entradas RMM que no tienen factura final asignada
        SELECT 
            NULL::VARCHAR as num_factura,
            'Inscripción Registro Mercantil'::VARCHAR as concepto,
            'Registro Mercantil de Madrid'::VARCHAR as proveedor,
            NULL::DATE as ff,
            0::NUMERIC as importe,
            0::NUMERIC as iva,
            0::NUMERIC as retencion,
            NULL::INT as num_liquidacion,
            rmm.empresa_cif,
            rmm.fecha_creacion,
            'PENDIENTE DE FACTURA'::VARCHAR as estado,
            rmm.num_entrada as num_protocolo,
            0::NUMERIC as cs_iva,
            rmm.anticipo_pagado as total,
            NULL::DATE as fecha_liquidacion,
            -- Campos RMM
            true as es_rmm,
            rmm.num_entrada,
            rmm.anticipo_pagado,
            rmm.fecha_anticipo,
            rmm.diferencia,
            rmm.fecha_devolucion_diferencia
        FROM entrada_rmm rmm
        WHERE rmm.empresa_cif = p_empresa_cif
        AND rmm.num_factura_final IS NULL
    )
    -- Unir ambos conjuntos de datos
    SELECT * FROM adeudos_existentes
    UNION ALL
    SELECT * FROM entradas_rmm_pendientes
    ORDER BY ff DESC, fecha_creacion DESC;
END;
$$ LANGUAGE plpgsql;
SELECT*FROM obtener_adeudos_con_rmm_por_empresa('5454');


-- Función para obtener solo honorarios por empresa
CREATE OR REPLACE FUNCTION obtener_honorarios_por_empresa(p_empresa_cif VARCHAR)
RETURNS TABLE(
    empresa_cif VARCHAR,
    num_liquidacion INT,
    honorario NUMERIC,
    iva NUMERIC,
    total_honorarios NUMERIC,
    num_factura VARCHAR,
    fecha_creacion TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.empresa_cif::VARCHAR,
        h.num_liquidacion,
        h.honorario,
        h.iva,
        (h.honorario + h.iva) as total_honorarios,
        h.num_factura,
        h.fecha_creacion
    FROM honorario h
    WHERE h.empresa_cif = p_empresa_cif
    ORDER BY h.num_liquidacion DESC;
END;
$$ LANGUAGE plpgsql;

insert into entrada_rmm values ('NE1', '5454', 200, '2025-09-17', null, null, null);
select*from entrada_rmm;
select*from adeudo;



-- Anticipo dinámico
ALTER TABLE anticipo ADD COLUMN IF NOT EXISTS anticipo_original NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE anticipo ADD COLUMN IF NOT EXISTS saldo_actual NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE anticipo ADD COLUMN IF NOT EXISTS fecha_ultima_actualizacion TIMESTAMP DEFAULT NOW();

UPDATE anticipo 
SET anticipo_original = anticipo, 
    saldo_actual = anticipo,
    fecha_ultima_actualizacion = NOW()
WHERE anticipo_original = 0;

-- Función para calcular el saldo actual de una empresa
DROP FUNCTION IF EXISTS calcular_saldo_empresa(VARCHAR);
CREATE OR REPLACE FUNCTION calcular_saldo_empresa(empresa_cif_param VARCHAR(9))
RETURNS TABLE (
    anticipo_original_result NUMERIC,
    saldo_actual_result NUMERIC,
    total_adeudos_result NUMERIC,
    total_honorarios_result NUMERIC,
    total_general_result NUMERIC,
    debe_empresa_result NUMERIC
) AS $$
DECLARE
    anticipo_existe BOOLEAN;
BEGIN
    -- Verificar si existe anticipo
    SELECT EXISTS(
        SELECT 1 FROM anticipo WHERE empresa_cif = empresa_cif_param
    ) INTO anticipo_existe;

    IF anticipo_existe THEN
        -- Si existe anticipo, hacer el cálculo completo
        RETURN QUERY
        WITH adeudos_totales AS (
            SELECT COALESCE(SUM(
                COALESCE(a.importe, 0) + 
                COALESCE(a.iva, 0) - 
                COALESCE(a.retencion, 0) + 
                COALESCE(p.cs_iva, 0)
            ), 0) as total_calculado
            FROM adeudo a
            LEFT JOIN protocolo p ON a.num_factura = p.num_factura AND a.empresa_cif = p.empresa_cif
            WHERE a.empresa_cif = empresa_cif_param
        ),
        honorarios_totales AS (
            SELECT COALESCE(SUM(
                COALESCE(h.honorario, 0) + 
                COALESCE(h.iva, 0)
            ), 0) as total_honorarios
            FROM honorario h
            WHERE h.empresa_cif = empresa_cif_param
        ),
        anticipo_info AS (
            SELECT 
                COALESCE(a.anticipo_original, 0) as original_val,
                COALESCE(a.anticipo, 0) as current_val
            FROM anticipo a
            WHERE a.empresa_cif = empresa_cif_param
        )
        SELECT 
            ai.original_val as anticipo_original_result,
            GREATEST(0, ai.original_val - (at.total_calculado + ht.total_honorarios)) as saldo_actual_result,
            at.total_calculado as total_adeudos_result,
            ht.total_honorarios as total_honorarios_result,
            (at.total_calculado + ht.total_honorarios) as total_general_result,
            GREATEST(0, (at.total_calculado + ht.total_honorarios) - ai.original_val) as debe_empresa_result
        FROM anticipo_info ai, adeudos_totales at, honorarios_totales ht;
    ELSE
        -- Si no existe anticipo, devolver valores por defecto con cálculo de totales
        RETURN QUERY
        WITH totales_sin_anticipo AS (
            SELECT 
                COALESCE(SUM(
                    COALESCE(a.importe, 0) + 
                    COALESCE(a.iva, 0) - 
                    COALESCE(a.retencion, 0) + 
                    COALESCE(p.cs_iva, 0)
                ), 0) as total_adeudos,
                COALESCE(SUM(
                    COALESCE(h.honorario, 0) + 
                    COALESCE(h.iva, 0)
                ), 0) as total_honorarios
            FROM adeudo a
            LEFT JOIN protocolo p ON a.num_factura = p.num_factura AND a.empresa_cif = p.empresa_cif
            LEFT JOIN honorario h ON h.empresa_cif = a.empresa_cif
            WHERE a.empresa_cif = empresa_cif_param
        )
        SELECT 
            0::NUMERIC as anticipo_original_result,
            0::NUMERIC as saldo_actual_result,
            tsa.total_adeudos as total_adeudos_result,
            tsa.total_honorarios as total_honorarios_result,
            (tsa.total_adeudos + tsa.total_honorarios) as total_general_result,
            (tsa.total_adeudos + tsa.total_honorarios) as debe_empresa_result
        FROM totales_sin_anticipo tsa;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_saldo_insert ON adeudo;
DROP TRIGGER IF EXISTS trigger_actualizar_saldo_update ON adeudo;
DROP TRIGGER IF EXISTS trigger_actualizar_saldo_delete ON adeudo;

CREATE TRIGGER trigger_actualizar_saldo_insert
    AFTER INSERT ON adeudo
    FOR EACH ROW EXECUTE FUNCTION actualizar_saldo_anticipo();

CREATE TRIGGER trigger_actualizar_saldo_update
    AFTER UPDATE ON adeudo
    FOR EACH ROW EXECUTE FUNCTION actualizar_saldo_anticipo();

CREATE TRIGGER trigger_actualizar_saldo_delete
    AFTER DELETE ON adeudo
    FOR EACH ROW EXECUTE FUNCTION actualizar_saldo_anticipo();

-- Triggers sobre protocolo
DROP TRIGGER IF EXISTS trigger_actualizar_saldo_protocolo_insert ON protocolo;
DROP TRIGGER IF EXISTS trigger_actualizar_saldo_protocolo_update ON protocolo;
DROP TRIGGER IF EXISTS trigger_actualizar_saldo_protocolo_delete ON protocolo;

CREATE TRIGGER trigger_actualizar_saldo_protocolo_insert
    AFTER INSERT ON protocolo
    FOR EACH ROW EXECUTE FUNCTION actualizar_saldo_anticipo();

CREATE TRIGGER trigger_actualizar_saldo_protocolo_update
    AFTER UPDATE ON protocolo
    FOR EACH ROW EXECUTE FUNCTION actualizar_saldo_anticipo();

CREATE TRIGGER trigger_actualizar_saldo_protocolo_delete
    AFTER DELETE ON protocolo
    FOR EACH ROW EXECUTE FUNCTION actualizar_saldo_anticipo();


-- TRIGGERS PARA ACTUALIZAR EL ESTADO DE UN ADEUDO
CREATE OR REPLACE FUNCTION actualizar_estado_adeudo()
RETURNS TRIGGER AS $$
DECLARE
    saldo_actual_empresa NUMERIC;
BEGIN
    -- Consultar el saldo disponible de la empresa
    SELECT saldo_actual_result
    INTO saldo_actual_empresa
    FROM calcular_saldo_empresa(COALESCE(NEW.empresa_cif, OLD.empresa_cif))
    LIMIT 1;

    -- Si hay saldo suficiente del anticipo, marcar como cubierto, si no, como pendiente
    NEW.estado := CASE 
                    WHEN saldo_actual_empresa >= (COALESCE(NEW.importe,0) + COALESCE(NEW.iva,0) - COALESCE(NEW.retencion,0)) 
                         THEN 'LIQUIDADO'
                    ELSE 'LIQUIDACIÓN EN CURSO'
                  END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_estado_adeudo ON adeudo;

CREATE TRIGGER trigger_actualizar_estado_adeudo
    BEFORE INSERT OR UPDATE ON adeudo
    FOR EACH ROW EXECUTE FUNCTION actualizar_estado_adeudo();

select*from honorario;
select*from empresa;