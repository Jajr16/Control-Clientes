// services/apiService.js
const API_BASE_URL = "http://localhost:3000/api";

export const apiService = {
  // Guardar adeudo - MEJORADO CON MÁS DEBUG
  async guardarAdeudo(adeudo, protocolo) {
    
    try {
      const payload = {
        adeudo,
        protocolo
      };

      const response = await fetch(`${API_BASE_URL}/adeudos`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      // Leer el cuerpo de la respuesta una sola vez
      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing response JSON:", parseError);
        throw new Error(`Error del servidor (${response.status}): ${responseText}`);
      }

      // Manejo específico de diferentes códigos de error
      if (response.status === 409) {
        console.error("Error 409 - Conflicto:", responseData);
        throw new Error(responseData.error || "El número de factura ya existe.");
      }

      if (response.status === 400) {
        console.error("Error 400 - Datos inválidos:", responseData);
        throw new Error(responseData.error || responseData.message || "Datos de entrada inválidos");
      }

      if (response.status === 500) {
        console.error("Error 500 - Error interno del servidor:", responseData);
        console.error("Esto generalmente indica un problema en el backend.");
        console.error("Revisa los logs del servidor para más detalles.");
        throw new Error(responseData.error || responseData.message || "Error interno del servidor");
      }

      if (!response.ok) {
        console.error(`Error ${response.status}:`, responseData);
        const errorMessage = responseData.error || responseData.message || `Error del servidor (${response.status})`;
        throw new Error(errorMessage);
      }
      
      return responseData;

    } catch (error) {
      console.error("=== apiService.guardarAdeudo ERROR DETALLADO ===");
      console.error("Error completo:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      // Si es un error de fetch (red)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error("Error de red - el servidor no está disponible o hay problemas de conectividad");
        throw new Error("No se puede conectar al servidor. Verifica que el backend esté ejecutándose.");
      }
      
      console.error("===============================================");
      throw error;
    }
  },

  // Obtener adeudos por empresa - CON MEJOR DEBUG
  async obtenerAdeudos(empresaId) {
    
    try {
      const url = `${API_BASE_URL}/adeudos/empresa/${empresaId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error ${response.status} al obtener adeudos:`, errorText);
        throw new Error(`Error al obtener adeudos (${response.status}): ${errorText}`);
      }

      const responseText = await response.text();
      const data = JSON.parse(responseText);
      
      if (data && data.adeudos) {
        console.log("Estructura con adeudos detectada:");
        console.log("- adeudos:", data.adeudos.length, "elementos");
        console.log("- anticipo:", data.anticipo?.length || 0, "elementos");
        console.log("- resumen:", data.resumen);
      }
      
      return data;
      
    } catch (error) {
      console.error("=== Error obteniendo adeudos ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      console.error("==============================");
      throw error;
    }
  },

  // Verificar adeudos pendientes
  async verificarAdeudosPendientes(empresaCif) {
    const response = await fetch(`${API_BASE_URL}/adeudos/empresa/${empresaCif}/check-pendientes`);
    if (!response.ok) throw new Error("Error al verificar adeudos pendientes");
    return response.json();
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

    return response.json();
  },

  // Obtener liquidación específica
  async obtenerLiquidacion(empresaCif, numeroLiquidacion) {
    const response = await fetch(`${API_BASE_URL}/liquidaciones/${empresaCif}/${numeroLiquidacion}`);
    if (!response.ok) throw new Error("Error al obtener liquidación");
    return response.json();
  }
};