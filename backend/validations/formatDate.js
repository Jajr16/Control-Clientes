const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

export default formatDate;