import React, { useState, useEffect } from "react";

// Hook personalizado para calcular dimensiones disponibles
const useLayoutDimensions = () => {
    const [dimensions, setDimensions] = useState({
        availableHeight: 'calc(100vh - 60px)', // Valor inicial conservativo
        availableWidth: 'calc(100vw - 80px)',  // Valor inicial conservativo
        sidebarWidth: 80
    });

    useEffect(() => {
        const calculateDimensions = () => {
            const width = window.innerWidth;
            
            // Altura disponible (100vh - navbar)
            let navbarHeight = 44; // Base móvil
            if (width >= 640) navbarHeight = 48; // sm
            if (width >= 1024) navbarHeight = 56; // lg+
            
            // Ancho del sidebar según breakpoint
            let sidebarWidth = 0;
            if (width >= 1024) { // lg
                sidebarWidth = width >= 1280 ? 80 : 64; // xl : lg
            }
            
            setDimensions({
                availableHeight: `calc(100vh - ${navbarHeight}px)`,
                availableWidth: sidebarWidth > 0 ? `calc(100vw - ${sidebarWidth}px)` : '100vw',
                sidebarWidth
            });
        };

        calculateDimensions();
        window.addEventListener('resize', calculateDimensions);
        return () => window.removeEventListener('resize', calculateDimensions);
    }, []);

    return dimensions;
};