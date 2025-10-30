import { BaseService } from './BaseService.js';
import Repositorio from '../repositories/globalPersistence.js';
import DatoRegistralService from './DatoRegistralService.js';
import DireccionService from './DireccionService.js';
import HipotecaService from './HipotecaService.js';
import ProveedorService from './ProveedorService.js';
import SeguroService from './SeguroService.js';

class InmuebleService extends BaseService {
    constructor() {
        super({
            inmueble: new Repositorio('inmueble', 'clave_catastral')
        });

        this.datoRegistralService = new DatoRegistralService();
        this.direccionService = new DireccionService();
        this.hipotecaService = new HipotecaService();
        this.proveedorService = new ProveedorService();
        this.seguroService = new SeguroService();

    }

    async nuevoInmueble(datos, client = null) {
        const ejecutar = async (conn) => {
            const datoRegistral = await this.datoRegistralService.crearDatoRegistral(datos.datosInmueble.datoRegistralInmueble, conn);
            const { cp, ...direccionData } = datos.datosInmueble.dirInmueble
            const direccion = await this.direccionService.crearDireccion({ ...direccionData, codigo_postal: cp }, conn);

            const inmuebleData = {
                clave_catastral: datos.datosInmueble.clave_catastral,
                direccion: direccion.id,
                dato_registral: datoRegistral.id_dr
            };

            const resultado = await this.repositories.inmueble.insertar(inmuebleData, conn);

            if (datos.proveedores && datos.proveedores.length > 0) {
                for (const proveedor of datos.proveedores) {
                    await this.proveedorService.vincularProveedorAInmueble({
                        clave: proveedor.clave_proveedor,
                        nombre: proveedor.nombre,
                        telefono: proveedor.tel_proveedor,
                        email: proveedor.email_proveedor,
                        tipo_servicio: proveedor.servicio
                    }, datos.datosInmueble.clave_catastral, conn)
                }
            }

            if (datos.hipotecas && datos.hipotecas.length > 0) {
                for (const hipoteca of datos.hipotecas) {
                    await this.hipotecaService.vincularHipotecaAInmueble({
                        prestamo: hipoteca.prestamo,
                        banco_prestamo: hipoteca.prestamo,
                        fecha_hipoteca: hipoteca.fecha_hipoteca,
                        cuota_hipoteca: hipoteca.cuota
                    }, datos.datosInmueble.clave_catastral, client)
                }
            }

            if (datos.seguros && datos.seguros.length > 0) {
                for (const seguro of datos.seguros) {
                    await this.seguroService.vincularSeguroAInmueble({
                        empresa_seguro: seguro.aseguradora,
                        tipo_seguro: seguro.tipo_seguro,
                        telefono: seguro.telefono_seguro,
                        email: seguro.email_seguro,
                        poliza: seguro.poliza
                    }, datos.datosInmueble.clave_catastral, client)
                }
            }

            return { message: "Inmueble creado con éxito.", data: resultado };
        };

        // Si no viene un cliente transaccional, crea una transacción propia
        if (client) {
            return await ejecutar(client);
        } else {
            return await this.withTransaction(ejecutar);
        }
    }

    // ======= ACTUALIZAR SEGURO =======
    async updateSeguro(claveCatastral, empresaSeguro, nuevosDatos) {
        return await this.withTransaction(async (client) => {
            const seguroExiste = await client.query(
                `SELECT 1 FROM inmueble_seguro 
                 WHERE clave_catastral = $1 AND empresa_seguro = $2`,
                [claveCatastral, empresaSeguro]
            );

            if (seguroExiste.rowCount === 0) {
                throw new Error('Seguro no encontrado para este inmueble');
            }

            const resultado = await client.query(
                `UPDATE seguro 
                 SET tipo_seguro = $1, telefono = $2, email = $3, poliza = $4
                 WHERE empresa_seguro = $5
                 RETURNING *`,
                [
                    nuevosDatos.tipo_seguro,
                    nuevosDatos.telefono,
                    nuevosDatos.email,
                    nuevosDatos.poliza,
                    empresaSeguro
                ]
            );

            if (resultado.rowCount === 0) {
                throw new Error('No se pudo actualizar el seguro');
            }

            return {
                message: "Seguro actualizado correctamente",
                data: resultado.rows[0]
            };
        });
    }

