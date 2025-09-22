export function parseFecha(fechaStr) {
    const [dia, mes, anio] = fechaStr.split("/").map(Number);
    return new Date(anio, mes - 1, dia);
}