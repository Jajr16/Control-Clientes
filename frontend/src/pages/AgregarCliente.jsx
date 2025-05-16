import React, { useEffect, useState } from "react";

import { Card, Button, Input, Label, Message } from "../components/UI";

import DatoRegistralForm from "../components/forms/DatoRegistralForms.jsx";
import DireccionForm from "../components/forms/DireccionForms.jsx";
import EmpresaForm from "../components/forms/EmpresaForms.jsx";
import PropietarioForm from "../components/forms/PropietarioForms.jsx";

import { getEmpresas, addEmpresas } from "../api/moduloClientes/empresas.js";
import { getDirecciones, addDirecciones } from "../api/moduloClientes/direcciones.js";
import { getPropietario, addPropietario } from "../api/moduloClientes/propietario.js";
import { getDatoRegistral, addDatoRegistral } from "../api/moduloClientes/datoRegistral.js";

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

    const handleAddEmpresaConReferencias = async (e) => {
        e.preventDefault();
        try {
            // Insertar Dirección y obtener el ID
            const nuevaDireccion = await addDirecciones(direccion);

            // Insertar Propietario y obtener el NIE
            const nuevoPropietario = await addPropietario(propietario);

            // Insertar Datos Registrales y obtener el ID
            const nuevoDatoRegistral = await addDatoRegistral(datoRegistral);

            // Insertar Empresa con las claves correctas
            await addEmpresas({
                ...empresa,
                propietario: nuevoPropietario.nie,
                direccion: nuevaDireccion.id,
                dato_registral: nuevoDatoRegistral.id_dr
            });

            //  Recargar datos
            cargarEmpresas();
            cargarDirecciones();
            cargarPropietarios();
            cargarDatosRegistrales();


            // Limpiar los estados
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
            <Card>

                <h1 className="text-2xl font-bold mb-4">Agregar Cliente</h1>

                <form onSubmit={handleAddEmpresaConReferencias}>

                    <div className="mb-4">

                        <Label htmlFor="nombreempresa"> Empresa </Label>
                        {["cif", "clave", "nombre", "telefono"].map(field => (
                            <input key={field} type="text" name={field} placeholder={field} value={empresa[field]} onChange={(e) => setEmpresa(prev => ({ ...prev, [field]: e.target.value }))} />
                        ))}
                        <Label htmlFor="nombreempresa"> Propietario </Label>
                        <Input type="text" name="propietario" placeholder="Escribe el propietario" autoFocus/>

                        <Label htmlFor="nombreempresa"> Dirección </Label>
                        <Input type="text" name="direccion" placeholder="Escribe la dirección" autoFocus/>

                        <Label htmlFor="nombreempresa"> Dato Registral </Label>
                        <Input type="text" name="dato_registral" placeholder="Escribe el dato registral" autoFocus/>

                        <Label htmlFor="nombredireccion"> Dirección </Label>
                        {["calle", "numero", "piso", "codigo_postal", "localidad"].map(field => (
                            <input key={field} type="text" name={field} placeholder={field} value={direccion[field]} onChange={(e) => setDireccion(prev => ({ ...prev, [field]: e.target.value }))} />
                        ))}

                        <Label htmlFor="nombrepropietario"> Propietario </Label>
                        {["nie", "nombre", "apellido_p", "apellido_m", "email", "telefono"].map(field => (
                            <input key={field} type="text" name={field} placeholder={field} value={propietario[field]} onChange={(e) => setPropietario(prev => ({ ...prev, [field]: e.target.value }))} />
                        ))}

                        <Label htmlFor="nombredatoreg"> Dato Registral </Label>
                        {["num_protocolo", "folio", "hoja", "inscripcion", "notario", "fecha_inscripcion"].map(field => (
                            <input key={field} type={field === "fecha_inscripcion" ? "date" : "text"} name={field} placeholder={field} value={datoRegistral[field]} onChange={(e) => setDatoRegistral(prev => ({ ...prev, [field]: e.target.value }))} />
                        ))}

                    </div>

                    <Button> Agregar Datos </Button>

                </form>

            </Card>
            
        </div>
    );
};

export default AddClientesPage;
