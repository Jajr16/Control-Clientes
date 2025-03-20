import React, { useEffect, useState } from "react";
import { 
    getEmpresas, addEmpresas, 
    getDirecciones, addDirecciones, 
    getPropietario, addPropietario, 
    getDatoRegistral, addDatoRegistral 
} from "./api/api.js";

const App = () => {
    //  Estados para Empresas
    const [empresas, setEmpresas] = useState([]);
    const [empresa, setEmpresa] = useState({
        cif: "", clave: "", nombre: "", propietario: "", direccion: "", dato_registral: "", telefono: ""
    });

    //  Estados para Direcciones
    const [direcciones, setDirecciones] = useState([]);
    const [direccion, setDireccion] = useState({
        calle: "", numero: "", piso: "", codigo_postal: "", localidad: ""
    });

    //  Estados para Propietarios
    const [propietarios, setPropietarios] = useState([]);
    const [propietario, setPropietario] = useState({
        nie: "", nombre: "", apellido_p: "", apellido_m: "", email: "", telefono: ""
    });

    //  Estados para Datos Registrales
    const [datosRegistrales, setDatosRegistrales] = useState([]);
    const [datoRegistral, setDatoRegistral] = useState({
        num_protocolo: "", folio: "", hoja: "", inscripcion: "", notario: "", fecha_inscripcion: ""
    });

    // Cargar datos al iniciar
    useEffect(() => {
        cargarEmpresas();
        cargarDirecciones();
        cargarPropietarios();
        cargarDatosRegistrales();
    }, []);

    // Funciones para obtener datos
    const cargarEmpresas = async () => { setEmpresas(await getEmpresas()); };
    const cargarDirecciones = async () => { setDirecciones(await getDirecciones()); };
    const cargarPropietarios = async () => { setPropietarios(await getPropietario()); };
    const cargarDatosRegistrales = async () => { setDatosRegistrales(await getDatoRegistral()); };

    // Función para insertar datos en orden correcto
    const handleAddEmpresaConReferencias = async (e) => {
        e.preventDefault();
        try {
            //  Insertar Dirección y obtener el ID
            const nuevaDireccion = await addDirecciones({
                calle: direccion.calle,
                numero: direccion.numero,
                piso: direccion.piso,
                codigo_postal: direccion.codigo_postal,
                localidad: direccion.localidad
            });

            // Insertar Propietario y obtener el NIE
            const nuevoPropietario = await addPropietario({
                nie: propietario.nie,
                nombre: propietario.nombre,
                apellido_p: propietario.apellido_p,
                apellido_m: propietario.apellido_m,
                email: propietario.email,
                telefono: propietario.telefono
            });

            // Insertar Datos Registrales y obtener el ID
            const nuevoDatoRegistral = await addDatoRegistral({
                num_protocolo: datoRegistral.num_protocolo,
                folio: datoRegistral.folio,
                hoja: datoRegistral.hoja,
                inscripcion: datoRegistral.inscripcion,
                notario: datoRegistral.notario,
                fecha_inscripcion: datoRegistral.fecha_inscripcion
            });

            // Insertar Empresa con las claves correctas
            await addEmpresas({
                cif: empresa.cif,
                clave: empresa.clave,
                nombre: empresa.nombre,
                propietario: nuevoPropietario.nie, // Usamos el NIE insertado
                direccion: nuevaDireccion.id, // Usamos el ID insertado
                dato_registral: nuevoDatoRegistral.id_dr, // Usamos el ID insertado
                telefono: empresa.telefono
            });

            //  Recargar datos
            cargarEmpresas();
            cargarDirecciones();
            cargarPropietarios();
            cargarDatosRegistrales();

            //  Limpiar los estados
            setEmpresa({ cif: "", clave: "", nombre: "", propietario: "", direccion: "", dato_registral: "", telefono: "" });
            setDireccion({ calle: "", numero: "", piso: "", codigo_postal: "", localidad: "" });
            setPropietario({ nie: "", nombre: "", apellido_p: "", apellido_m: "", email: "", telefono: "" });
            setDatoRegistral({ num_protocolo: "", folio: "", hoja: "", inscripcion: "", notario: "", fecha_inscripcion: "" });

        } catch (error) {
            console.error("Error al agregar empresa con referencias:", error);
        }
    };

    return (
        <div>

            {/* Formulario para agregar Empresa con Referencias */}
            <h2>Agregar Datos Yeah</h2>
            <form onSubmit={handleAddEmpresaConReferencias}>
                <h3>Empresa</h3>
                {["cif", "clave", "nombre", "telefono"].map(field => (
                    <input key={field} type="text" name={field} placeholder={field} value={empresa[field]} onChange={(e) => setEmpresa(prev => ({ ...prev, [field]: e.target.value }))} />
                ))}
                <input type="text" name="propietario" placeholder="Propietario"/>
                <input type="text" name="direccion" placeholder="Dirección"/>
                <input type="text" name="dato_registral" placeholder="Dato Registral"/>

                <h3>Dirección</h3>
                {["calle", "numero", "piso", "codigo_postal", "localidad"].map(field => (
                    <input key={field} type="text" name={field} placeholder={field} value={direccion[field]} onChange={(e) => setDireccion(prev => ({ ...prev, [field]: e.target.value }))} />
                ))}

                <h3>Propietario</h3>
                {["nie", "nombre", "apellido_p", "apellido_m", "email", "telefono"].map(field => (
                    <input key={field} type="text" name={field} placeholder={field} value={propietario[field]} onChange={(e) => setPropietario(prev => ({ ...prev, [field]: e.target.value }))} />
                ))}

                <h3>Dato Registral</h3>
                {["num_protocolo", "folio", "hoja", "inscripcion", "notario", "fecha_inscripcion"].map(field => (
                    <input key={field} type={field === "fecha_inscripcion" ? "date" : "text"} name={field} placeholder={field} value={datoRegistral[field]} onChange={(e) => setDatoRegistral(prev => ({ ...prev, [field]: e.target.value }))} />
                ))}

                <button type="submit">Agregar Datos</button>
            </form>
        </div>
    );
};

export default App;
