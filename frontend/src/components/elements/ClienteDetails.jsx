import React from "react";

const ClientDetails = ({ client }) => {
    if (!client) return <div className="p-4">Selecciona un cliente para ver los detalles.</div>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold">{client.nombre}</h2>
            <p><strong>Clave:</strong> {client.clave}</p>
            <p><strong>CIF:</strong> {client.cif}</p>
            <p><strong>Propietario:</strong> {client.propietario}</p>
            <p><strong>Teléfono:</strong> {client.telefono}</p>
            <p><strong>Dirección:</strong> {client.calle} {client.numero}, {client.piso}, {client.codigo_postal}, {client.localidad}</p>
            <p><strong>Número de protocolo:</strong> {client.num_protocolo}</p>
            <p><strong>Folio:</strong> {client.folio}</p>
            <p><strong>Hoja:</strong> {client.hoja}</p>
            <p><strong>Inscripción:</strong> {client.inscripcion}</p>
            <p><strong>Notario:</strong> {client.notario}</p>
            <p><strong>Fecha de inscripción:</strong> {new Date(client.fecha_inscripcion).toISOString().split('T')[0]}</p>
        </div>
    );
};

export default ClientDetails;