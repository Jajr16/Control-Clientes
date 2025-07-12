import AdeudoService from "../services/AdeudoService.js";

const servicioAdeudos = new AdeudoService();

const getAdeudos = async (req, res) => {
    try {
        const resultado = await servicioAdeudos.obtenerAdeudos();
        res.status(200).json(resultado);
    } catch (error) {
        console.error("Error al obtener adeudos:", error);
        res.status(500).json({ error: "Error interno al obtener los adeudos" });
    }
};

const createAdeudo = async (req, res) => {
    try {
        const nuevo = await servicioAdeudos.crearAdeudo(req.body);
        res.status(201).json(nuevo);
    } catch (error) {
        console.error("Error al crear adeudo:", error);
        res.status(500).json({ error: "Error interno al crear adeudo" });
    }
};

export default {
    getAdeudos,
    createAdeudo
};
