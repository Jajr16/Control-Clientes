import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, X, Building, Home, FileText, Shield, DollarSign } from "lucide-react";

import DatoRegistralForm from "../../components/forms/DatoRegistralForms.jsx";
import DireccionForm from "../../components/forms/DireccionForms.jsx";
import EmpresaForm from "../../components/forms/EmpresaForms.jsx";
import PropietarioForm from "../../components/forms/PropietarioForms.jsx";
import InmuebleForm from "../../components/forms/InmuebleForms.jsx";
import InmuebleHipotecaForm from "../../components/forms/InmuebleHipotecaForms.jsx";
import InmuebleProveedorForm from "../../components/forms/InmuebleProveedorForms.jsx";
import InmuebleSeguroForm from "../../components/forms/InmuebleSeguroForms.jsx";
import { SeccionColapsable } from "../../components/elements/SeccionCollapse.jsx";
import { manejarLogicaCliente } from "../../hooks/operacionesClienteForm.js";

import { limpiarDatosVacios } from '../../utils/limpiarDatos.js';

import Swal from 'sweetalert2';

const AddClientesPage = () => {

    const {
        datosEmpresa, setDatosEmpresa,
        dirEmpresa, setDirEmpresa,
        datoRegistralEmpresa, setDatoRegistralEmpresa,
        datosPropietario, setDatosPropietario,
        erroresValidacion,
        manejarFormularioCliente
    } = manejarLogicaCliente();

    // Estados de inmuebles (array de objetos completos)
    const [inmuebles, setInmuebles] = useState([]);

    // Control de UI
    const [seccionesAbiertas, setSeccionesAbiertas] = useState({
        cliente: true,
        inmuebles: false
    });
    const [inmuebleExpandido, setInmuebleExpandido] = useState(null);
    const [errores, setErrores] = useState({});
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    // Validación de cliente
    const validarCliente = () => {
        const nuevosErrores = {};

        if (!datosEmpresa.cif || !datosEmpresa.nombre || !datosEmpresa.tel || !datosEmpresa.clave) {
            nuevosErrores.empresa = "Completa todos los campos de la empresa";
        }

        if (!datosPropietario.nie || !datosPropietario.nombre || !datosPropietario.email || !datosPropietario.telefono) {
            nuevosErrores.propietario = "Completa todos los campos del propietario";
        }

        if (!dirEmpresa.calle || !dirEmpresa.numero || !dirEmpresa.piso || !dirEmpresa.cp || !dirEmpresa.localidad) {
            nuevosErrores.direccion = "Completa todos los campos de dirección";
        }

        if (!datoRegistralEmpresa.num_protocolo || !datoRegistralEmpresa.folio || !datoRegistralEmpresa.hoja ||
            !datoRegistralEmpresa.inscripcion || !datoRegistralEmpresa.notario || !datoRegistralEmpresa.fecha_inscripcion) {
            nuevosErrores.datoRegistral = "Completa todos los datos registrales";
        }

        return nuevosErrores;
    };

    // Validación de inmueble
    const validarInmueble = (inmueble) => {
        if (!inmueble.datosInmueble?.datoRegistralInmueble || !inmueble.datosInmueble?.dirInmueble) {
            return "Si agregas un inmueble, sus datos registrales son obligatorios";
        }
        return null;
    };

    // Funciones para manejar inmuebles
    const agregarInmueble = () => {
        const nuevoInmueble = {
            id: Date.now(),
            datosInmueble: {},
            proveedores: [],
            hipotecas: [],
            seguros: []
        };
        setInmuebles([...inmuebles, nuevoInmueble]);
        setInmuebleExpandido(nuevoInmueble.id);
    };

    const eliminarInmueble = (id) => {
        setInmuebles(inmuebles.filter(i => i.id !== id));
        if (inmuebleExpandido === id) {
            setInmuebleExpandido(null);
        }
    };

    const actualizarInmueble = (id, campo, valor) => {
        setInmuebles(inmuebles.map(i =>
            i.id === id ? { ...i, [campo]: valor } : i
        ));
    };

    // Funciones para proveedores, hipotecas y seguros
    const agregarItem = (inmuebleId, tipo) => {
        setInmuebles(inmuebles.map(i =>
            i.id === inmuebleId
                ? { ...i, [tipo]: [...i[tipo], { id: Date.now() }] }
                : i
        ));
    };

    const actualizarItem = (inmuebleId, tipo, itemId, datos) => {
        setInmuebles(inmuebles.map(i =>
            i.id === inmuebleId
                ? {
                    ...i,
                    [tipo]: i[tipo].map(item =>
                        item.id === itemId ? { ...item, ...datos } : item
                    )
                }
                : i
        ));
    };

    const eliminarItem = (inmuebleId, tipo, itemId) => {
        setInmuebles(inmuebles.map(i =>
            i.id === inmuebleId
                ? { ...i, [tipo]: i[tipo].filter(item => item.id !== itemId) }
                : i
        ));
    };

    const handleSubmit = async () => {
        // Validar cliente
        const erroresCliente = validarCliente();
        if (Object.keys(erroresCliente).length > 0) {
            setErrores(erroresCliente);
            setMensaje({ tipo: 'error', texto: 'Completa todos los campos obligatorios del cliente' });
            return;
        }

        // Validar inmuebles si existen
        for (const inmueble of inmuebles) {
            const errorInmueble = validarInmueble(inmueble);
            if (errorInmueble) {
                setMensaje({ tipo: 'error', texto: errorInmueble });
                return;
            }
        }

        // Preparar datos para enviar
        const datosCompletos = {
            cliente: {
                empresa: datosEmpresa,
                direccion: dirEmpresa,
                datoRegistral: datoRegistralEmpresa,
                propietario: datosPropietario
            },
            inmuebles: inmuebles
        };

        // ✨ Limpiar datos vacíos antes de enviar
        const datosLimpios = limpiarDatosVacios(datosCompletos);

        console.log('Datos a guardar:', datosLimpios);

        const response = await manejarFormularioCliente(datosLimpios);

        Swal.fire({
            icon: 'success',
            title: '¡Cliente creado!',
            text: response.data.message || 'El cliente se creó correctamente',
            confirmButtonText: 'OK'
        }).then((result) => {
            if (result.isConfirmed) {
                // Limpiar formulario
                setDatosEmpresa({});
                setDirEmpresa({});
                setDatoRegistralEmpresa({});
                setDatosPropietario({});
                setInmuebles([]);
                setErrores({});
            }
        });
    };

    useEffect(() => {
        // Datos iniciales de ejemplo
        const empresaDemo = {
            cif: "ABC123456",
            nombre: "Empresa Demo S.A.",
            tel: "555478512",
            clave: "DEM"
        };

        const direccionDemo = {
            calle: "Av. Reforma",
            numero: "123",
            piso: "4",
            cp: "06000",
            localidad: "Ciudad de México"
        };

        const datoRegistralDemo = {
            num_protocolo: "45678",
            folio: "2025",
            hoja: "01",
            inscripcion: "12345",
            notario: "Lic. Juan Pérez",
            fecha_inscripcion: "2025-10-29"
        };

        const propietarioDemo = {
            nie: "X9876543B",
            nombre: "José Alfredo Jiménez Rodríguez",
            email: "jajr0316@gmail.com",
            telefono: "551245678"
        };

        // Llenar estados del formulario
        setDatosEmpresa(empresaDemo);
        setDirEmpresa(direccionDemo);
        setDatoRegistralEmpresa(datoRegistralDemo);
        setDatosPropietario(propietarioDemo);

        // Si quieres también agregar un inmueble demo automáticamente:
        const inmuebleDemo = {
            id: Date.now(),
            datosInmueble: {
                clave_catastral: "CP3344",
                valor_adquisicion: 40000,
                fecha_adquisicion: "2025-10-29",
                datoRegistralInmueble: {
                    num_protocolo: "78910",
                    folio: "890",
                    hoja: "02",
                    inscripcion: "45678",
                    notario: "Lic. Laura Gómez",
                    fecha_inscripcion: "2025-10-29"
                },
                dirInmueble: {
                    calle: "Calle de los Rosales",
                    numero: "25",
                    piso: 2,
                    cp: "28040",
                    localidad: "Madrid"
                }
            },
            proveedores: [
                { clave_proveedor: 'c1', nombre: 'Pedrito Sola', servicio: 'Agua', tel_proveedor: '412578631', email_proveedor: 'ps@gmail.com' }
            ],
            hipotecas: [
                {
                    prestamo: 10000,
                    banco: 'Banorte',
                    cuota: 45.2,
                    fecha_hipoteca: '2025-10-29'
                }
            ],
            seguros: [
                {
                    aseguradora: 'Panchitos',
                    tipo_seguro: 'Luz',
                    poliza: '14',
                    telefono_seguro: '854216795',
                    email_seguro: 'LuzPanchito@gmail.com'
                }
            ]
        };

        setInmuebles([inmuebleDemo]);

    }, []);

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white">
            <h1 className="text-3xl font-bold text-center mb-6">Nuevo Cliente</h1>

            {mensaje.texto && (
                <div className={`p-4 mb-4 rounded ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {mensaje.texto}
                </div>
            )}

            {/* SECCIÓN CLIENTE (OBLIGATORIA) */}
            <SeccionColapsable
                titulo="Datos del Cliente"
                icono={Building}
                abierto={seccionesAbiertas.cliente}
                onToggle={() => setSeccionesAbiertas({ ...seccionesAbiertas, cliente: !seccionesAbiertas.cliente })}
                obligatorio={true}
            >
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                    {/* Empresa y Dirección */}
                    <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Building className="w-5 h-5" />
                                Empresa <span className="text-red-500">*</span>
                            </h3>

                            <EmpresaForm
                                empresa={datosEmpresa}
                                setEmpresa={setDatosEmpresa}
                                errores={erroresValidacion}
                            />

                            <h3 className="font-semibold text-lg mt-6 mb-3">Dirección <span className="text-red-500">*</span></h3>

                            <DireccionForm
                                direccion={dirEmpresa}
                                setDireccion={setDirEmpresa}
                                errores={erroresValidacion}
                            />
                        </div>
                    </div>

                    {/* Propietario */}
                    <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-3">Propietario <span className="text-red-500">*</span></h3>

                            <PropietarioForm
                                propietario={datosPropietario}
                                setPropietario={setDatosPropietario}
                                errores={erroresValidacion}
                            />
                        </div>
                    </div>

                    {/* Datos Registrales (span completo) */}
                    <div className="lg:col-span-1">
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Datos Registrales de la Empresa <span className="text-red-500">*</span>
                            </h3>

                            <DatoRegistralForm
                                datoRegistral={datoRegistralEmpresa}
                                setDatoRegistral={setDatoRegistralEmpresa}
                                errores={erroresValidacion}
                            />
                        </div>
                    </div>
                </div>
            </SeccionColapsable>

            {/* SECCIÓN INMUEBLES (OPCIONAL) */}
            <SeccionColapsable
                titulo={`Inmuebles (${inmuebles.length})`}
                icono={Home}
                abierto={seccionesAbiertas.inmuebles}
                onToggle={() => setSeccionesAbiertas({ ...seccionesAbiertas, inmuebles: !seccionesAbiertas.inmuebles })}
                obligatorio={false}
            >
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-gray-600 text-sm">Los inmuebles son opcionales, pero si agregas uno, sus datos registrales son obligatorios</p>
                        <button
                            onClick={agregarInmueble}
                            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar Inmueble
                        </button>
                    </div>

                    {inmuebles.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            No hay inmuebles agregados
                        </div>
                    )}

                    {inmuebles.map((inmueble, idx) => (
                        <div key={inmueble.id} className="border-2 rounded-lg overflow-hidden">
                            {/* Header del inmueble */}
                            <div className="bg-gray-50 p-4 flex items-center justify-between">
                                <button
                                    onClick={() => setInmuebleExpandido(inmuebleExpandido === inmueble.id ? null : inmueble.id)}
                                    className="flex items-center gap-2 flex-1 text-left"
                                >
                                    <Home className="w-5 h-5" />
                                    <span className="font-semibold">Inmueble {idx + 1}</span>
                                    {inmueble.datosInmueble?.clave_catastral && (
                                        <span className="text-sm text-gray-500">- {inmueble.datosInmueble.clave_catastral}</span>
                                    )}
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                        {inmueble.proveedores.length} proveedores, {inmueble.hipotecas.length} hipotecas, {inmueble.seguros.length} seguros
                                    </span>
                                    <button
                                        onClick={() => eliminarInmueble(inmueble.id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    {inmuebleExpandido === inmueble.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                            </div>

                            {/* Contenido expandible */}
                            {inmuebleExpandido === inmueble.id && (
                                <div className="p-4 space-y-6">
                                    {/* Datos del inmueble */}
                                    <div className="border rounded-lg p-4 bg-blue-50">
                                        <h4 className="font-semibold mb-3">Datos Inmueble <span className="text-red-500">*</span></h4>

                                        <InmuebleForm
                                            inmueble={inmueble.datosInmueble}
                                            setInmueble={(datos) => actualizarInmueble(inmueble.id, 'datosInmueble', datos)}
                                            errores={erroresValidacion}
                                            indice={idx}
                                        />
                                    </div>

                                    {/* Proveedores */}
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-semibold flex items-center gap-2">
                                                <Building className="w-4 h-4" />
                                                Proveedores ({inmueble.proveedores.length})
                                            </h4>
                                            <button
                                                onClick={() => agregarItem(inmueble.id, 'proveedores')}
                                                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                            >
                                                + Agregar
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {inmueble.proveedores.map((proveedor, provIdx) => (
                                                <InmuebleProveedorForm
                                                    key={proveedor.id}
                                                    proveedor={proveedor}
                                                    setProveedor={(datos) => actualizarItem(inmueble.id, 'proveedores', proveedor.id, datos)}
                                                    onRemove={() => eliminarItem(inmueble.id, 'proveedores', proveedor.id)}
                                                    errores={erroresValidacion}
                                                    inmuebleIdx={idx}
                                                    proveedorIdx={provIdx}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hipotecas */}
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-semibold flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                Hipotecas ({inmueble.hipotecas.length})
                                            </h4>
                                            <button
                                                onClick={() => agregarItem(inmueble.id, 'hipotecas')}
                                                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                            >
                                                + Agregar
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {inmueble.hipotecas.map((hipoteca, hipidx) => (
                                                <InmuebleHipotecaForm
                                                    key={hipoteca.id}
                                                    hipoteca={hipoteca}
                                                    setHipoteca={(datos) => actualizarItem(inmueble.id, 'hipotecas', hipoteca.id, datos)}
                                                    onRemove={() => eliminarItem(inmueble.id, 'hipotecas', hipoteca.id)}
                                                    errores={erroresValidacion}
                                                    inmuebleIdx={idx}
                                                    hipotecaIdx={hipidx}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Seguros */}
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-semibold flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                Seguros ({inmueble.seguros.length})
                                            </h4>
                                            <button
                                                onClick={() => agregarItem(inmueble.id, 'seguros')}
                                                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                            >
                                                + Agregar
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {inmueble.seguros.map((seguro, segidx) => (
                                                <InmuebleSeguroForm
                                                    key={seguro.id}
                                                    seguro={seguro}
                                                    setSeguro={(datos) => actualizarItem(inmueble.id, 'seguros', seguro.id, datos)}
                                                    onRemove={() => eliminarItem(inmueble.id, 'seguros', seguro.id)}
                                                    errores={erroresValidacion}
                                                    inmuebleIdx={idx}
                                                    seguroIdx={segidx}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </SeccionColapsable>

            {/* Botón de guardar */}
            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
                >
                    Guardar Cliente
                </button>
            </div>
        </div>
    );
};

export default AddClientesPage;