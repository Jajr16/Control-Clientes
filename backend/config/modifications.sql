ALTER TABLE inmueble ADD COLUMN empresa_cif VARCHAR(9) NOT NULL;
UPDATE inmueble i SET empresa_cif = ei.cif FROM empresa_inmueble ei
WHERE i.clave_catastral = ei.clave_catastral;
ALTER TABLE inmueble ALTER COLUMN empresa_cif SET NOT NULL;


ROLLBACK;
BEGIN;

	ALTER TABLE proveedor DROP CONSTRAINT proveedor_pkey CASCADE;
	ALTER TABLE inmueble_proveedor DROP CONSTRAINT inmueble_proveedor_pkey;
	ALTER TABLE inmueble_proveedor DROP CONSTRAINT IF EXISTS inmueble_proveedor_clave_fkey CASCADE;

	ALTER TABLE proveedor ADD COLUMN id_proveedor SERIAL PRIMARY KEY;
	ALTER TABLE proveedor RENAME COLUMN clave TO cup;
	ALTER TABLE proveedor ADD CONSTRAINT uq_proveedor_nombre_servicio UNIQUE (nombre, tipo_servicio);
	
	ALTER TABLE inmueble_proveedor ADD COLUMN id_proveedor INT;
	
	UPDATE inmueble_proveedor ip
    SET id_proveedor = p.id_proveedor
    FROM proveedor p
    WHERE ip.clave = p.cup;

	ALTER TABLE inmueble_proveedor DROP COLUMN clave;
	ALTER TABLE inmueble_proveedor ALTER COLUMN id_proveedor SET NOT NULL;

	ALTER TABLE inmueble_proveedor ADD CONSTRAINT fk_inmueble_proveedor_id FOREIGN KEY (id_proveedor)
		REFERENCES proveedor(id_proveedor) ON UPDATE CASCADE ON DELETE CASCADE;

	ALTER TABLE inmueble_proveedor 
    ADD PRIMARY KEY (clave_catastral, id_proveedor);

COMMIT;

ALTER TABLE hipoteca ADD COLUMN clave_catastral VARCHAR(25) UNIQUE;
UPDATE hipoteca h SET clave_catastral = ih.clave_catastral FROM inmueble_hipoteca ih WHERE h.id = ih.id_hipoteca;
ALTER TABLE hipoteca ALTER COLUMN clave_catastral SET NOT NULL;

DROP TABLE inmueble_hipoteca;