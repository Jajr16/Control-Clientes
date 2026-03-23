import { BaseService } from '../../services/base.service.js';
import InmuebleService from '../inmueble/inmueble.service.js';
import EmpresaService from '../empresa/empresa.service.js';
import PropietarioService from '../propietario/propietario.service.js';
import MovimientoService from '../../services/movimiento.service.js';
import Repositorio from '../../repositories/global.repository.js';

class ClienteService extends BaseService {
    constructor() {
        super({
            empresaInmueble: new Repositorio('empresa_inmueble', ['cif', 'clave_catastral']),
        });
        this.propietarioService = new PropietarioService();
        this.empresaService = new EmpresaService();
        this.inmuebleService = new InmuebleService();
        this.movimientoService = new MovimientoService();
    }

    async _crearInmuebles(inmuebles, cif, conn) {
        await Promise.all(
            inmuebles.map(inmueble =>
                this.inmuebleService.crearInmueble({ ...inmueble, empresa_cif: cif }, conn)
            )
        );
    }

    async _generarNIETemporal() {
        const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let randomPart = "";
        for (let i = 0; i < 5; i++) {
            randomPart += letras[Math.floor(Math.random() * letras.length)];
        }
        return randomPart;
    }

    async crearCliente(data) {
        const { propietario, empresa, inmuebles } = data;

        if (!propietario.nie) {
            propietario.nie = await this._generarNIETemporal();
        }

        return await this.withTransaction(async (conn) => {
            const propietario_creado = await this.propietarioService.crearPropietario(propietario, conn);

            const empresa_creada = await this.empresaService.crearEmpresa({
                ...empresa,
                propietario: propietario_creado.nie
            }, conn);
            console.log(empresa_creada)

            const tareasFinales = [
                this.movimientoService.crearMovimiento({
                    accion: `Se agregó el cliente: ${empresa_creada.nombre}`,
                    datos: { empresa: empresa_creada.cif, propietario: propietario_creado.nie }
                }, conn)
            ];

            if (inmuebles.length > 0) {
                tareasFinales.push(this._crearInmuebles(inmuebles, empresa_creada.cif, conn));
            }

            await Promise.all(tareasFinales);

            return {
                propietario: propietario_creado.nombre,
                clave_empresa: empresa_creada.clave,
                empresa: empresa_creada.nombre
            }
        })
    }

    async infoClientes() {
        return await this.empresaService.obtenerEmpresa();
    }

