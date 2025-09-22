import React, { useEffect, useState } from "react";

export const Extendible = () => {
    // Info Adeudo (Expendible)
    const [expandedRows, setExpandedRows] = useState(new Set([]));

    // Funciones para Expandible
    const isRMM = (proveedor) => {
        return proveedor?.toLowerCase() === 'registro mercantil de madrid' || proveedor?.toLowerCase() === 'registro mercantíl de madrid'
    }

    const toggleExpansion = (rowId) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(rowId)) {
            newExpanded.delete(rowId)
        } else {
            newExpanded.add(rowId)
        }

        setExpandedRows(newExpanded)
    }

    return {
        // Estados
        expandedRows,

        // Funciones
        isRMM,
        toggleExpansion
    }
}

