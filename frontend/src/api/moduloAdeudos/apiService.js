// services/apiService.js

const API_BASE_URL = 'http://localhost:3000/api';

export const apiService = {
    // Guardar adeudo
    async guardarAdeudo(adeudo, protocolo) {
        const response = await fetch(`${API_BASE_URL}/adeudos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                adeudo,
                protocolo
            })
        });

        if (response.status === 409) {
            const errorData = await response.json();
            throw new Error(errorData.error || "El número de factura ya existe.");
        }

        if (!response.ok) throw new Error("Error al guardar el adeudo");

        return response.json();
    },

    // Obtener adeudos por empresa
    async obtenerAdeudosPorEmpresa(empresaId) {
        const response = await fetch(`${API_BASE_URL}/adeudos/empresa/${empresaId}`);
        if (!response.ok) throw new Error("Error al obtener adeudos");

        return response.json();
    },

    // Verificar adeudos pendientes
    async verificarAdeudosPendientes(empresaCif) {
        const response = await fetch(`${API_BASE_URL}/adeudos/empresa/${empresaCif}/check-pendientes`);

        if (!response.ok) {
            throw new Error("Error al verificar adeudos pendientes");
        }

        const data = await response.json();
        return data.data;
    },

    // Crear liquidación
    async crearLiquidacion(empresaCif, honorariosSinIVA) {
        const response = await fetch(`${API_BASE_URL}/liquidaciones`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                empresa_cif: empresaCif,
                honorarios_sin_iva: parseFloat(honorariosSinIVA)
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al crear la liquidación");
        }

        const resultado = await response.json();
        return resultado.data;
    },

    // Obtener adeudos liquidados
    async obtenerAdeudosLiquidados(empresaCif, numeroLiquidacion) {
        const response = await fetch(`${API_BASE_URL}/liquidaciones/${empresaCif}/${numeroLiquidacion}`);
        const data = await response.json();
        return data.data;
    }
};