import ClienteService from "../services/ClienteService.js";

class ClienteController {
    constructor() {
        this.clienteService = new ClienteService();
    }

    async infoClientes(req, res) {
        try {
            const resultados = await this.clienteService.infoClientes();
            res.status(200).json(resultados);
        } catch (error) {
            console.error("Error en infoClientes:", error);
            res.status(500).json({ error: "Error al obtener la información de los clientes" });
        }
    }
}

export default ClienteController