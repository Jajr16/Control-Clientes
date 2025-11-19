import { useState } from "react";
import { Shield, Users, DollarSign } from 'lucide-react';
import { SeccionColapsable } from "../elements/SeccionCollapse.jsx";
import InmuebleHipotecaForm from "../forms/InmuebleHipotecaForms.jsx";
import InmuebleProveedorForm from "../forms/InmuebleProveedorForms.jsx";
import InmuebleSeguroForm from "../forms/InmuebleSeguroForms.jsx";

export const InmuebleComponentes = ({ seguros, setSeguros, proveedores, setProveedores, hipotecas, setHipotecas }) => {
    const [seccionesAbiertas, setSeccionesAbiertas] = useState({
        seguros: false,
        proveedores: false,
        hipotecas: false
    });

    // Funciones para agregar items
    const agregarSeguro = () => {
        setSeguros([...seguros, { id: Date.now() }]);
    };

    const agregarProveedor = () => {
        setProveedores([...proveedores, { id: Date.now() }]);
    };

    const agregarHipoteca = () => {
        setHipotecas([...hipotecas, { id: Date.now() }]);
    };

    // Funciones para actualizar items
    const actualizarSeguro = (id, datos) => {
        setSeguros(seguros.map(s => s.id === id ? { ...s, ...datos } : s));
    };

    const actualizarProveedor = (id, datos) => {
        setProveedores(proveedores.map(p => p.id === id ? { ...p, ...datos } : p));
    };

    const actualizarHipoteca = (id, datos) => {
        setHipotecas(hipotecas.map(h => h.id === id ? { ...h, ...datos } : h));
    };

    // Funciones para eliminar items
    const eliminarSeguro = (id) => {
        setSeguros(seguros.filter(s => s.id !== id));
    };

    const eliminarProveedor = (id) => {
        setProveedores(proveedores.filter(p => p.id !== id));
    };

    const eliminarHipoteca = (id) => {
        setHipotecas(hipotecas.filter(h => h.id !== id));
    };

    return (
        <div className="space-y-6">
            {/* Seguros */}
            <SeccionColapsable 
                titulo={`Seguros (${seguros.length})`} 
                icono={Shield} 
                abierto={seccionesAbiertas.seguros}
                onToggle={() => setSeccionesAbiertas({ ...seccionesAbiertas, seguros: !seccionesAbiertas.seguros })}
                botonAgregar={{
                    texto: "Agregar Seguro",
                    onClick: (e) => {
                        e.stopPropagation();
                        agregarSeguro();
                        if (!seccionesAbiertas.seguros) {
                            setSeccionesAbiertas({ ...seccionesAbiertas, seguros: true });
                        }
                    }
                }}
            >
                <div className="space-y-3">
                    {seguros.map((seguro, idx) => (
                        <InmuebleSeguroForm
                            key={seguro.id}
                            seguro={seguro}
                            setSeguro={(datos) => actualizarSeguro(seguro.id, datos)}
                            onRemove={() => eliminarSeguro(seguro.id)}
                            errores={{}}
                            inmuebleIdx={0}
                            seguroIdx={idx}
                        />
                    ))}
                </div>
            </SeccionColapsable>

            {/* Proveedores */}
            <SeccionColapsable 
                titulo={`Proveedores (${proveedores.length})`} 
                icono={Users} 
                abierto={seccionesAbiertas.proveedores}
                onToggle={() => setSeccionesAbiertas({ ...seccionesAbiertas, proveedores: !seccionesAbiertas.proveedores })}
                botonAgregar={{
                    texto: "Agregar Proveedor",
                    onClick: (e) => {
                        e.stopPropagation();
                        agregarProveedor();
                        if (!seccionesAbiertas.proveedores) {
                            setSeccionesAbiertas({ ...seccionesAbiertas, proveedores: true });
                        }
                    }
                }}
            >
                <div className="space-y-3">
                    {proveedores.map((proveedor, idx) => (
                        <InmuebleProveedorForm
                            key={proveedor.id}
                            proveedor={proveedor}
                            setProveedor={(datos) => actualizarProveedor(proveedor.id, datos)}
                            onRemove={() => eliminarProveedor(proveedor.id)}
                            errores={{}}
                            inmuebleIdx={0}
                            proveedorIdx={idx}
                        />
                    ))}
                </div>
            </SeccionColapsable>

            {/* Hipotecas */}
            <SeccionColapsable 
                titulo={`Hipotecas (${hipotecas.length})`} 
                icono={DollarSign} 
                abierto={seccionesAbiertas.hipotecas}
                onToggle={() => setSeccionesAbiertas({ ...seccionesAbiertas, hipotecas: !seccionesAbiertas.hipotecas })}
                botonAgregar={{
                    texto: "Agregar Hipoteca",
                    onClick: (e) => {
                        e.stopPropagation();
                        agregarHipoteca();
                        if (!seccionesAbiertas.hipotecas) {
                            setSeccionesAbiertas({ ...seccionesAbiertas, hipotecas: true });
                        }
                    }
                }}
            >
                <div className="space-y-3">
                    {hipotecas.map((hipoteca, idx) => (
                        <InmuebleHipotecaForm
                            key={hipoteca.id}
                            hipoteca={hipoteca}
                            setHipoteca={(datos) => actualizarHipoteca(hipoteca.id, datos)}
                            onRemove={() => eliminarHipoteca(hipoteca.id)}
                            errores={{}}
                            inmuebleIdx={0}
                            hipotecaIdx={idx}
                        />
                    ))}
                </div>
            </SeccionColapsable>
        </div>
    );
};