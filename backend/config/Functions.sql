CREATE OR REPLACE FUNCTION public.calcular_saldo_empresa(empresa_cif_param character varying)
RETURNS TABLE(
    anticipo_original_result numeric,
    saldo_actual_result numeric,
    total_adeudos_result numeric,
    total_honorarios_result numeric,
    total_general_result numeric,
    debe_empresa_result numeric
)
LANGUAGE plpgsql
AS $function$
DECLARE
    anticipo_existe BOOLEAN;
BEGIN
    -- Verificar si existe anticipo
    SELECT EXISTS(
        SELECT 1 FROM anticipo WHERE empresa_cif = empresa_cif_param
    ) INTO anticipo_existe;

    IF anticipo_existe THEN
        RETURN QUERY
        WITH adeudos_totales AS (
            SELECT COALESCE(SUM(
                COALESCE(a.importe, 0) +
                COALESCE(a.iva, 0) -
                COALESCE(a.retencion, 0) +
                COALESCE(p.cs_iva, 0)
            ), 0) AS total_calculado
            FROM adeudo a
            LEFT JOIN protocolo p
                ON a.num_factura = p.num_factura
                AND a.empresa_cif = p.empresa_cif
            WHERE a.empresa_cif = empresa_cif_param
              AND a.estado <> 'LIQUIDADO'
        ),
        honorarios_totales AS (
            SELECT COALESCE(SUM(
                COALESCE(h.honorario, 0) +
                COALESCE(h.iva, 0)
            ), 0) AS total_honorarios
            FROM honorario h
            WHERE h.empresa_cif = empresa_cif_param
              AND EXISTS (
                  SELECT 1
                  FROM adeudo a2
                  WHERE a2.num_liquidacion = h.num_liquidacion
                    AND a2.estado <> 'LIQUIDADO'
              )
        ),
        anticipo_info AS (
            SELECT 
                COALESCE(a.anticipo_original, 0) AS original_val,
                COALESCE(a.anticipo, 0) AS current_val
            FROM anticipo a
            WHERE a.empresa_cif = empresa_cif_param
            LIMIT 1
        )
        SELECT 
            ai.original_val AS anticipo_original_result,
            GREATEST(0, ai.original_val - (at.total_calculado + ht.total_honorarios)) AS saldo_actual_result,
            at.total_calculado AS total_adeudos_result,
            ht.total_honorarios AS total_honorarios_result,
            (at.total_calculado + ht.total_honorarios) AS total_general_result,
            GREATEST(0, (at.total_calculado + ht.total_honorarios) - ai.original_val) AS debe_empresa_result
        FROM anticipo_info ai, adeudos_totales at, honorarios_totales ht;

    ELSE
        RETURN QUERY
        WITH totales_sin_anticipo AS (
            SELECT 
                COALESCE(SUM(
                    COALESCE(a.importe, 0) +
                    COALESCE(a.iva, 0) -
                    COALESCE(a.retencion, 0) +
                    COALESCE(p.cs_iva, 0)
                ), 0) AS total_adeudos,
                COALESCE(SUM(
                    COALESCE(h.honorario, 0) +
                    COALESCE(h.iva, 0)
                ), 0) AS total_honorarios
            FROM adeudo a
            LEFT JOIN protocolo p
                ON a.num_factura = p.num_factura
                AND a.empresa_cif = p.empresa_cif
            LEFT JOIN honorario h
                ON h.empresa_cif = a.empresa_cif
            WHERE a.empresa_cif = empresa_cif_param
              AND a.estado <> 'LIQUIDADO'
              AND EXISTS (
                  SELECT 1
                  FROM adeudo a2
                  WHERE a2.num_liquidacion = h.num_liquidacion
                    AND a2.estado <> 'LIQUIDADO'
              )
        )
        SELECT 
            0::NUMERIC AS anticipo_original_result,
            0::NUMERIC AS saldo_actual_result,
            tsa.total_adeudos AS total_adeudos_result,
            tsa.total_honorarios AS total_honorarios_result,
            (tsa.total_adeudos + tsa.total_honorarios) AS total_general_result,
            (tsa.total_adeudos + tsa.total_honorarios) AS debe_empresa_result
        FROM totales_sin_anticipo tsa;
    END IF;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_actualizar_saldo_insert ON adeudo;
DROP TRIGGER IF EXISTS trigger_actualizar_saldo_update ON adeudo;
DROP TRIGGER IF EXISTS trigger_actualizar_saldo_delete ON adeudo;

CREATE OR REPLACE FUNCTION public.actualizar_saldo_anticipo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Recalcular y actualizar el saldo actual
    UPDATE anticipo 
    SET saldo_actual = (
        SELECT saldo_actual 
        FROM calcular_saldo_empresa(COALESCE(NEW.empresa_cif, OLD.empresa_cif))
        LIMIT 1
    ),
    fecha_ultima_actualizacion = NOW()
    WHERE empresa_cif = COALESCE(NEW.empresa_cif, OLD.empresa_cif);
    
    RETURN COALESCE(NEW, OLD);
END;
$function$

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

DROP TRIGGER IF EXISTS trigger_actualizar_estado_adeudo ON adeudo;

CREATE TRIGGER trigger_actualizar_estado_adeudo
    AFTER INSERT OR UPDATE ON adeudo
    FOR EACH ROW EXECUTE FUNCTION actualizar_estado_adeudo();

CREATE OR REPLACE FUNCTION public.obtener_adeudos_con_rmm_por_empresa(p_empresa_cif character varying)
RETURNS TABLE(num_factura character varying, concepto character varying, proveedor character varying, ff date, importe numeric, iva numeric, retencion numeric, num_liquidacion integer, empresa_cif character varying, fecha_creacion timestamp without time zone, estado character varying, num_protocolo character varying, cs_iva numeric, total numeric, fecha_liquidacion date, es_rmm boolean, num_entrada character varying, anticipo_pagado numeric, fecha_anticipo date, diferencia numeric, fecha_devolucion_diferencia date)
LANGUAGE plpgsql
AS $function$
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
$function$
