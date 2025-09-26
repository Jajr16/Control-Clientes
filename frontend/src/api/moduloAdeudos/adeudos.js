import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getAdeudos = async () => {
    const res = await axios.get(`${API_URL}/adeudos`);
    return res.data;
};

export const addAdeudo = async (adeudo) => {
    const res = await axios.post(`${API_URL}/adeudos`, adeudo);
    return res.data;
};

export const getAdeudoEmpresa = async (empresa, { agrupado = false, incluir_liquidados = true } = {}) => {
    const res = await axios.get(`${API_URL}/adeudos/empresa/${empresa}`, {
        params: { agrupado, incluir_liquidados }
    });
    return res.data;
};

export const updateAdeudos = async (cambios) => {
    const res = await axios.post(`${API_URL}/adeudos/update`, cambios)
    return res.data
}

export const deleteAdeudos = async (cambios) => {
    const res = await axios.post(`${API_URL}/adeudos/delete`, cambios)
    return res.data
}

export const createExcel = async (empresa, nombreEmpresa) => {
    try {
        const res = await axios.get(
            `${API_URL}/adeudos/historial/${empresa}`,
            { responseType: "blob" } // 🔑 importante
        );

        // Crear un blob con la respuesta
        const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const hoy = new Date();
        const fechaFormateada = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
        const horaFormateada = `${hoy.getHours().toString().padStart(2, '0')}-${hoy.getMinutes().toString().padStart(2, '0')}`;

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Histórico_${nombreEmpresa}_${fechaFormateada}_${horaFormateada}.xlsx`; // Nombre dinámico
        document.body.appendChild(link);
        link.click();

        // Liberar memoria
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error descargando Excel:", error);
    }
};