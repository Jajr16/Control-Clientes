import Repositorio from "../repositories/globalPersistence.js";

class AdeudoService {
    constructor() {
        this.repositorioAdeudos = new Repositorio("adeudo", "id_adeudo"); // Asegúrate que esta tabla exista y tenga esa PK
    }

    async obtenerAdeudos() {
        return await this.repositorioAdeudos.ObtenerTodos();
    }

    async crearAdeudo(datos) {
        return await this.repositorioAdeudos.insertar(datos);
    }
}

export default AdeudoService;
