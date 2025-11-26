export function parseFecha(fechaStr) {
    const [dia, mes, anio] = fechaStr.split("/").map(Number);
    return new Date(anio, mes - 1, dia);
}

export function normalize(str) {
    return str
        .normalize("NFD")              // separa acentos
        .replace(/[\u0300-\u036f]/g, "") // elimina acentos
        .toLowerCase();                // minúsculas
}
