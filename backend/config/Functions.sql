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

insert into entrada_rmm values ('NE1', '5454', 200, '2025-09-17', null, null, null);
select*from entrada_rmm;
select*from adeudo;