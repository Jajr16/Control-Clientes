import { BaseService } from "../../services/base.service.js";
import Repositorio from "../../repositories/global.repository.js";
import { ConflictError, NotFoundError } from "../../errors/AppError.js"

export default class DireccionService extends BaseService {
    constructor() {
        super({
            direccion: new Repositorio('direccion', 'id'),
        })
    }

    async crearDireccion(data, client = null) {
        return await this.execWithClient(async (conn) => {
            await this.validarExistencia('direccion', {
                calle: data.calle,
                numero: data.numero,
                piso: data.piso,
                codigo_postal: data.cp,
                localidad: data.localidad
            }, client)

            return await this.repositories.direccion.insertar(data, conn);
        }, client);
    }

    async eliminarDireccion(idDireccion, client = null) {
        return await this.execWithClient(async (conn) => {
            const direccionExiste = await this.repositories.direccion.ExistePorId(
                { id: idDireccion },
                conn
            );

            if (!direccionExiste) {
                throw new Error('Dirección no encontrada');
            }

            const otrosUsos = await this.repositories.inmueble.contar(
                { direccion: idDireccion },
                conn
            );

            if (otrosUsos > 0) {
                throw new Error('No se puede eliminar la dirección porque está siendo usada por otros inmuebles');
            }

            await this.repositories.direccion.eliminarPorId(
                { id: idDireccion },
                conn
            );

            return {
                message: "Dirección eliminada correctamente",
                data: { id: idDireccion }
            };
        }, client);
    }

    async actualizarDireccion(idDireccion, nuevosDatos, client = null) {
        return await this.execWithClient(async (conn) => {
            //Verificar que la dirección existe
            const direccionExiste = await this.repositories.direccion.ExistePorId({ id: idDireccion }, conn);
            if (!direccionExiste) {
                throw new Error('Dirección no encontrada');
            }

            return await this.repositories.direccion.actualizarPorId(
                { id: idDireccion },
                nuevosDatos,
                conn
            );
        }, client);
    }


}