    async updateCliente(cifViejo, nuevosDatos) {
        return await this.withTransaction(async (client) => {
            console.log(`Actualizando cliente: ${cifViejo}`, nuevosDatos);

            const cifNuevo = nuevosDatos.cif;
            const cambiarCIF = cifNuevo && cifNuevo !== cifViejo;

            // 1. Si hay cambio de CIF
            if (cambiarCIF) {
                console.log(`Cambiando CIF de ${cifViejo} a ${cifNuevo}`);

                try {
                    const relacionesEmpresaInmueble = await this.repositories.empresaInmueble.BuscarPorFiltros(
                        { cif: cifViejo },
                        [],
                        client
                    );

                    console.log(`Encontradas ${relacionesEmpresaInmueble.length} relaciones empresa_inmueble`);

                    // Actualizar el CIF en la tabla empresa
                    await this.empresaService.actualizarCIF(cifViejo, cifNuevo, client);

                    // Actualizar cada relación empresa_inmueble si existen
                    if (relacionesEmpresaInmueble.length > 0) {
                        for (const relacion of relacionesEmpresaInmueble) {
                            await this.repositories.empresaInmueble.actualizarPorId(
                                {
                                    cif: cifViejo,
                                    clave_catastral: relacion.clave_catastral
                                },
                                { cif: cifNuevo },
                                client
                            );
                        }
                        console.log('CIF actualizado en empresa_inmueble');
                    }

                    console.log('CIF actualizado exitosamente');

                } catch (error) {
                    console.error('Error al cambiar CIF:', error);
                    throw new Error(`No se pudo cambiar el CIF: ${error.message}`);
                }
            }

            // El CIF a usar para el resto de las actualizaciones
            const cifActual = cambiarCIF ? cifNuevo : cifViejo;

            // 2. Verificar que el cliente existe 
            const empresaExiste = await this.empresaService.obtenerEmpresaPorCif(cifActual, client);
            if (!empresaExiste || empresaExiste.length === 0) {
                throw new Error('Cliente no encontrado después del cambio de CIF');
            }

            const empresaActual = empresaExiste[0];
            console.log('Empresa actual encontrada:', empresaActual);

            // 3. Actualizar otros datos de la empresa 
            const { cif, ...datosSinCIF } = nuevosDatos;
            const datosEmpresa = {};

            if (datosSinCIF.nombre !== undefined) datosEmpresa.nombre = datosSinCIF.nombre;
            if (datosSinCIF.telefono !== undefined) datosEmpresa.telefono = datosSinCIF.telefono;
            if (datosSinCIF.clave !== undefined) datosEmpresa.clave = datosSinCIF.clave;

            console.log('Datos a actualizar en empresa:', datosEmpresa);

            if (Object.keys(datosEmpresa).length > 0) {
                await this.empresaService.actualizarEmpresa(cifActual, datosEmpresa, client);
                console.log('Datos de empresa actualizados');
            }

            // 4. Actualizar dirección si hay cambios
            const camposDireccion = ['calle', 'numero', 'piso', 'codigo_postal', 'localidad'];
            const datosDireccion = {};

            for (const campo of camposDireccion) {
                if (datosSinCIF[campo] !== undefined) {
                    datosDireccion[campo] = datosSinCIF[campo];
                }
            }

            if (Object.keys(datosDireccion).length > 0 && empresaActual.direccion) {
                await this.direccionService.actualizarDireccion(empresaActual.direccion, datosDireccion, client);
                console.log('Dirección actualizada');
            }

            // 5. Actualizar propietario si hay cambios
            if ((datosSinCIF.propietario !== undefined || datosSinCIF.nie !== undefined || datosSinCIF.email !== undefined) && empresaActual.propietario) {
                const datosPropietario = {};
                if (datosSinCIF.propietario !== undefined) datosPropietario.nombre = datosSinCIF.propietario;
                if (datosSinCIF.nie !== undefined) datosPropietario.nie = datosSinCIF.nie;
                if (datosSinCIF.email !== undefined) datosPropietario.email = datosSinCIF.email;

                if (Object.keys(datosPropietario).length > 0) {
                    await this.propietarioService.actualizarPropietario(empresaActual.propietario, datosPropietario, client);
                    console.log('Propietario actualizado');
                }
            }

            // 6. Actualizar datos registrales si hay cambios
            const camposRegistrales = ['num_protocolo', 'folio', 'hoja', 'inscripcion', 'notario', 'fecha_inscripcion'];
            const datosRegistrales = {};

            for (const campo of camposRegistrales) {
                if (datosSinCIF[campo] !== undefined) {
                    datosRegistrales[campo] = datosSinCIF[campo];
                }
            }

            if (Object.keys(datosRegistrales).length > 0 && empresaActual.dato_registral) {
                await this.datoRegistralService.actualizarDatoRegistralPorId(empresaActual.dato_registral, datosRegistrales, client);
                console.log('Datos registrales actualizados');
            }

            // 7. Registrar movimiento
            await this.movimientoService.crearMovimiento({
                accion: `Se actualizó el cliente: ${datosSinCIF.nombre || empresaActual.nombre} ${cambiarCIF ? `(CIF cambiado de ${cifViejo} a ${cifNuevo})` : ''}`,
            }, client);

            console.log('Movimiento registrado');

            return {
                message: "Cliente actualizado correctamente" + (cambiarCIF ? ` - CIF cambiado de ${cifViejo} a ${cifNuevo}` : ''),
                data: {
                    cif_viejo: cifViejo,
                    cif_nuevo: cifActual
                }
            };
        });
    }
}

export default ClienteService;