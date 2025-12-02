// services/apiService.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiService = {
  // Guardar adeudo - MEJORADO CON MÁS DEBUG
  async guardarAdeudo(adeudo, protocolo) {
    
    try {
      const toNull = v => (v === '' || v === undefined ? null : v);
      const payload = {
        adeudo: {
        ...adeudo,
        num_factura: toNull(adeudo?.num_factura),
        ff: toNull(adeudo?.ff),
        concepto: toNull(adeudo?.concepto),
      },
      protocolo: protocolo || null,
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

// MEJORADO: crearEntradaRmmPendiente con validación previa
async crearEntradaRmmPendiente(payload) {
  console.log('📤 Creando entrada RMM pendiente:', payload);

  // Validación local previa
  const required = ['num_entrada', 'empresa_cif', 'fecha_anticipo'];
  for (const field of required) {
    if (!payload[field] || String(payload[field]).trim() === '') {
      throw new Error(`${field} es requerido y no puede estar vacío`);
    }
  }

  // Validar formato fecha
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.fecha_anticipo)) {
    throw new Error('fecha_anticipo debe estar en formato YYYY-MM-DD');
  }

  const url = `${API_BASE_URL}/adeudos/rmm/entrada`;
  console.log(`📤 POST ${url}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json" 
      },
      body: JSON.stringify(payload),
    });
    
    const responseText = await response.text();
    console.log(`📡 Response status: ${response.status}`);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Error parsing response:', parseError);
      throw new Error(`Error del servidor (${response.status}): ${responseText}`);
    }

    if (response.status === 409) {
      console.error('❌ Conflicto - entrada RMM ya existe:', data);
      throw new Error(data.error || 'La entrada RMM ya existe');
    }

    if (response.status === 400) {
      console.error('❌ Datos inválidos:', data);
      throw new Error(data.error || data.message || 'Datos de entrada inválidos');
    }

    if (!response.ok) {
      console.error(`❌ Error ${response.status}:`, data);
      throw new Error(data.error || data.message || `Error del servidor: ${response.status}`);
    }

    console.log('✅ Entrada RMM pendiente creada:', data);
    return data;
  } catch (error) {
    if (error.message.includes('fetch')) {
      throw new Error('No se puede conectar al servidor. Verifica que el backend esté ejecutándose.');
    }
    throw error;
  }
},

  // MEJORADO: finalizarRmm con validación robusta
async finalizarRmm(payload) {
  console.log('📤 Finalizando RMM:', payload);

  // Validación local previa
  const required = ['empresa_cif', 'num_entrada', 'num_factura_final', 'ff'];
  for (const field of required) {
    if (!payload[field] || String(payload[field]).trim() === '') {
      throw new Error(`${field} es requerido y no puede estar vacío`);
    }
  }

  // Validar formato fecha
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.ff)) {
    throw new Error('ff debe estar en formato YYYY-MM-DD');
  }

  const url = `${API_BASE_URL}/adeudos/rmm/finalizar`;
  console.log(`📤 POST ${url}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json" 
      },
      body: JSON.stringify(payload),
    });
    
    const responseText = await response.text();
    console.log(`📡 Response status: ${response.status}`);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Error parsing response:', parseError);
      throw new Error(`Error del servidor (${response.status}): ${responseText}`);
    }

    if (response.status === 404) {
      console.error('❌ Entrada RMM no encontrada:', data);
      throw new Error(data.error || 'Entrada RMM no encontrada');
    }

    if (response.status === 409) {
      console.error('❌ Conflicto en finalizar RMM:', data);
      throw new Error(data.error || 'Conflicto al finalizar RMM');
    }

    if (response.status === 400) {
      console.error('❌ Datos inválidos:', data);
      throw new Error(data.error || data.message || 'Datos inválidos para finalizar RMM');
    }

    if (!response.ok) {
      console.error(`❌ Error ${response.status}:`, data);
      throw new Error(data.error || data.message || `Error del servidor: ${response.status}`);
    }

    console.log('✅ RMM finalizado exitosamente:', data);
    return data;
  } catch (error) {
    if (error.message.includes('fetch')) {
      throw new Error('No se puede conectar al servidor. Verifica que el backend esté ejecutándose.');
    }
    throw error;
  }
  },

// MEJORADO: obtenerEntradaRmm con mejor manejo de errores
async obtenerEntradaRmm(empresaCif, numEntrada) {
  if (!empresaCif?.trim() || !numEntrada?.toString().trim()) {
    console.error('obtenerEntradaRmm: Parámetros inválidos', { empresaCif, numEntrada });
    return null;
  }

  const url = `${API_BASE_URL}/adeudos/rmm/entrada/${encodeURIComponent(empresaCif.trim())}/${encodeURIComponent(numEntrada.toString().trim())}`;
  console.log(`🔍 GET ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const responseText = await response.text();
    console.log(`📡 Response status: ${response.status}`);
    console.log(`📄 Response text: ${responseText.substring(0, 200)}...`);

    if (response.status === 404) {
      console.log('🟡 Entrada RMM no encontrada (404) - esto es normal para protocolos nuevos');
      return null; // No es error, simplemente no existe
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Error parsing JSON response:', parseError);
      throw new Error(`Error del servidor (${response.status}): ${responseText}`);
    }

    if (!response.ok) {
      console.error(`❌ Error ${response.status}:`, data);
      throw new Error(data.error || data.message || `Error del servidor: ${response.status}`);
    }

    const result = data.data || data;
    console.log('✅ Entrada RMM obtenida:', result);
    return result;
    
  } catch (error) {
    if (error.message.includes('fetch')) {
      console.error('❌ Error de red en obtenerEntradaRmm');
      throw new Error('No se puede conectar al servidor. Verifica que el backend esté ejecutándose.');
    }
    console.error('❌ Error en obtenerEntradaRmm:', error);
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