    // ======= ACTUALIZAR PROVEEDORES =======
    async updateProveedor(claveCatastral, claveProveedor, nuevosDatos) {
        console.log('🟢 Service - updateProveedor recibido:', {
            claveCatastral,
            claveProveedor,
            nuevosDatos
        });

        return await this.withTransaction(async (client) => {
            console.log('🔍 Buscando proveedor con:', { claveCatastral, claveProveedor });

            const proveedorQuery = await client.query(
                `SELECT proveedor.clave, proveedor.nombre
                FROM inmueble_proveedor
                INNER JOIN proveedor ON inmueble_proveedor.clave = proveedor.clave
                WHERE inmueble_proveedor.clave_catastral = $1 AND proveedor.clave = $2`,
                [claveCatastral, claveProveedor]
            );

            if (proveedorQuery.rowCount === 0) {
                throw new Error(`Proveedor "${claveProveedor}" no encontrado para este inmueble`);
            }

            const resultado = await client.query(
                `UPDATE proveedor 
                SET tipo_servicio = $1, nombre = $2, telefono = $3, email = $4
                WHERE clave = $5
                RETURNING *`,
                [
                    nuevosDatos.tipo_servicio,
                    nuevosDatos.nombre,
                    nuevosDatos.telefono,
                    nuevosDatos.email,
                    claveProveedor
                ]
            );

            if (resultado.rowCount === 0) {
                throw new Error('No se pudo actualizar el proveedor');
            }

            return {
                message: "Proveedor actualizado correctamente",
                data: resultado.rows[0]
            };
        });
    }

    // ========== ACTUALIZAR DATOS REGISTRALES ==========
    async updateDatosRegistrales(claveCatastral, nuevosDatos) {
        return await this.withTransaction(async (client) => {
            const inmuebleQuery = await client.query(
                `SELECT dato_registral FROM inmueble WHERE clave_catastral = $1`,
                [claveCatastral]
            );

            if (inmuebleQuery.rowCount === 0) {
                throw new Error('Inmueble no encontrado');
            }

            const idDatoRegistral = inmuebleQuery.rows[0].dato_registral;

            const resultadoDR = await client.query(
                `UPDATE dato_registral 
                 SET num_protocolo = $1, folio = $2, hoja = $3, inscripcion = $4, 
                     notario = $5, fecha_inscripcion = $6
                 WHERE id_dr = $7
                 RETURNING *`,
                [
                    nuevosDatos.num_protocolo,
                    nuevosDatos.folio,
                    nuevosDatos.hoja,
                    nuevosDatos.inscripcion,
                    nuevosDatos.notario,
                    nuevosDatos.fecha_inscripcion,
                    idDatoRegistral
                ]
            );

            const resultadoEI = await client.query(
                `UPDATE empresa_inmueble 
                 SET valor_adquisicion = $1, fecha_adquisicion = $2
                 WHERE clave_catastral = $3
                 RETURNING *`,
                [
                    nuevosDatos.valor_adquisicion,
                    nuevosDatos.fecha_adquisicion,
                    claveCatastral
                ]
            );

            if (resultadoDR.rowCount === 0 || resultadoEI.rowCount === 0) {
                throw new Error('No se pudieron actualizar los datos registrales');
            }

            return {
                message: "Datos registrales actualizados correctamente",
                data: {
                    datoRegistral: resultadoDR.rows[0],
                    empresaInmueble: resultadoEI.rows[0]
                }
            };
        });
    }

    // ========== ACTUALIZAR HIPOTECA ==========
    async updateHipoteca(claveCatastral, bancoPrestamo, nuevosDatos) {
        console.log('🟢 Service - updateHipoteca recibido:', {
            claveCatastral,
            bancoPrestamo,
            nuevosDatos
        });

        return await this.withTransaction(async (client) => {
            console.log('🔍 Buscando hipoteca con:', { claveCatastral, bancoPrestamo });

            const hipotecaQuery = await client.query(
                `SELECT hipoteca.id, hipoteca.banco_prestamo
                 FROM inmueble_hipoteca
                 INNER JOIN hipoteca ON inmueble_hipoteca.id_hipoteca = hipoteca.id
                 WHERE inmueble_hipoteca.clave_catastral = $1 AND hipoteca.id = $2`,
                [claveCatastral, bancoPrestamo]
            );

            console.log('📊 Resultado de búsqueda:', {
                rowCount: hipotecaQuery.rowCount,
                rows: hipotecaQuery.rows
            });

            if (hipotecaQuery.rowCount === 0) {
                throw new Error(`Hipoteca del banco "${bancoPrestamo}" no encontrada para este inmueble`);
            }

            const idHipoteca = hipotecaQuery.rows[0].id;
            console.log('✅ ID encontrado:', idHipoteca);

            const resultado = await client.query(
                `UPDATE hipoteca 
                 SET banco_prestamo = $1, prestamo = $2, fecha_hipoteca = $3, cuota_hipoteca = $4
                 WHERE id = $5
                 RETURNING *`,
                [
                    nuevosDatos.banco_prestamo,
                    nuevosDatos.prestamo,
                    nuevosDatos.fecha_hipoteca,
                    nuevosDatos.cuota_hipoteca,
                    idHipoteca
                ]
            );

            console.log('✅ Hipoteca actualizada:', resultado.rows[0]);

            if (resultado.rowCount === 0) {
                throw new Error('No se pudo actualizar la hipoteca');
            }

            return {
                message: "Hipoteca actualizada correctamente",
                data: resultado.rows[0]
            };
        });
    }

