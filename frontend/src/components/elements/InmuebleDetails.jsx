import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
    getInmuebleDetails, 
    getInmuebleHipotecas, 
    updateSeguro, 
    updateProveedor, 
    updateDatosRegistrales, 
    updateHipoteca,
    deleteSeguro,
    deleteProveedor,
    deleteHipoteca
} from "../../api/moduloInmuebles/inmueble";
import {
    MapPinIcon, IdentificationIcon, ClipboardDocumentListIcon, ShieldCheckIcon,
    LifebuoyIcon, BuildingOfficeIcon, PhoneIcon, AtSymbolIcon, CurrencyEuroIcon,
    CalendarDaysIcon, ChevronDownIcon, ChevronRightIcon, PencilIcon, CheckIcon, XMarkIcon,
    TrashIcon
} from "@heroicons/react/24/solid";

const EditableField = React.memo(({ 
    value, 
    onChange, 
    type = "text", 
    className = "", 
    isIdentifier = false,
    globalEditMode,
    ...props 
}) => {
    const inputRef = React.useRef(null);

    const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';
        try {
            const date = new Date(dateValue);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return '';
        }
    };

    if (!globalEditMode || isIdentifier) {
        if (type === "date" && value) {
            return <span className={className}>{new Date(value).toLocaleDateString('es-ES')}</span>;
        }
        if (type === "number" && value) {
            return <span className={className}>{value.toLocaleString('de-DE')}</span>;
        }
        return <span className={className}>{value || ''}</span>;
    }

    const displayValue = type === "date" ? formatDateForInput(value) : (value || '');

    return (
        <input
            ref={inputRef}
            type={type}
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            onFocus={(e) => e.target.select()}
            className={`border border-gray-300 rounded px-2 py-1 ${className} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            autoComplete="off"
            {...props}
        />
    );
}, (prevProps, nextProps) => {
    return prevProps.value === nextProps.value && 
           prevProps.globalEditMode === nextProps.globalEditMode &&
           prevProps.isIdentifier === nextProps.isIdentifier;
});

EditableField.displayName = 'EditableField';

const InmuebleDetails = ({ 
    inmueble, 
    setProveedoresSegurosList, 
    proveedoresList, 
    setHipotecas, 
    HipotecasList,
    onInmuebleUpdated
}) => {
    const [segurosCollapsed, setSegurosCollapsed] = useState(true);
    const [proveedoresCollapsed, setProveedoresCollapsed] = useState(true);
    const [hipotecasCollapsed, setHipotecasCollapsed] = useState(true);
    const [datosRegistralesCollapsed, setDatosRegistralesCollapsed] = useState(true);
    
    const [globalEditMode, setGlobalEditMode] = useState(false);
    const [inmuebleLocal, setInmuebleLocal] = useState(inmueble);

    const [editSeguros, setEditSeguros] = useState([]);
    const [editProveedores, setEditProveedores] = useState([]);
    const [editDatosRegistrales, setEditDatosRegistrales] = useState({});
    const [editHipotecas, setEditHipotecas] = useState([]);

    useEffect(() => {
        if (!globalEditMode) {
            setInmuebleLocal(inmueble);
        }
    }, [inmueble, globalEditMode]);

    useEffect(() => {
        if (!inmuebleLocal) {
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

        fetchProveedoresSeguros(inmuebleLocal.clave_catastral);
        fetchHipotecas(inmuebleLocal.clave_catastral);
    }, [inmuebleLocal?.clave_catastral, setProveedoresSegurosList, setHipotecas]);

    // ✅ FUNCIONES DELETE OPTIMIZADAS
    const handleDeleteSeguro = useCallback(async (poliza, empresaSeguro) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar el seguro de ${empresaSeguro}?`)) {
            return;
        }

        try {
            await deleteSeguro(inmuebleLocal.clave_catastral, poliza);
            
            if (proveedoresList) {
                const nuevosSeguros = proveedoresList.seguros.filter(
                    seguro => seguro.poliza !== poliza
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
    }, [inmuebleLocal?.clave_catastral, proveedoresList, setProveedoresSegurosList]);

    const handleDeleteProveedor = useCallback(async (claveProveedor, nombreProveedor) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar el proveedor ${nombreProveedor}?`)) {
            return;
        }

        try {
            await deleteProveedor(inmuebleLocal.clave_catastral, claveProveedor);
            
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
    }, [inmuebleLocal?.clave_catastral, proveedoresList, setProveedoresSegurosList]);

    const handleDeleteHipoteca = useCallback(async (idHipoteca, bancoPrestamo) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar la hipoteca del banco ${bancoPrestamo}?`)) {
            return;
        }

        try {
            await deleteHipoteca(inmuebleLocal.clave_catastral, idHipoteca);
            
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
    }, [inmuebleLocal?.clave_catastral, HipotecasList, setHipotecas]);

    const startGlobalEdit = useCallback(() => {
        setGlobalEditMode(true);
        
        const nuevosSeguros = proveedoresList?.seguros ? proveedoresList.seguros.map(seguro => ({...seguro})) : [];
        const nuevosProveedores = proveedoresList?.proveedores ? proveedoresList.proveedores.map(prov => ({...prov})) : [];
        
        setEditSeguros(nuevosSeguros);
        setEditProveedores(nuevosProveedores);
        setEditDatosRegistrales(inmuebleLocal ? { ...inmuebleLocal } : {});
        setEditHipotecas(HipotecasList ? HipotecasList.map(hip => ({...hip})) : []);
    }, [proveedoresList, inmuebleLocal, HipotecasList]);

    const cancelGlobalEdit = useCallback(() => {
        setGlobalEditMode(false);
        setEditSeguros([]);
        setEditProveedores([]);
        setEditDatosRegistrales({});
        setEditHipotecas([]);
    }, []);

    const saveAllChanges = useCallback(async () => {
        try {
            if (editDatosRegistrales) {
                await updateDatosRegistrales(inmuebleLocal.clave_catastral, {
                    num_protocolo: editDatosRegistrales.num_protocolo,
                    folio: editDatosRegistrales.folio,
                    hoja: editDatosRegistrales.hoja,
                    inscripcion: editDatosRegistrales.inscripcion,
                    notario: editDatosRegistrales.notario,
                    fecha_inscripcion: editDatosRegistrales.fecha_inscripcion,
                    valor_adquisicion: editDatosRegistrales.valor_adquisicion,
                    fecha_adquisicion: editDatosRegistrales.fecha_adquisicion
                });

                const nuevoInmueble = {
                    ...inmuebleLocal,
                    ...editDatosRegistrales
                };
                setInmuebleLocal(nuevoInmueble);
                
                if (onInmuebleUpdated) {
                    onInmuebleUpdated(nuevoInmueble);
                }
            }

            // Guardar seguros
            for (const seguro of editSeguros) {
                await updateSeguro(inmuebleLocal.clave_catastral, seguro.poliza, {
                    tipo_seguro: seguro.tipo_seguro,
                    telefono: seguro.telefono,
                    email: seguro.email,
                    empresa_seguro: seguro.empresa_seguro,
                    poliza: seguro.poliza
                });
            }

            // Guardar proveedores
            for (const proveedor of editProveedores) {
                await updateProveedor(inmuebleLocal.clave_catastral, proveedor.clave, {
                    tipo_servicio: proveedor.tipo_servicio,
                    nombre: proveedor.nombre,
                    telefono: proveedor.telefono,
                    email: proveedor.email
                });
            }

            // Guardar hipotecas
            for (const hipoteca of editHipotecas) {
                await updateHipoteca(inmuebleLocal.clave_catastral, hipoteca.id, {
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
                    seguros: editSeguros,
                    proveedores: editProveedores
                });
            }
            
            if (HipotecasList) {
                setHipotecas(editHipotecas);
            }

            setGlobalEditMode(false);
            
            // Usar setTimeout para mostrar el alert después de que React actualice
            setTimeout(() => {
                alert('Todos los cambios guardados correctamente');
            }, 0);
            
        } catch (error) {
            console.error('Error al guardar todos los cambios:', error);
            setGlobalEditMode(false);
            setTimeout(() => {
                alert('Error al guardar: ' + (error.response?.data?.message || error.message));
            }, 0);
        }
    }, [editDatosRegistrales, editSeguros, editProveedores, editHipotecas, inmuebleLocal, proveedoresList, HipotecasList, setProveedoresSegurosList, setHipotecas, onInmuebleUpdated]);

    const updateSeguroField = useCallback((index, field, value) => {
        setEditSeguros(prev => 
            prev.map((seguro, i) => 
                i === index ? { ...seguro, [field]: value } : seguro
            )
        );
    }, []);

    const updateProveedorField = useCallback((index, field, value) => {
        setEditProveedores(prev => 
            prev.map((proveedor, i) => 
                i === index ? { ...proveedor, [field]: value } : proveedor
            )
        );
    }, []);

    const updateDatosRegistralesField = useCallback((field, value) => {
        setEditDatosRegistrales(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const updateHipotecaField = useCallback((index, field, value) => {
        setEditHipotecas(prev => 
            prev.map((hipoteca, i) => 
                i === index ? { ...hipoteca, [field]: value } : hipoteca
            )
        );
    }, []);

    const renderCollapsibleHeader = useCallback((title, count, isCollapsed, setCollapsed) => {
        const shouldShowToggle = count > 0;
        
        return (
            <div 
                className={`flex items-center justify-between mb-2 ${shouldShowToggle ? 'cursor-pointer hover:bg-gray-50 p-2 rounded' : ''}`}
                onClick={shouldShowToggle ? () => setCollapsed(!isCollapsed) : undefined}
            >
                <h4 className="text-xl font-bold">{title}</h4>
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
    }, []);

    if (!inmuebleLocal) {
        return (
            <div className="absolute flex w-[68%] h-full p-2">
                <div className="w-full h-full flex items-center justify-center border border-black p-2">
                    <div className="text-gray-500 text-lg">
                        Selecciona un inmueble para ver sus detalles
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute flex w-[68%] h-full p-2">
            <div className="w-full h-full flex flex-col border border-black">
                
                {/* BOTÓN DE EDITAR - Fijo arriba */}
                <div className="flex justify-end p-2 border-b border-gray-300">
                    {!globalEditMode ? (
                        <button
                            onClick={startGlobalEdit}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center"
                        >
                            <PencilIcon className="h-5 w-5 mr-2" />
                            Editar Inmueble
                        </button>
                    ) : (
                        <div className="flex space-x-2">
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
                    )}
                </div>
                
                {/* Contenido con scroll - Ocupa el resto del espacio */}
                <div className="flex-1 p-3 bg-white overflow-y-auto">
                    <div className="flex flex-col space-y-4">
                        
                        {/* Contenedor de Seguros */}
                        <div>
                            {renderCollapsibleHeader(
                                "Seguros", 
                                proveedoresList?.seguros?.length || 0, 
                                segurosCollapsed, 
                                setSegurosCollapsed
                            )}
                            
                            {proveedoresList?.seguros?.length === 0 ? (
                                <div className="text-gray-600 italic ml-2">El inmueble no cuenta con ningún seguro.</div>
                            ) : (
                                !segurosCollapsed && (
                                    <div className="space-y-2">
                                        {(globalEditMode ? editSeguros : proveedoresList?.seguros || []).map((seguro, index) => (
                                            <div className="border border-black rounded-lg p-2" key={`seguro-${seguro.poliza}-${index}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                                        <div className="flex items-center bg-gray-100 p-2">
                                                            <ShieldCheckIcon className="h-5 w-5 mr-2" />
                                                            <EditableField 
                                                                value={seguro.tipo_seguro} 
                                                                onChange={(value) => updateSeguroField(index, 'tipo_seguro', value)}
                                                                globalEditMode={globalEditMode}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-100 p-2">
                                                            <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                                                            <EditableField 
                                                                value={seguro.empresa_seguro} 
                                                                onChange={(value) => updateSeguroField(index, 'empresa_seguro', value)}
                                                                globalEditMode={globalEditMode}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-100 p-2">
                                                            <PhoneIcon className="h-5 w-5 mr-2" />
                                                            <EditableField 
                                                                value={seguro.telefono} 
                                                                onChange={(value) => updateSeguroField(index, 'telefono', value)}
                                                                globalEditMode={globalEditMode}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-200 p-2">
                                                            <AtSymbolIcon className="h-5 w-5 mr-2" />
                                                            <EditableField 
                                                                value={seguro.email} 
                                                                onChange={(value) => updateSeguroField(index, 'email', value)}
                                                                globalEditMode={globalEditMode}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-200 p-2">
                                                            <ClipboardDocumentListIcon className="h-5 w-5" />
                                                            <b className="mr-2">POLIZA:</b> 
                                                            <EditableField 
                                                                value={seguro.poliza} 
                                                                isIdentifier={true}
                                                                globalEditMode={globalEditMode}
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteSeguro(seguro.poliza, seguro.empresa_seguro)}
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
                                <div className="text-gray-600 italic ml-2">El inmueble no cuenta con ningún proveedor.</div>
                            ) : (
                                !proveedoresCollapsed && (
                                    <div className="space-y-2">
                                        {(globalEditMode ? editProveedores : proveedoresList?.proveedores || []).map((proveedor, index) => (
                                            <div className="border border-black rounded-lg p-2" key={`proveedor-${proveedor.clave}-${index}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                                        <div className="flex items-center bg-gray-100 p-2">
                                                            <ShieldCheckIcon className="h-5 w-5 mr-2" />
                                                            <EditableField 
                                                                value={proveedor.tipo_servicio} 
                                                                onChange={(value) => updateProveedorField(index, 'tipo_servicio', value)}
                                                                globalEditMode={globalEditMode}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-100 p-2">
                                                            <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                                                            <EditableField 
                                                                value={proveedor.nombre} 
                                                                onChange={(value) => updateProveedorField(index, 'nombre', value)}
                                                                globalEditMode={globalEditMode}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-100 p-2">
                                                            <PhoneIcon className="h-5 w-5 mr-2" />
                                                            <EditableField 
                                                                value={proveedor.telefono} 
                                                                onChange={(value) => updateProveedorField(index, 'telefono', value)}
                                                                globalEditMode={globalEditMode}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-200 p-2">
                                                            <AtSymbolIcon className="h-5 w-5 mr-2" />
                                                            <EditableField 
                                                                value={proveedor.email} 
                                                                onChange={(value) => updateProveedorField(index, 'email', value)}
                                                                globalEditMode={globalEditMode}
                                                            />
                                                        </div>
                                                    </div>
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

                        {/* Datos Registrales */}
                        {inmuebleLocal && (
                            <div>
                                {renderCollapsibleHeader(
                                    "Datos Registrales", 
                                    1,
                                    datosRegistralesCollapsed, 
                                    setDatosRegistralesCollapsed
                                )}
                                
                                {!datosRegistralesCollapsed && (
                                    <div className="border border-black rounded-lg p-2">
                                        <div className="grid grid-cols-4 gap-2">
                                            <div className="flex items-center bg-gray-100 p-2">
                                                <b className="mr-2">Clave catastral:</b>
                                                <EditableField 
                                                    value={inmuebleLocal.clave_catastral} 
                                                    isIdentifier={true}
                                                    globalEditMode={globalEditMode}
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-100 p-2">
                                                <b className="mr-2">Protocolo:</b>
                                                <EditableField 
                                                    value={globalEditMode ? editDatosRegistrales.num_protocolo : inmuebleLocal.num_protocolo} 
                                                    onChange={(value) => updateDatosRegistralesField('num_protocolo', value)}
                                                    globalEditMode={globalEditMode}
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-100 p-2">
                                                <b className="mr-2">Folio:</b>
                                                <EditableField 
                                                    value={globalEditMode ? editDatosRegistrales.folio : inmuebleLocal.folio} 
                                                    onChange={(value) => updateDatosRegistralesField('folio', value)}
                                                    globalEditMode={globalEditMode}
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-100 p-2">
                                                <b className="mr-2">Hoja:</b>
                                                <EditableField 
                                                    value={globalEditMode ? editDatosRegistrales.hoja : inmuebleLocal.hoja} 
                                                    onChange={(value) => updateDatosRegistralesField('hoja', value)}
                                                    globalEditMode={globalEditMode}
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-2">
                                                <b className="mr-2">Inscripción:</b>
                                                <EditableField 
                                                    value={globalEditMode ? editDatosRegistrales.inscripcion : inmuebleLocal.inscripcion} 
                                                    onChange={(value) => updateDatosRegistralesField('inscripcion', value)}
                                                    globalEditMode={globalEditMode}
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-2">
                                                <b className="mr-2">Fecha Ins.:</b>
                                                <EditableField 
                                                    value={globalEditMode ? editDatosRegistrales.fecha_inscripcion : inmuebleLocal.fecha_inscripcion} 
                                                    onChange={(value) => updateDatosRegistralesField('fecha_inscripcion', value)}
                                                    type="date"
                                                    globalEditMode={globalEditMode}
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-2">
                                                <b className="mr-2">Notario:</b> 
                                                <EditableField 
                                                    value={globalEditMode ? editDatosRegistrales.notario : inmuebleLocal.notario} 
                                                    onChange={(value) => updateDatosRegistralesField('notario', value)}
                                                    globalEditMode={globalEditMode}
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-2">
                                                <b className="mr-2">Fecha adquisición:</b>
                                                <EditableField 
                                                    value={globalEditMode ? editDatosRegistrales.fecha_adquisicion : inmuebleLocal.fecha_adquisicion} 
                                                    onChange={(value) => updateDatosRegistralesField('fecha_adquisicion', value)}
                                                    type="date"
                                                    globalEditMode={globalEditMode}
                                                />
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-2">
                                                <b className="mr-2">Valor adquisición:</b>
                                                <EditableField 
                                                    value={globalEditMode ? editDatosRegistrales.valor_adquisicion : inmuebleLocal.valor_adquisicion} 
                                                    onChange={(value) => updateDatosRegistralesField('valor_adquisicion', value)}
                                                    type="number"
                                                    globalEditMode={globalEditMode}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Hipotecas */}
                        <div>
                            {renderCollapsibleHeader(
                                "Hipotecas", 
                                HipotecasList?.length || 0, 
                                hipotecasCollapsed, 
                                setHipotecasCollapsed
                            )}
                            
                            {(HipotecasList === null || HipotecasList.length === 0) ? (
                                <div className="text-gray-600 italic ml-2">El inmueble no tiene hipotecas.</div>
                            ) : (
                                !hipotecasCollapsed && (
                                    <div className="space-y-2">
                                        {(globalEditMode ? editHipotecas : HipotecasList || []).map((hipoteca, index) => (
                                            <div className="border border-black rounded-lg p-2" key={`hipoteca-${hipoteca.id}-${index}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 grid grid-cols-4 gap-2">
                                                        <div className="flex items-center bg-gray-100 p-2">
                                                            <b className="mr-2">Banco:</b>
                                                            <EditableField 
                                                                value={hipoteca.banco_prestamo} 
                                                                onChange={(value) => updateHipotecaField(index, 'banco_prestamo', value)}
                                                                globalEditMode={globalEditMode}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-100 p-2">
                                                            <b className="mr-2">Prestamo:</b>
                                                            <EditableField 
                                                                value={hipoteca.prestamo} 
                                                                onChange={(value) => updateHipotecaField(index, 'prestamo', value)}
                                                                type="number"
                                                                globalEditMode={globalEditMode}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-200 p-2">
                                                            <b className="mr-2">Fecha Prestamo:</b>
                                                            <EditableField 
                                                                value={hipoteca.fecha_hipoteca} 
                                                                onChange={(value) => updateHipotecaField(index, 'fecha_hipoteca', value)}
                                                                type="date"
                                                                globalEditMode={globalEditMode}
                                                            />
                                                        </div>
                                                        <div className="flex items-center bg-gray-100 p-2">
                                                            <b className="mr-2">Cuota:</b>
                                                            <EditableField 
                                                                value={hipoteca.cuota_hipoteca} 
                                                                onChange={(value) => updateHipotecaField(index, 'cuota_hipoteca', value)}
                                                                type="number"
                                                                globalEditMode={globalEditMode}
                                                            />
                                                        </div>
                                                    </div>
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