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

ALTER TABLE adeudo DROP COLUMN iva;
ALTER TABLE adeudo DROP COLUMN retencion;

ALTER TABLE adeudo
ADD COLUMN iva NUMERIC NOT NULL GENERATED ALWAYS AS (importe * 0.21) STORED;

ALTER TABLE adeudo 
ADD COLUMN retencion NUMERIC NOT NULL GENERATED ALWAYS AS (importe * 0.15) STORED;