import InmuebleService from "../services/inmuebleService.js";

class InmuebleController {
    constructor() {
        this.inmuebleService = new InmuebleService();
    }

    async insertar(req, res) {
        try {
            const nuevoInmueble = await this.inmuebleService.nuevoInmueble(req.body)
            res.status(201).json(nuevoInmueble);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default InmuebleController;