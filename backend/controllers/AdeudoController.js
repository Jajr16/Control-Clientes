import { insertarAdeudoCompleto, obtenerAdeudosPorEmpresa } from "../services/AdeudoService.js";

export const getAdeudosByEmpresa = async (req, res) => {
  try {
    const { empresa_cif } = req.params;
    const adeudos = await obtenerAdeudosPorEmpresa(empresa_cif);
    return res.status(200).json(adeudos);
  } catch (error) {
    console.error("Error en getAdeudosByEmpresa:", error);
    return res.status(500).json({ error: "Error al obtener los adeudos." });
  }
};


export const createAdeudo = async (req, res) => {
    try {
        const { adeudo, protocolo, ajuste } = req.body;

        const resultado = await insertarAdeudoCompleto({ adeudo, protocolo, ajuste });
        res.status(201).json({ message: 'Adeudo creado correctamente', data: resultado });
    } catch (error) {
        console.error('Error en createAdeudo:', error);

        if (error.code === '23505') {
            return res.status(409).json({ error: 'Ya existe un adeudo con ese número de factura.' });
        }

        res.status(500).json({ error: 'Error al guardar el adeudo' });
    }
};
