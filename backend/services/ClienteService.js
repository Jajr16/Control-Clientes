import { BaseService } from './BaseService.js';
import InmuebleService from './inmuebleService.js';
import DatoRegistralService from './DatoRegistralService.js';
import DireccionService from './DireccionService.js';
import EmpresaService from './EmpresaService.js';
import PropietarioService from './PropietarioService.js';
import MovimientoService from './MovimientoService.js';
import Repositorio from '../repositories/globalPersistence.js';

class ClienteService extends BaseService {
    constructor() {
        super({
            empresaInmueble: new Repositorio('empresa_inmueble', ['cif', 'clave_catastral'])
        });
        this.inmuebleService = new InmuebleService();
        this.datoRegistralService = new DatoRegistralService();
        this.direccionService = new DireccionService();
        this.empresaService = new EmpresaService();
        this.propietarioService = new PropietarioService();
        this.movimientoService = new MovimientoService();
    }

    async crearCliente(clienteCompleto) {
        console.log(clienteCompleto)
        const cliente = clienteCompleto.cliente
        const inmuebles = clienteCompleto.inmuebles || null

        if (!cliente?.empresa || !cliente?.direccion || !cliente?.datoRegistral || !cliente?.propietario) {
            throw new Error('Datos del cliente incompletos.')
        }

        return await this.withTransaction(async (clienteBD) => {
            // INSERTAR DATO REGISTRAL
            const dato_registral = await this.datoRegistralService.crearDatoRegistral(cliente.datoRegistral, clienteBD);
            //INSERTAR DIRECCION
            const { cp, ...direccionData } = cliente.direccion;
            const direccion = await this.direccionService.crearDireccion({ ...direccionData, codigo_postal: cp }, clienteBD)
            // INSERTAR PROPIETARIO
            const propietario = await this.propietarioService.crearPropietario(cliente.propietario, clienteBD)
            // INSERTAR EMPRESA
            const { tel, ...empresaData } = cliente.empresa
            const empresa = await this.empresaService.crearEmpresa({
                ...empresaData, 
                telefono: tel, 
                direccion: direccion.id,
                dato_registral: dato_registral.id, 
                propietario: cliente.propietario.nie
            }, clienteBD);

            // SI VIENEN INMUEBLES
            if (inmuebles && inmuebles.length > 0) {
                for (const inmueble of inmuebles) {
                    const nuevoInmueble = await this.inmuebleService.nuevoInmueble(inmueble, clienteBD);
                    await this.repositories.empresaInmueble.insertar({
                        cif: empresa.cif,
                        clave_catastral: nuevoInmueble.data.clave_catastral,
                        valor_adquisicion: inmueble.datosInmueble.valor_adquisicion,
                        fecha_adquisicion: inmueble.datosInmueble.fecha_adquisicion
                    }, clienteBD);
                }
            }
            
            // Registrar movimiento
            await this.movimientoService.crearMovimiento({
                accion: 'Se agregó el cliente: ' + cliente.empresa.nombre,
                datos: {
                    empresa: cliente.empresa.cif,
                    propietario: cliente.propietario.nie
                }
            }, clienteBD);

            return {
                success: true,
                message: 'Cliente dado de alta correctamente'
            }
        })
    }

    async infoClientes() {
        try {
            const joins = [
                { type: 'INNER', table: 'propietario p', on: 'empresa.propietario = p.nie' },
                { type: 'INNER', table: 'direccion d', on: 'empresa.direccion = d.id' },
                { type: 'INNER', table: 'dato_registral dr', on: 'empresa.dato_registral = dr.id_dr' }
            ];

            const columnas = [
                'empresa.clave', 'empresa.cif', 'empresa.nombre', 'p.nie',
                'p.nombre AS propietario', 'p.telefono', 'p.email',
                'd.calle', 'd.numero', 'd.piso', 'd.codigo_postal', 'd.localidad',
                'dr.num_protocolo', 'dr.folio', 'dr.hoja', 'dr.inscripcion',
                'dr.notario', 'dr.fecha_inscripcion'
            ];

            return await this.repositories.empresa.BuscarConJoins(joins, {}, 'AND', columnas);
        } catch (error) {
            console.error("Error al obtener información de clientes:", error);
            throw new Error("No se pudo obtener la información de los clientes");
        }
    }
}

export default ClienteService;