    // ========== ELIMINAR INMUEBLE ==========
    async deleteInmueble(claveCatastral) {
        return await this.withTransaction(async (client) => {
            // Verificar que el inmueble existe
            const inmuebleExiste = await client.query(
                `SELECT 1 FROM inmueble WHERE clave_catastral = $1`,
                [claveCatastral]
            );

            if (inmuebleExiste.rowCount === 0) {
                throw new Error('Inmueble no encontrado');
            }

            // Eliminar relaciones primero (debido a las constraints de clave foránea)

            // 1. Eliminar hipotecas asociadas
            await client.query(
                `DELETE FROM inmueble_hipoteca WHERE clave_catastral = $1`,
                [claveCatastral]
            );

            // 2. Eliminar seguros asociados
            await client.query(
                `DELETE FROM inmueble_seguro WHERE clave_catastral = $1`,
                [claveCatastral]
            );

            // 3. Eliminar proveedores asociados
            await client.query(
                `DELETE FROM inmueble_proveedor WHERE clave_catastral = $1`,
                [claveCatastral]
            );

            // 4. Eliminar relación con empresa
            await client.query(
                `DELETE FROM empresa_inmueble WHERE clave_catastral = $1`,
                [claveCatastral]
            );

            // 5. Obtener datos del inmueble para eliminar dirección y datos registrales
            const inmuebleData = await client.query(
                `SELECT direccion, dato_registral FROM inmueble WHERE clave_catastral = $1`,
                [claveCatastral]
            );

            const { direccion, dato_registral } = inmuebleData.rows[0];

            // 6. Eliminar el inmueble
            await client.query(
                `DELETE FROM inmueble WHERE clave_catastral = $1`,
                [claveCatastral]
            );

            // 7. Eliminar dirección asociada
            await client.query(
                `DELETE FROM direccion WHERE id = $1`,
                [direccion]
            );

            // 8. Eliminar datos registrales asociados
            await client.query(
                `DELETE FROM dato_registral WHERE id_dr = $1`,
                [dato_registral]
            );

            return {
                message: "Inmueble eliminado correctamente",
                data: { clave_catastral: claveCatastral }
            };
        });
    }

    // ========== ELIMINAR SEGURO ==========
    async deleteSeguro(claveCatastral, empresaSeguro) {
        return await this.withTransaction(async (client) => {
            const seguroExiste = await client.query(
                `SELECT 1 FROM inmueble_seguro 
                 WHERE clave_catastral = $1 AND empresa_seguro = $2`,
                [claveCatastral, empresaSeguro]
            );

            if (seguroExiste.rowCount === 0) {
                throw new Error('Seguro no encontrado para este inmueble');
            }

            await client.query(
                `DELETE FROM inmueble_seguro 
                 WHERE clave_catastral = $1 AND empresa_seguro = $2`,
                [claveCatastral, empresaSeguro]
            );

            return {
                message: "Seguro eliminado correctamente",
                data: { clave_catastral: claveCatastral, empresa_seguro: empresaSeguro }
            };
        });
    }

    // ========== ELIMINAR PROVEEDOR ==========
    async deleteProveedor(claveCatastral, claveProveedor) {
        return await this.withTransaction(async (client) => {
            const proveedorExiste = await client.query(
                `SELECT 1 FROM inmueble_proveedor 
                 WHERE clave_catastral = $1 AND clave = $2`,
                [claveCatastral, claveProveedor]
            );

            if (proveedorExiste.rowCount === 0) {
                throw new Error('Proveedor no encontrado para este inmueble');
            }

            await client.query(
                `DELETE FROM inmueble_proveedor 
                 WHERE clave_catastral = $1 AND clave = $2`,
                [claveCatastral, claveProveedor]
            );

            return {
                message: "Proveedor eliminado correctamente",
                data: { clave_catastral: claveCatastral, clave: claveProveedor }
            };
        });
    }

