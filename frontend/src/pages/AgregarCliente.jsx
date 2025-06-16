import React, { useEffect, useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";

import DatoRegistralForm from "../components/forms/DatoRegistralForms.jsx";
import DireccionForm from "../components/forms/DireccionForms.jsx";
import EmpresaForm from "../components/forms/EmpresaForms.jsx";
import PropietarioForm from "../components/forms/PropietarioForms.jsx";

import { getEmpresas, addEmpresas } from "../api/moduloClientes/empresas.js";
import { getDirecciones, addDirecciones } from "../api/moduloClientes/direcciones.js";
import { getPropietario, addPropietario } from "../api/moduloClientes/propietario.js";
import { getDatoRegistral, addDatoRegistral } from "../api/moduloClientes/datoRegistral.js";

const mostrarFormularioCliente = () => {

}

const AddClientesPage = () => {
    // Carga inicial para evitar errores en consola
    const [empresas, setEmpresas] = useState([]);
    const [direcciones, setDirecciones] = useState([]);
    const [propietarios, setPropietarios] = useState([]);
    const [datosRegistrales, setDatosRegistrales] = useState([]);

    //  Estados para Empresas
    const [empresa, setEmpresa] = useState({
        cif: "", clave: "", nombre: "", propietario: "", direccion: "", dato_registral: "", telefono: ""
    });

    //  Estados para Direcciones
    const [direccion, setDireccion] = useState({
        calle: "", numero: "", piso: "", codigo_postal: "", localidad: ""
    });

    //  Estados para Propietarios
    const [propietario, setPropietario] = useState({
        nie: "", nombre: "", apellido_p: "", apellido_m: "", email: "", telefono: ""
    });

    //  Estados para Datos Registrales
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

    const esNumero = (valor) => /^\d+$/.test(valor);

const handleAddEmpresaConReferencias = async (e) => {
    e.preventDefault();
    try {
        // Validación de longitud de campos
        if (empresa.clave.length > 3) {
            alert("El campo 'clave' no puede tener más de 3 caracteres.");
            return;
        }
        if (empresa.cif.length > 10) {
            alert("El campo 'cif' no puede tener más de 10 caracteres.");
            return;
        }
        if (empresa.propietario.length > 9) {
            alert("El campo 'propietario' no puede tener más de 9 caracteres.");
            return;
        }
        if (empresa.telefono.length > 10) {
            alert("El campo 'telefono' de empresa no puede tener más de 10 caracteres.");
            return;
        }
        if (propietario.telefono.length > 10) {
            alert("El campo 'telefono' del propietario no puede tener más de 10 caracteres.");
            return;
        }
        if (propietario.nie.length > 9) {
            alert("El campo 'nie' no puede tener más de 9 caracteres.");
            return;
        }

        // Validación de campos numéricos
        if (!esNumero(empresa.telefono)) {
            alert("El campo 'Teléfono de empresa' debe ser un número.");
            return;
        }
        if (!esNumero(propietario.telefono)) {
            alert("El campo 'Teléfono del propietario' debe ser un número.");
            return;
        }
        if (!esNumero(direccion.numero)) {
            alert("El campo 'Número de dirección' debe ser un número.");
            return;
        }
        if (!esNumero(direccion.codigo_postal)) {
            alert("El campo 'Código postal' debe ser un número.");
            return;
        }

        // Validación de fecha
        if (datoRegistral.fecha_inscripcion && isNaN(Date.parse(datoRegistral.fecha_inscripcion))) {
            alert("La fecha de inscripción no es válida.");
            return;
        }

        // Validación de campos vacíos
        const camposEmpresa = ["cif", "clave", "nombre", "telefono"];
        const camposDireccion = ["calle", "numero", "codigo_postal", "localidad"];
        const camposPropietario = ["nie", "nombre", "apellido_p", "apellido_m", "email", "telefono"];
        const camposRegistrales = ["num_protocolo", "folio", "hoja", "inscripcion", "notario", "fecha_inscripcion"];

        for (const campo of camposEmpresa) {
            if (!empresa[campo]) {
                alert(`El campo '${campo}' de empresa es obligatorio.`);
                return;
            }
        }
        for (const campo of camposDireccion) {
            if (!direccion[campo]) {
                alert(`El campo '${campo}' de dirección es obligatorio.`);
                return;
            }
        }
        for (const campo of camposPropietario) {
            if (!propietario[campo]) {
                alert(`El campo '${campo}' de propietario es obligatorio.`);
                return;
            }
        }
        for (const campo of camposRegistrales) {
            if (!datoRegistral[campo]) {
                alert(`El campo '${campo}' de dato registral es obligatorio.`);
                return;
            }
        }

        // Validación de unicidad del NIE
        const propietarioExistente = propietarios.find(p => p.nie === propietario.nie);
        if (propietarioExistente) {
            alert(`Ya existe un propietario con el NIE: ${propietario.nie}`);
            return;
        }
        console.log("Enviando datos al backend:");
        console.log("Empresa:", empresa);
        console.log("Dirección:", direccion);
        console.log("Propietario:", propietario);
        console.log("Dato registral:", datoRegistral);

        // Enviar al backend todo junto
        const nuevaEmpresa = await addEmpresas({
            empresa,
            direccion,
            propietario,
            datoRegistral
        });
        
        console.log("Empresa registrada en backend:", nuevaEmpresa);
        alert("Empresa agregada exitosamente");

        // Recargar datos
        await Promise.all([
            cargarEmpresas(),
            cargarDirecciones(),
            cargarPropietarios(),
            cargarDatosRegistrales()
        ]);

        // Limpiar formularios
        setEmpresa({ cif: "", clave: "", nombre: "", propietario: "", direccion: "", dato_registral: "", telefono: "" });
        setDireccion({ calle: "", numero: "", piso: "", codigo_postal: "", localidad: "" });
        setPropietario({ nie: "", nombre: "", apellido_p: "", apellido_m: "", email: "", telefono: "" });
        setDatoRegistral({ num_protocolo: "", folio: "", hoja: "", inscripcion: "", notario: "", fecha_inscripcion: "" });

    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            alert("Error: " + error.response.data.error);
            console.error("Backend dijo:", error.response.data.error);
        } else {
            console.error("Error inesperado:", error);
            alert("Ocurrió un error inesperado.");
        }
    }
};

    return (
        <div>
            {/* Formulario para agregar Empresa con Referencias */}
            <strong className="text-2xl"><center>Nuevo Cliente</center></strong>
            <div className="border border-black rounded-b-lg">
                <div className="border-b border-black flex w-full justify-between">
                    <strong className="text-xl ml-5">Datos Empresa</strong>
                    <RiArrowDownSLine className="h-6 w-6" onClick={mostrarFormularioCliente} />
                </div>
                <div className="">
                    <div className="grid grid-cols-[48%_48%] mb-4 mt-4 w-full justify-evenly">
                        <div className="border border-black rounded-md">
                            <strong className="text-lg">Empresa</strong>

                        </div>
                        <div className="border border-black rounded-md">
                            <strong className="text-lg">Propietario</strong>
                        </div>
                    </div>
                    <div></div>
                </div>
            </div>

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

export default AddClientesPage;
