import React, { useState, useEffect } from "react";
import { 
    getInmuebleDetails, 
    getInmuebleHipotecas, 
    updateSeguro, 
    updateProveedor, 
    updateDatosRegistrales, 
    updateHipoteca,
    deleteSeguro,
    deleteProveedor,
    deleteHipoteca,
    deleteInmueble 
} from "../../api/moduloInmuebles/inmueble";
import {
    MapPinIcon, IdentificationIcon, ClipboardDocumentListIcon, ShieldCheckIcon,
    LifebuoyIcon, BuildingOfficeIcon, PhoneIcon, AtSymbolIcon, CurrencyEuroIcon,
    CalendarDaysIcon, ChevronDownIcon, ChevronRightIcon, PencilIcon, CheckIcon, XMarkIcon,
    TrashIcon
} from "@heroicons/react/24/solid";

const InmuebleDetails = ({ 
    inmueble, 
    setProveedoresSegurosList, 
    proveedoresList, 
    setHipotecas, 
    HipotecasList,
    onInmuebleDeleted
}) => {
    const [segurosCollapsed, setSegurosCollapsed] = useState(true);
    const [proveedoresCollapsed, setProveedoresCollapsed] = useState(true);
    const [hipotecasCollapsed, setHipotecasCollapsed] = useState(true);
    const [datosRegistralesCollapsed, setDatosRegistralesCollapsed] = useState(true);
    
    // Estados para el modo de edición global
    const [globalEditMode, setGlobalEditMode] = useState(false);
    
    // Estados para almacenar todos los valores temporales durante la edición
    const [editValues, setEditValues] = useState({
        seguros: [],
        proveedores: [],
        datosRegistrales: {},
        hipotecas: []
    });

    useEffect(() => {
        if (!inmueble) {
            setProveedoresSegurosList(null);
            return;
        }

        async function fetchHipotecas(CC) {
            try {
                const response = await getInmuebleHipotecas(CC);
                setHipotecas(response.data)
                return response
            } catch (error) {
                console.error("Error en fetchHipotecas:", error)
                return null
            }
        }

        async function fetchProveedoresSeguros(CC) {
            try {
                const response = await getInmuebleDetails(CC);
                setProveedoresSegurosList(response.data);
                return response;
            } catch (error) {
                console.error("Error en fetchProveedoresSeguros:", error);
                return null;
            }
        }

        fetchProveedoresSeguros(inmueble.clave_catastral);
        fetchHipotecas(inmueble.clave_catastral);
    }, [inmueble]);

    // Función para eliminar el inmueble completo
    const handleDeleteInmueble = async () => {
        if (!inmueble) return;
        
        if (!window.confirm(
            `¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE este inmueble?\n\n` +
            `INMUEBLE: ${inmueble.calle} ${inmueble.numero}, ${inmueble.localidad}\n` +
            `CLAVE: ${inmueble.clave_catastral}\n\n` +
            `Esta acción eliminará TODOS los datos del inmueble incluyendo:\n` +
            `• Seguros asociados\n` +
            `• Proveedores asociados\n` +
            `• Hipotecas asociadas\n` +
            `• Datos registrales\n\n` +
            `¡ESTA ACCIÓN NO SE PUEDE DESHACER!`
        )) {
            return;
        }

        try {
            await deleteInmueble(inmueble.clave_catastral);
            
            // Notificar al componente padre que el inmueble fue eliminado
            if (onInmuebleDeleted) {
                onInmuebleDeleted(inmueble.clave_catastral);
            }
            
            alert('Inmueble eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar inmueble:', error);
            alert('Error al eliminar el inmueble: ' + (error.response?.data?.message || error.message));
        }
    };

    // Funciones para eliminar elementos individuales
    const handleDeleteSeguro = async (empresaSeguro) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar el seguro de ${empresaSeguro}?`)) {
            return;
        }

        try {
            await deleteSeguro(inmueble.clave_catastral, empresaSeguro);
            
            // Actualizar la lista local
            if (proveedoresList) {
                const nuevosSeguros = proveedoresList.seguros.filter(
                    seguro => seguro.empresa_seguro !== empresaSeguro
                );
                setProveedoresSegurosList({
                    ...proveedoresList,
                    seguros: nuevosSeguros
                });
            }
            
            alert('Seguro eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar seguro:', error);
            alert('Error al eliminar el seguro: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteProveedor = async (claveProveedor, nombreProveedor) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar el proveedor ${nombreProveedor}?`)) {
            return;
        }

        try {
            await deleteProveedor(inmueble.clave_catastral, claveProveedor);
            
            // Actualizar la lista local
            if (proveedoresList) {
                const nuevosProveedores = proveedoresList.proveedores.filter(
                    proveedor => proveedor.clave !== claveProveedor
                );
                setProveedoresSegurosList({
                    ...proveedoresList,
                    proveedores: nuevosProveedores
                });
            }
            
            alert('Proveedor eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar proveedor:', error);
            alert('Error al eliminar el proveedor: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteHipoteca = async (idHipoteca, bancoPrestamo) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar la hipoteca del banco ${bancoPrestamo}?`)) {
            return;
        }

        try {
            await deleteHipoteca(inmueble.clave_catastral, idHipoteca);
            
            // Actualizar la lista local
            if (HipotecasList) {
                const nuevasHipotecas = HipotecasList.filter(
                    hipoteca => hipoteca.id !== idHipoteca
                );
                setHipotecas(nuevasHipotecas);
            }
            
            alert('Hipoteca eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar hipoteca:', error);
            alert('Error al eliminar la hipoteca: ' + (error.response?.data?.message || error.message));
        }
    };

    // Iniciar edición global
    const startGlobalEdit = () => {
        setGlobalEditMode(true);
        setEditValues({
            seguros: proveedoresList?.seguros ? [...proveedoresList.seguros] : [],
            proveedores: proveedoresList?.proveedores ? [...proveedoresList.proveedores] : [],
            datosRegistrales: inmueble ? { ...inmueble } : {},
            hipotecas: HipotecasList ? [...HipotecasList] : []
        });
    };

    // Cancelar edición global
    const cancelGlobalEdit = () => {
        setGlobalEditMode(false);
        setEditValues({
            seguros: [],
            proveedores: [],
            datosRegistrales: {},
            hipotecas: []
        });
    };

    // Guardar todos los cambios
    const saveAllChanges = async () => {
        try {
            // Guardar datos registrales
            if (editValues.datosRegistrales) {
                await updateDatosRegistrales(inmueble.clave_catastral, {
                    num_protocolo: editValues.datosRegistrales.num_protocolo,
                    folio: editValues.datosRegistrales.folio,
                    hoja: editValues.datosRegistrales.hoja,
                    inscripcion: editValues.datosRegistrales.inscripcion,
                    notario: editValues.datosRegistrales.notario,
                    fecha_inscripcion: editValues.datosRegistrales.fecha_inscripcion,
                    valor_adquisicion: editValues.datosRegistrales.valor_adquisicion,
                    fecha_adquisicion: editValues.datosRegistrales.fecha_adquisicion
                });
            }

            // Guardar seguros
            for (const seguro of editValues.seguros) {
                await updateSeguro(inmueble.clave_catastral, seguro.empresa_seguro, {
                    tipo_seguro: seguro.tipo_seguro,
                    telefono: seguro.telefono,
                    email: seguro.email,
                    poliza: seguro.poliza
                });
            }

            // Guardar proveedores
            for (const proveedor of editValues.proveedores) {
                await updateProveedor(inmueble.clave_catastral, proveedor.clave, {
                    tipo_servicio: proveedor.tipo_servicio,
                    nombre: proveedor.nombre,
                    telefono: proveedor.telefono,
                    email: proveedor.email
                });
            }

            // Guardar hipotecas
            for (const hipoteca of editValues.hipotecas) {
                await updateHipoteca(inmueble.clave_catastral, hipoteca.id, {
                    banco_prestamo: hipoteca.banco_prestamo,
                    prestamo: hipoteca.prestamo,
                    fecha_hipoteca: hipoteca.fecha_hipoteca,
                    cuota_hipoteca: hipoteca.cuota_hipoteca
                });
            }

            // Actualizar estados locales
            if (proveedoresList) {
                setProveedoresSegurosList({
                    ...proveedoresList,
                    seguros: editValues.seguros,
                    proveedores: editValues.proveedores
                });
            }
            
            if (HipotecasList) {
                setHipotecas(editValues.hipotecas);
            }

            setGlobalEditMode(false);
            alert('Todos los cambios guardados correctamente');
            
        } catch (error) {
            console.error('Error al guardar todos los cambios:', error);
            alert('Error al guardar: ' + (error.response?.data?.message || error.message));
        }
    };

    // Actualizar valores durante la edición
    const updateEditValue = (section, field, value, index = null) => {
        setEditValues(prev => {
            if (section === 'datosRegistrales') {
                return {
                    ...prev,
                    datosRegistrales: { ...prev.datosRegistrales, [field]: value }
                };
            } else {
                const newSection = [...prev[section]];
                if (index !== null) {
                    newSection[index] = { ...newSection[index], [field]: value };
                }
                return { ...prev, [section]: newSection };
            }
        });
    };

    // Función colapsar y expandir secciones
    const renderCollapsibleHeader = (title, count, isCollapsed, setCollapsed) => {
        const shouldShowToggle = count > 0;
        
        return (
            <div 
                className={`flex items-center justify-between mb-4 ${shouldShowToggle ? 'cursor-pointer hover:bg-gray-50 p-2 rounded' : ''}`}
                onClick={shouldShowToggle ? () => setCollapsed(!isCollapsed) : undefined}
            >
                <h4 className="text-2xl font-bold">{title}</h4>
                {shouldShowToggle && (
                    <div className="flex items-center text-sm text-gray-600">
                        {isCollapsed ? (
                            <ChevronRightIcon className="h-5 w-5" />
                        ) : (
                            <ChevronDownIcon className="h-5 w-5" />
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Componente para renderizar campo editable
    const EditableField = ({ value, field, section, index, type = "text", className = "" }) => {
        if (!globalEditMode) {
            if (type === "date" && value) {
                return <span className={className}>{new Date(value).toLocaleDateString('es-ES')}</span>;
            }
            if (type === "number" && value) {
                return <span className={className}>{value.toLocaleString('de-DE')}</span>;
            }
            return <span className={className}>{value}</span>;
        }

        const currentValue = section === 'datosRegistrales' 
            ? editValues.datosRegistrales?.[field] || value
            : editValues[section]?.[index]?.[field] || value;

        return (
            <input
                type={type}
                value={currentValue || ''}
                onChange={(e) => updateEditValue(section, field, e.target.value, index)}
                className={`border border-gray-300 rounded px-2 py-1 ${className}`}
            />
        );
    };

    // Botones globales de edición y eliminación
    const GlobalActionButtons = () => {
        if (globalEditMode) {
            return (
                <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                        onClick={saveAllChanges}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center"
                    >
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Guardar Todo
                    </button>
                    <button
                        onClick={cancelGlobalEdit}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center"
                    >
                        <XMarkIcon className="h-5 w-5 mr-2" />
                        Cancelar
                    </button>
                </div>
            );
        }

        return (
            <div className="absolute top-4 right-4 flex space-x-2">
                <button
                    onClick={startGlobalEdit}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center"
                >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Editar Inmueble
                </button>
                <button
                    onClick={handleDeleteInmueble}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center"
                    title="Eliminar inmueble completo"
                >
                    <TrashIcon className="h-5 w-5 mr-2" />
                    Eliminar Inmueble
                </button>
            </div>
        );
    };

    return (
        <div className="absolute flex w-[68%] h-full p-2">
            <div className="relative w-full h-full flex flex-col border border-black p-2">
                {/* Botones globales de acción */}
                <GlobalActionButtons />
                
                <div className={`w-full h-full p-3 ${proveedoresList == null ? null : "bg-white"} overflow-y-auto`}>

                    {/* Contenedor flexible para Seguros, Proveedores y el nuevo div */}
                    <div className="flex flex-col h-full space-y-6">
                        
                        {/* Contenedor de Seguros */}
                        <div>
                            {renderCollapsibleHeader(
                                "Seguros", 
                                proveedoresList?.seguros?.length || 0, 
                                segurosCollapsed, 
                                setSegurosCollapsed
                            )}
                            
                            {proveedoresList?.seguros?.length === 0 ? (
                                <div className="text-gray-600 italic">El inmueble no cuenta con ningún seguro.</div>
                            ) : (
                                !segurosCollapsed && (
                                    <div className="space-y-3">
                                        {proveedoresList.seguros.map((seguro, index) => (
                                            <div className="border border-black rounded-xl p-2" key={index}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 grid grid-cols-3 gap-4">
                                                        <div className="flex items-center bg-gray-100 p-3">
                                                            <ShieldCheckIcon className="h-6 w-6 mr-2" />
                                                            <EditableField 
                                                                value={seguro.tipo_seguro} 
                                                                field="tipo_seguro" 
                                                                section="seguros" 
                                                                index={index}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-100 p-3">
                                                            <BuildingOfficeIcon className="h-6 w-6 mr-2" />
                                                            <EditableField 
                                                                value={seguro.empresa_seguro} 
                                                                field="empresa_seguro" 
                                                                section="seguros" 
                                                                index={index}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-100 p-3">
                                                            <PhoneIcon className="h-6 w-6 mr-2" />
                                                            <EditableField 
                                                                value={seguro.telefono} 
                                                                field="telefono" 
                                                                section="seguros" 
                                                                index={index}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-200 p-3">
                                                            <AtSymbolIcon className="h-6 w-6 mr-2" />
                                                            <EditableField 
                                                                value={seguro.email} 
                                                                field="email" 
                                                                section="seguros" 
                                                                index={index}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-200 p-3">
                                                            <ClipboardDocumentListIcon className="h-6 w-6" />
                                                            <b className="mr-2">POLIZA:</b> 
                                                            <EditableField 
                                                                value={seguro.poliza} 
                                                                field="poliza" 
                                                                section="seguros" 
                                                                index={index}
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* Botón eliminar seguro - SIEMPRE VISIBLE */}
                                                    <button
                                                        onClick={() => handleDeleteSeguro(seguro.empresa_seguro)}
                                                        className="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors duration-200"
                                                        title="Eliminar seguro"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>

                        {/* Contenedor de Proveedores */}
                        <div>
                            {renderCollapsibleHeader(
                                "Proveedores", 
                                proveedoresList?.proveedores?.length || 0, 
                                proveedoresCollapsed, 
                                setProveedoresCollapsed
                            )}
                            
                            {proveedoresList?.proveedores?.length === 0 ? (
                                <div className="text-gray-600 italic">El inmueble no cuenta con ningún proveedor.</div>
                            ) : (
                                !proveedoresCollapsed && (
                                    <div className="space-y-3">
                                        {proveedoresList.proveedores.map((proveedor, index) => (
                                            <div className="border border-black rounded-xl p-2" key={index}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                                        <div className="flex items-center bg-gray-100 p-3">
                                                            <ShieldCheckIcon className="h-6 w-6 mr-2" />
                                                            <EditableField 
                                                                value={proveedor.tipo_servicio} 
                                                                field="tipo_servicio" 
                                                                section="proveedores" 
                                                                index={index}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-100 p-3">
                                                            <BuildingOfficeIcon className="h-6 w-6 mr-2" />
                                                            <EditableField 
                                                                value={proveedor.nombre} 
                                                                field="nombre" 
                                                                section="proveedores" 
                                                                index={index}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-100 p-3">
                                                            <PhoneIcon className="h-6 w-6 mr-2" />
                                                            <EditableField 
                                                                value={proveedor.telefono} 
                                                                field="telefono" 
                                                                section="proveedores" 
                                                                index={index}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-200 p-3">
                                                            <AtSymbolIcon className="h-6 w-6 mr-2" />
                                                            <EditableField 
                                                                value={proveedor.email} 
                                                                field="email" 
                                                                section="proveedores" 
                                                                index={index}
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* Botón eliminar proveedor - SIEMPRE VISIBLE */}
                                                    <button
                                                        onClick={() => handleDeleteProveedor(proveedor.clave, proveedor.nombre)}
                                                        className="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors duration-200"
                                                        title="Eliminar proveedor"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>

                        {/* Sección de los datos registrales del inmueble */}
                        {inmueble && (
                            <div>
                                {renderCollapsibleHeader(
                                    "Datos Registrales", 
                                    1,
                                    datosRegistralesCollapsed, 
                                    setDatosRegistralesCollapsed
                                )}
                                
                                {!datosRegistralesCollapsed && (
                                    <div className="border border-black rounded-xl p-2">
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="flex items-center bg-gray-100 p-3">
                                                <b className="mr-2">Clave catastral:</b>
                                                <EditableField 
                                                    value={inmueble.clave_catastral} 
                                                    field="clave_catastral" 
                                                    section="datosRegistrales"
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-100 p-3">
                                                <b className="mr-2">Protocolo:</b>
                                                <EditableField 
                                                    value={inmueble.num_protocolo} 
                                                    field="num_protocolo" 
                                                    section="datosRegistrales"
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-100 p-3">
                                                <b className="mr-2">Folio:</b>
                                                <EditableField 
                                                    value={inmueble.folio} 
                                                    field="folio" 
                                                    section="datosRegistrales"
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-100 p-3">
                                                <b className="mr-2">Hoja:</b>
                                                <EditableField 
                                                    value={inmueble.hoja} 
                                                    field="hoja" 
                                                    section="datosRegistrales"
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-3">
                                                <b className="mr-2">Inscripción:</b>
                                                <EditableField 
                                                    value={inmueble.inscripcion} 
                                                    field="inscripcion" 
                                                    section="datosRegistrales"
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-3">
                                                <b className="mr-2">Fecha Ins.:</b>
                                                <EditableField 
                                                    value={inmueble.fecha_inscripcion} 
                                                    field="fecha_inscripcion" 
                                                    section="datosRegistrales"
                                                    type="date"
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-3">
                                                <b className="mr-2">Notario:</b> 
                                                <EditableField 
                                                    value={inmueble.notario} 
                                                    field="notario" 
                                                    section="datosRegistrales"
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-3">
                                                <b className="mr-2">Fecha adquisición:</b>
                                                <EditableField 
                                                    value={inmueble.fecha_adquisicion} 
                                                    field="fecha_adquisicion" 
                                                    section="datosRegistrales"
                                                    type="date"
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-3">
                                                <b className="mr-2">Valor adquisición:</b>
                                                <EditableField 
                                                    value={inmueble.valor_adquisicion} 
                                                    field="valor_adquisicion" 
                                                    section="datosRegistrales"
                                                    type="number"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Sección para hipotecas */}
                        <div>
                            {renderCollapsibleHeader(
                                "Hipotecas", 
                                HipotecasList?.length || 0, 
                                hipotecasCollapsed, 
                                setHipotecasCollapsed
                            )}
                            
                            {(HipotecasList === null || HipotecasList.length === 0) ? (
                                <div className="text-gray-600 italic">El inmueble no tiene hipotecas.</div>
                            ) : (
                                !hipotecasCollapsed && (
                                    <div className="space-y-3">
                                        {HipotecasList.map((hipoteca, index) => (
                                            <div className="border border-black rounded-xl p-2" key={index}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 grid grid-cols-4 gap-4">
                                                        <div className="flex items-center bg-gray-100 p-3">
                                                            <b className="mr-2">Banco:</b>
                                                            <EditableField 
                                                                value={hipoteca.banco_prestamo} 
                                                                field="banco_prestamo" 
                                                                section="hipotecas" 
                                                                index={index}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-100 p-3">
                                                            <b className="mr-2">Prestamo:</b>
                                                            <EditableField 
                                                                value={hipoteca.prestamo} 
                                                                field="prestamo" 
                                                                section="hipotecas" 
                                                                index={index}
                                                                type="number"
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-200 p-3">
                                                            <b className="mr-2">Fecha Prestamo:</b>
                                                            <EditableField 
                                                                value={hipoteca.fecha_hipoteca} 
                                                                field="fecha_hipoteca" 
                                                                section="hipotecas" 
                                                                index={index}
                                                                type="date"
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-100 p-3">
                                                            <b className="mr-2">Cuota:</b>
                                                            <EditableField 
                                                                value={hipoteca.cuota_hipoteca} 
                                                                field="cuota_hipoteca" 
                                                                section="hipotecas" 
                                                                index={index}
                                                                type="number"
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* Botón eliminar hipoteca - SIEMPRE VISIBLE */}
                                                    <button
                                                        onClick={() => handleDeleteHipoteca(hipoteca.id, hipoteca.banco_prestamo)}
                                                        className="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors duration-200"
                                                        title="Eliminar hipoteca"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InmuebleDetails;