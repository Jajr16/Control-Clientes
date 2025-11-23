import React, { useState, useEffect, useCallback } from "react";
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
    ShieldCheckIcon, BuildingOfficeIcon, PhoneIcon, AtSymbolIcon,
    ClipboardDocumentListIcon, ChevronDownIcon, ChevronRightIcon,
    PencilIcon, CheckIcon, XMarkIcon, TrashIcon
} from "@heroicons/react/24/solid";
import ModalComponentes from "../modals/ModalComponentes";


const EditableField = React.memo(({
    value,
    onChange,
    type = "text",
    className = "",
    isIdentifier = false,
    globalEditMode,
    ...props
}) => {
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

    if (!globalEditMode) {
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
            type={type}
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            onFocus={(e) => e.target.select()}
            className={`border ${isIdentifier ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} rounded px-2 py-1 ${className} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            autoComplete="off"
            {...props}
        />
    );
});

EditableField.displayName = 'EditableField';


const InmuebleDetails = ({
    inmueble,
    setProveedoresSegurosList,
    proveedoresList,
    setHipotecas,
    HipotecasList,
    onInmuebleUpdated,
    onEditModeChange
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

    const [valoresOriginales, setValoresOriginales] = useState({
        clave_catastral: null,
        datosRegistrales: {},
        seguros: [],
        proveedores: [],
        hipotecas: []
    });

    useEffect(() => {
        if (!globalEditMode && inmueble?.clave_catastral !== inmuebleLocal?.clave_catastral) {
            setInmuebleLocal(inmueble);
        }
    }, [inmueble?.clave_catastral, globalEditMode]);

    useEffect(() => {
        if (onEditModeChange) {
            onEditModeChange(globalEditMode);
        }
    }, [globalEditMode, onEditModeChange]);

    async function fetchData() {
        try {
            const [proveedoresResponse, hipotecasResponse] = await Promise.all([
                getInmuebleDetails(inmuebleLocal.clave_catastral),
                getInmuebleHipotecas(inmuebleLocal.clave_catastral)
            ]);

            setProveedoresSegurosList(proveedoresResponse.data);
            setHipotecas(hipotecasResponse.data);
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    }

    useEffect(() => {
        if (!inmuebleLocal?.clave_catastral) return;

        fetchData();
    }, [inmuebleLocal?.clave_catastral]);

    const handleDeleteSeguro = useCallback(async (poliza, empresaSeguro) => {
        if (!window.confirm(`¿Eliminar el seguro de ${empresaSeguro}?`)) return;

        try {
            await deleteSeguro(inmuebleLocal.clave_catastral, poliza);

            if (proveedoresList) {
                setProveedoresSegurosList({
                    ...proveedoresList,
                    seguros: proveedoresList.seguros.filter(s => s.poliza !== poliza)
                });
            }

            alert('Seguro eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar seguro:', error);
            alert('Error: ' + (error.response?.data?.message || error.message));
        }
    }, [inmuebleLocal?.clave_catastral]);

    const handleDeleteProveedor = useCallback(async (claveProveedor, nombreProveedor) => {
        if (!window.confirm(`¿Eliminar el proveedor ${nombreProveedor}?`)) return;

        try {
            await deleteProveedor(inmuebleLocal.clave_catastral, claveProveedor);

            if (proveedoresList) {
                setProveedoresSegurosList({
                    ...proveedoresList,
                    proveedores: proveedoresList.proveedores.filter(p => p.clave !== claveProveedor)
                });
            }

            alert('Proveedor eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar proveedor:', error);
            alert('Error: ' + (error.response?.data?.message || error.message));
        }
    }, [inmuebleLocal?.clave_catastral, proveedoresList, setProveedoresSegurosList]);

    const handleDeleteHipoteca = useCallback(async (idHipoteca, bancoPrestamo) => {
        if (!window.confirm(`¿Eliminar la hipoteca del banco ${bancoPrestamo}?`)) return;

        try {
            await deleteHipoteca(inmuebleLocal.clave_catastral, idHipoteca);

            if (HipotecasList) {
                setHipotecas(HipotecasList.filter(h => h.id !== idHipoteca));
            }

            alert('Hipoteca eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar hipoteca:', error);
            alert('Error: ' + (error.response?.data?.message || error.message));
        }
    }, [inmuebleLocal?.clave_catastral, HipotecasList, setHipotecas]);

    const startGlobalEdit = useCallback(() => {
        setGlobalEditMode(true);

        const nuevosSeguros = proveedoresList?.seguros?.map(s => ({ ...s })) || [];
        const nuevosProveedores = proveedoresList?.proveedores?.map(p => ({ ...p })) || [];
        const nuevasHipotecas = HipotecasList?.map(h => ({ ...h })) || [];
        const nuevosDatosRegistrales = inmuebleLocal ? { ...inmuebleLocal } : {};

        setEditSeguros(nuevosSeguros);
        setEditProveedores(nuevosProveedores);
        setEditDatosRegistrales(nuevosDatosRegistrales);
        setEditHipotecas(nuevasHipotecas);

        setValoresOriginales({
            clave_catastral: inmuebleLocal?.clave_catastral || null,
            datosRegistrales: JSON.parse(JSON.stringify(nuevosDatosRegistrales)),
            seguros: JSON.parse(JSON.stringify(nuevosSeguros)),
            proveedores: JSON.parse(JSON.stringify(nuevosProveedores)),
            hipotecas: JSON.parse(JSON.stringify(nuevasHipotecas))
        });
    }, [proveedoresList, inmuebleLocal, HipotecasList]);

    const cancelGlobalEdit = useCallback(() => {
        setGlobalEditMode(false);
        setEditSeguros([]);
        setEditProveedores([]);
        setEditDatosRegistrales({});
        setEditHipotecas([]);
        setValoresOriginales({
            clave_catastral: null,
            datosRegistrales: {},
            seguros: [],
            proveedores: [],
            hipotecas: []
        });
    }, []);

    const detectarCambios = (original, editado, camposComparar) => {
        const cambios = {};
        for (const campo of camposComparar) {
            if (editado[campo] !== original[campo]) {
                cambios[campo] = editado[campo];
            }
        }
        return cambios;
    };

    const saveAllChanges = useCallback(async () => {
        try {
            let claveCatastralActual = valoresOriginales.clave_catastral;

            const camposDR = ['num_protocolo', 'folio', 'hoja', 'inscripcion', 'notario',
                'fecha_inscripcion', 'valor_adquisicion', 'fecha_adquisicion', 'clave_catastral'];

            const cambiosDR = detectarCambios(valoresOriginales.datosRegistrales, editDatosRegistrales, camposDR);

            if (Object.keys(cambiosDR).length > 0) {
                console.log('Cambios en datos registrales detectados:', cambiosDR);

                const datosRegistralesPayload = { ...cambiosDR };

                if (cambiosDR.clave_catastral && cambiosDR.clave_catastral !== claveCatastralActual) {
                    datosRegistralesPayload.clave_catastral_nueva = cambiosDR.clave_catastral;
                    delete datosRegistralesPayload.clave_catastral;
                }

                await updateDatosRegistrales(claveCatastralActual, datosRegistralesPayload);

                if (cambiosDR.clave_catastral) {
                    claveCatastralActual = cambiosDR.clave_catastral;
                }

                const nuevoInmueble = { ...inmuebleLocal, ...editDatosRegistrales };
                setInmuebleLocal(nuevoInmueble);

                if (onInmuebleUpdated) {
                    onInmuebleUpdated(nuevoInmueble);
                }
            }

            for (let i = 0; i < editSeguros.length; i++) {
                const seguroEditado = editSeguros[i];
                const seguroOriginal = valoresOriginales.seguros[i];

                const camposSeguro = ['tipo_seguro', 'telefono', 'email', 'empresa_seguro', 'poliza'];
                const cambiosSeguro = detectarCambios(seguroOriginal, seguroEditado, camposSeguro);

                if (Object.keys(cambiosSeguro).length > 0) {
                    console.log(`Cambios en seguro ${i}:`, cambiosSeguro);

                    const seguroPayload = { ...cambiosSeguro };

                    if (cambiosSeguro.poliza && cambiosSeguro.poliza !== seguroOriginal.poliza) {
                        seguroPayload.poliza_nueva = cambiosSeguro.poliza;
                        delete seguroPayload.poliza;
                    }

                    await updateSeguro(claveCatastralActual, seguroOriginal.poliza, seguroPayload);
                }
            }

            for (let i = 0; i < editProveedores.length; i++) {
                const proveedorEditado = editProveedores[i];
                const proveedorOriginal = valoresOriginales.proveedores[i];

                const camposProveedor = ['tipo_servicio', 'nombre', 'telefono', 'email'];
                const cambiosProveedor = detectarCambios(proveedorOriginal, proveedorEditado, camposProveedor);

                if (Object.keys(cambiosProveedor).length > 0) {
                    console.log(`Cambios en proveedor ${i}:`, cambiosProveedor);
                    await updateProveedor(claveCatastralActual, proveedorOriginal.clave, cambiosProveedor);
                }
            }

            for (let i = 0; i < editHipotecas.length; i++) {
                const hipotecaEditada = editHipotecas[i];
                const hipotecaOriginal = valoresOriginales.hipotecas[i];

                const camposHipoteca = ['banco_prestamo', 'prestamo', 'fecha_hipoteca', 'cuota_hipoteca'];
                const cambiosHipoteca = detectarCambios(hipotecaOriginal, hipotecaEditada, camposHipoteca);

                if (Object.keys(cambiosHipoteca).length > 0) {
                    console.log(`Cambios en hipoteca ${i}:`, cambiosHipoteca);
                    await updateHipoteca(claveCatastralActual, hipotecaOriginal.id, cambiosHipoteca);
                }
            }

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
            setValoresOriginales({
                clave_catastral: null,
                datosRegistrales: {},
                seguros: [],
                proveedores: [],
                hipotecas: []
            });

            setTimeout(() => alert('Cambios guardados correctamente'), 0);

        } catch (error) {
            console.error('Error al guardar:', error);
            setGlobalEditMode(false);
            setTimeout(() => alert('Error: ' + (error.response?.data?.message || error.message)), 0);
        }
    }, [editDatosRegistrales, editSeguros, editProveedores, editHipotecas, inmuebleLocal,
        proveedoresList, HipotecasList, valoresOriginales, setProveedoresSegurosList,
        setHipotecas, onInmuebleUpdated]);

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
        setEditDatosRegistrales(prev => ({ ...prev, [field]: value }));
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
                    isCollapsed ?
                        <ChevronRightIcon className="h-5 w-5" /> :
                        <ChevronDownIcon className="h-5 w-5" />
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
                <div className="flex justify-end items-center p-2 gap-3">
                    <ModalComponentes CC={inmuebleLocal?.clave_catastral} onComponenteAgregado={fetchData} />
                    {/* BOTÓN DE EDITAR */}
                    <div className="flex justify-end p-2">
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
                </div>

                {/* CONTENIDO CON SCROLL */}
                <div className="flex-1 p-3 bg-white overflow-y-auto">
                    <div className="flex flex-col space-y-4">

                        {/* SEGUROS */}
                        <div>
                            {renderCollapsibleHeader(
                                "Seguros",
                                proveedoresList?.seguros?.length || 0,
                                segurosCollapsed,
                                setSegurosCollapsed
                            )}

                            {proveedoresList?.seguros?.length === 0 ? (
                                <div className="text-gray-600 italic ml-2">Sin seguros registrados</div>
                            ) : (
                                !segurosCollapsed && (
                                    <div className="space-y-2">
                                        {(globalEditMode ? editSeguros : proveedoresList?.seguros || []).map((seguro, index) => (
                                            <div className="border border-black rounded-lg p-2" key={`seguro-${index}`}>
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
                                                        <div className="flex items-center bg-gray-200 p-2 col-span-2">
                                                            <ClipboardDocumentListIcon className="h-5 w-5" />
                                                            <b className="mr-2">POLIZA:</b>
                                                            <EditableField
                                                                value={seguro.poliza}
                                                                onChange={(value) => updateSeguroField(index, 'poliza', value)}
                                                                isIdentifier={true}
                                                                globalEditMode={globalEditMode}
                                                            />
                                                        </div>
                                                    </div>
                                                    {!globalEditMode && (
                                                        <button
                                                            onClick={() => handleDeleteSeguro(seguro.poliza, seguro.empresa_seguro)}
                                                            className="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors duration-200"
                                                            title="Eliminar seguro"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>

                        {/* PROVEEDORES */}
                        <div>
                            {renderCollapsibleHeader(
                                "Proveedores",
                                proveedoresList?.proveedores?.length || 0,
                                proveedoresCollapsed,
                                setProveedoresCollapsed
                            )}

                            {proveedoresList?.proveedores?.length === 0 ? (
                                <div className="text-gray-600 italic ml-2">Sin proveedores registrados</div>
                            ) : (
                                !proveedoresCollapsed && (
                                    <div className="space-y-2">
                                        {(globalEditMode ? editProveedores : proveedoresList?.proveedores || []).map((proveedor, index) => (
                                            <div className="border border-black rounded-lg p-2" key={`proveedor-${index}`}>
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
                                                    {!globalEditMode && (
                                                        <button
                                                            onClick={() => handleDeleteProveedor(proveedor.clave, proveedor.nombre)}
                                                            className="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors duration-200"
                                                            title="Eliminar proveedor"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>

                        {/* DATOS REGISTRALES */}
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
                                                    value={globalEditMode ? editDatosRegistrales.clave_catastral : inmuebleLocal.clave_catastral}
                                                    onChange={(value) => updateDatosRegistralesField('clave_catastral', value)}
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

                        {/* HIPOTECAS */}
                        <div>
                            {renderCollapsibleHeader(
                                "Hipotecas",
                                HipotecasList?.length || 0,
                                hipotecasCollapsed,
                                setHipotecasCollapsed
                            )}

                            {(HipotecasList === null || HipotecasList.length === 0) ? (
                                <div className="text-gray-600 italic ml-2">Sin hipotecas registradas</div>
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
                                                    {!globalEditMode && (
                                                        <button
                                                            onClick={() => handleDeleteHipoteca(hipoteca.id, hipoteca.banco_prestamo)}
                                                            className="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors duration-200"
                                                            title="Eliminar hipoteca"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
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
        </div >
    );
};

export default InmuebleDetails;