

export const addInmueble = async (inmueble) => {
    const res = await axios.post(`${API_URL}/inmueble`, inmueble);
    return res.data;
}