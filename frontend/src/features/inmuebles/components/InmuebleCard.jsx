import React, { useState, useContext } from "react";
import { TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { inmuebleContext } from "../../clientes/pages/Cliente";

const InmuebleCard = React.memo(({ inmueble, isSelected, isEditingGlobal }) => {
    const { inmuebles, handleSelectInmueble } = useContext(inmuebleContext)

    const [isLocalEditing, setIsLocalEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({ ...inmueble });

    const onStartEdit = (e, inmueble) => {
        e.stopPropagation();
        setIsLocalEditing(true);
        setEditFormData({ ...inmueble });
    };

    const onSave = async (e) => {
        e.stopPropagation();
        await inmuebles.handleEditInmueble(inmueble.clave_catastral, editFormData)
        setIsLocalEditing(false);
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setIsLocalEditing(false);
        setEditFormData({ ...inmueble });
    };

    const handleInputChange = (e, field) => {
        const value = e.target.value;
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div
            key={inmueble.clave_catastral}
            className={`border border-black p-3 rounded-xl transition-all ${isSelected
                ? "bg-secondary-theme ring-2 ring-blue-500 shadow-md"
                : "bg-options hover:bg-gray-100 hover:shadow-sm"
                } ${isLocalEditing ? "bg-yellow-50" : ""} ${isEditingGlobal && !isSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
            onClick={() => !isEditingGlobal && !isLocalEditing && handleSelectInmueble(inmueble)}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    {isLocalEditing ? (
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                            <input className="w-full p-1 border border-gray-300 rounded text-sm" value={editFormData.calle || ''} onChange={(e) => handleInputChange(e, 'calle')} placeholder="Calle" />
                            <div className="grid grid-cols-3 gap-3">
                                <input className="p-1 border border-gray-300 rounded text-sm" value={editFormData.numero || ''} onChange={(e) => handleInputChange(e, 'numero')} placeholder="Nº" />
                                <input className="p-1 border border-gray-300 rounded text-sm" value={editFormData.piso || ''} onChange={(e) => handleInputChange(e, 'piso')} placeholder="Piso" />
                                <input className="p-1 border border-gray-300 rounded text-sm" value={editFormData.codigo_postal || ''} onChange={(e) => handleInputChange(e, 'codigo_postal')} placeholder="Código Postal" />
                            </div>
                            <input className="w-full p-1 border border-gray-300 rounded text-sm" value={editFormData.localidad || ''} onChange={(e) => handleInputChange(e, 'localidad')} placeholder="Localidad" />
                            <div className="grid grid-cols-2 gap-2">
                                <input className="p-1 border border-gray-300 rounded text-sm" type="number" min="0" step="0.01" value={editFormData.valor_adquisicion || ''} onChange={(e) => handleInputChange(e, 'valor_adquisicion')} placeholder="Valor" />
                                <input className="p-1 border border-gray-300 rounded text-sm" type="date" value={editFormData?.fecha_adquisicion ? editFormData.fecha_adquisicion.substring(0, 10) : ''} onChange={(e) => handleInputChange(e, 'fecha_adquisicion')} placeholder="Fecha Adquisición" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="font-semibold text-gray-800 text-sm">
                                {inmueble.calle ? `${inmueble.calle}, ` : "(SIN CALLE), "}
                                {inmueble.numero ? `${inmueble.numero}, ` : "(SIN NÚMERO), "}
                                {inmueble.piso ? `${inmueble.piso}, ` : ""}
                                {inmueble.codigo_postal ? `${inmueble.codigo_postal}, ` : "(SIN C.P.), "}
                                {inmueble.localidad ? `${inmueble.localidad}, ` : "(SIN LOCALIDAD)"}
                            </div>
                            <div className="text-xs text-gray-600 mb-1 uppercase tracking-wider"><strong>Clave:</strong> {inmueble.clave_catastral}</div>
                            <div className="text-sm text-gray-700"><strong>Valor:</strong> {inmueble?.valor_adquisicion?.toLocaleString('de-DE') ?? '-'} €</div>
                        </>
                    )}
                </div>

                <div className="flex space-x-1 ml-2">
                    {isLocalEditing ? (
                        <>
                            <button onClick={onSave} className="p-1 text-green-600 hover:bg-green-100 rounded"><CheckIcon className="h-5 w-5" /></button>
                            <button onClick={handleCancel} className="p-1 text-red-600 hover:bg-red-100 rounded"><XMarkIcon className="h-5 w-5" /></button>
                        </>
                    ) : (
                        <>
                            <button onClick={(e) => onStartEdit(e, inmueble)} className="p-1 text-blue-600 hover:bg-blue-100 rounded"><PencilIcon className="h-4 w-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); inmuebles.handleDeleteInmueble(inmueble.clave_catastral) }} className="p-1 text-red-600 hover:bg-red-100 rounded"><TrashIcon className="h-4 w-4" /></button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

export default InmuebleCard;