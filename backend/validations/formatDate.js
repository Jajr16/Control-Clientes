export const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // meses van de 0-11
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const formatearFecha = (fecha) => {
        if (!fecha) return '';

        const date = new Date(fecha);
        const ahora = new Date();
        const diff = ahora - date;

        // Menos de 1 minuto
        if (diff < 60000) {
            return 'Hace un momento';
        }

        // Menos de 1 hora
        if (diff < 3600000) {
            const minutos = Math.floor(diff / 60000);
            return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
        }

        // Menos de 24 horas
        if (diff < 86400000) {
            const horas = Math.floor(diff / 3600000);
            return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
        }

        // Formatear fecha completa
        const opciones = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        return date.toLocaleDateString('es-ES', opciones);
    }