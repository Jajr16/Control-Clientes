import Repositorio from "../repositories/globalPersistence.js";
import { pool } from "../config/db.js";

const adeudoRepo = new Repositorio('adeudo', 'num_factura');
const protocoloRepo = new Repositorio('protocolo', 'num_factura');
const anticipoRepo = new Repositorio('anticipo', 'empresa_cif');
const ajusteRepo = new Repositorio('ajuste', 'num_factura');

export const insertarAdeudoCompleto = async ({ adeudo, protocolo, ajuste }) => {
  const client = await pool.connect();  

  try {
        await client.query('BEGIN');

        // 1. Insertar adeudo
        const adeudoInsertado = await adeudoRepo.insertar(adeudo, client);
        console.log('Adeudo insertado:', adeudoInsertado);

        // 2. Insertar protocolo
        if (protocolo && Object.keys(protocolo).length > 0) {
            await protocoloRepo.insertar(protocolo, client);
            console.log('Protocolo insertado');
        }

        // 3. Usar anticipo existente si hay
        const anticipoExistente = await anticipoRepo.ObtenerPorId({ empresa_cif: adeudo.empresa_cif });
        if (anticipoExistente) {
            console.log('Usando anticipo existente:', anticipoExistente);
        } else {
            console.log('No existe anticipo para esta empresa');
        }

        // 4. Insertar ajuste
        if (ajuste && Object.keys(ajuste).length > 0) {
            await ajusteRepo.insertar(ajuste, client);
            console.log('Ajuste insertado');
        }

        await client.query('COMMIT');
        return adeudoInsertado;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en la transacción de insertarAdeudoCompleto:', error);
        throw new Error('No se pudo insertar en adeudo');
    } finally {
        client.release();
    }
};


export const obtenerAdeudosPorEmpresa = async (empresa_cif) => {
    console.log("Buscando adeudos para empresa:", empresa_cif);
  const query = `
    SELECT 
    a.num_factura,
    a.concepto,
    a.proveedor,
    a.ff,
    a.importe,
    a.iva,
    a.retencion,
    COALESCE(p.protocolo_entrada, '') AS protocolo_entrada,
    COALESCE(p.cs_iva, 0) AS cs_iva,
    (COALESCE(a.importe,0) + COALESCE(a.iva,0) - COALESCE(a.retencion,0) + COALESCE(p.cs_iva,0)) AS total,
    COALESCE(an.anticipo, 0) AS anticipo,
    COALESCE(h.iva, 0) AS honorarios,
    a.empresa_cif
FROM adeudo a
LEFT JOIN protocolo p ON a.num_factura = p.num_factura
LEFT JOIN anticipo an ON a.empresa_cif = an.empresa_cif
LEFT JOIN honorario h ON h.num_factura = a.num_factura
WHERE a.empresa_cif = $1;

  `;

  const result = await pool.query(query, [empresa_cif]);
  console.log("Resultados obtenidos:", result.rows);
  return result.rows;
};
