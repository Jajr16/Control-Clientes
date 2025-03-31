import InmuebleService from "../services/inmuebleService.js";

class InmuebleController {
    constructor() {
        this.inmuebleService = new InmuebleService();
    }

    async insertar(req, res) {
        try {
            console.log(req.body)
            const nuevoInmueble = await this.inmuebleService.nuevoInmueble(req.body)
            res.status(201).json(nuevoInmueble);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getInmuebleDetails(req, res) {
        try {
            const { cif } = req.params;
            const resultados = await this.inmuebleService.getInmuebleDetails(cif);

            res.status(200).json(resultados);
        } catch (error) {
            console.error("Error en infoClientes:", error);
            res.status(500).json({ error: "Error al obtener la información de los clientes" });
        }
    }

    async getProveedoresSegurosDetails(req, res) {
        try {
            const { cc } = req.params;
            
            const resultados = await this.inmuebleService.getProveedoresSegurosDetails(cc);

            res.status(200).json(resultados);
        } catch (error) {
            console.error("Error en infoClientes:", error);
            res.status(500).json({ error: "Error al obtener la información de los clientes" });
        }
    }
}

export default InmuebleController;