    // ========== ELIMINAR HIPOTECA ==========
    async deleteHipoteca(claveCatastral, idHipoteca) {
        return await this.withTransaction(async (client) => {
            const hipotecaExiste = await client.query(
                `SELECT 1 FROM inmueble_hipoteca 
                 WHERE clave_catastral = $1 AND id_hipoteca = $2`,
                [claveCatastral, idHipoteca]
            );

            if (hipotecaExiste.rowCount === 0) {
                throw new Error('Hipoteca no encontrada para este inmueble');
            }

            await client.query(
                `DELETE FROM inmueble_hipoteca 
                 WHERE clave_catastral = $1 AND id_hipoteca = $2`,
                [claveCatastral, idHipoteca]
            );

            return {
                message: "Hipoteca eliminada correctamente",
                data: { clave_catastral: claveCatastral, id_hipoteca: idHipoteca }
            };
        });
    }

    async getProveedoresSegurosDetails(claveCatastral) {
        try {
            const joinsProveedor = [
                { type: 'INNER', table: 'proveedor p', on: 'inmueble_proveedor.clave = p.clave' }
            ];

            const proveedores = await this.repositories.inmuebleProveedor.BuscarConJoins(
                joinsProveedor,
                { 'inmueble_proveedor.clave_catastral': claveCatastral },
                'AND',
                ['p.clave', 'p.nombre', 'p.telefono', 'p.email', 'p.tipo_servicio']
            );

            const joinsSeguros = [
                { type: 'INNER', table: 'seguro s', on: 'inmueble_seguro.empresa_seguro = s.empresa_seguro' }
            ];

            const seguros = await this.repositories.inmuebleSeguro.BuscarConJoins(
                joinsSeguros,
                { 'inmueble_seguro.clave_catastral': claveCatastral },
                'AND',
                ['s.empresa_seguro', 's.tipo_seguro', 's.telefono', 's.email', 's.poliza']
            );

            return {
                proveedores,
                seguros
            };
        } catch (error) {
            console.error("Error al obtener proveedores y seguros:", error);
            throw new Error("No se pudo obtener la información de proveedores y seguros");
        }
    }

    async getInmuebleDetails(cif) {
        try {
            const joins = [
                { type: 'INNER', table: 'inmueble i', on: 'empresa_inmueble.clave_catastral = i.clave_catastral' },
                { type: 'INNER', table: 'direccion d', on: 'i.direccion = d.id' },
                { type: 'INNER', table: 'dato_registral dr', on: 'i.dato_registral = dr.id_dr' }
            ];

            const columnas = [
                'd.calle', 'd.numero', 'd.piso', 'd.codigo_postal', 'd.localidad',
                'empresa_inmueble.clave_catastral', 'empresa_inmueble.valor_adquisicion',
                'empresa_inmueble.fecha_adquisicion', 'dr.num_protocolo', 'dr.folio',
                'dr.hoja', 'dr.inscripcion', 'dr.notario', 'dr.fecha_inscripcion'
            ];

            return await this.repositories.empresaInmueble.BuscarConJoins(
                joins,
                { 'empresa_inmueble.cif': cif },
                'AND',
                columnas
            );
        } catch (error) {
            console.error("Error al obtener detalles del inmueble:", error);
            throw new Error("No se pudo obtener los detalles del inmueble");
        }
    }

    async getHipotecas(claveCatastral) {
        try {
            const joins = [
                { type: 'INNER', table: 'hipoteca h', on: 'inmueble_hipoteca.id_hipoteca = h.id' }
            ];

            const columnas = [
                'h.id', 'h.prestamo', 'h.banco_prestamo', 'h.fecha_hipoteca', 'h.cuota_hipoteca'
            ];

            return await this.repositories.hipoteca.BuscarConJoins(
                joins,
                { 'inmueble_hipoteca.clave_catastral': claveCatastral },
                'AND',
                columnas
            );
        } catch (error) {
            console.error("Error al obtener hipotecas:", error);
            throw new Error("No se pudo obtener las hipotecas");
        }
    }
}

export default InmuebleService;