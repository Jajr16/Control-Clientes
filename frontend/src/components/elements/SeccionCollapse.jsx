import { ChevronDown, ChevronUp, Plus } from "lucide-react";

export const SeccionColapsable = ({ 
    titulo, 
    icono: Icono, 
    children, 
    abierto, 
    onToggle, 
    obligatorio = false,
    botonAgregar = null // { texto: "Agregar", onClick: () => {} }
}) => (
    <div className="border border-gray-300 rounded-lg mb-4 overflow-hidden">
        <div className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 transition-colors">
            {/* Botón de toggle (izquierda) */}
            <button
                onClick={onToggle}
                className="flex items-center gap-2 flex-1"
            >
                {Icono && <Icono className="w-5 h-5" />}
                <span className="font-semibold text-lg">{titulo}</span>
                {obligatorio && <span className="text-red-500 text-sm">*</span>}
                {abierto ? <ChevronUp className="w-5 h-5 ml-2" /> : <ChevronDown className="w-5 h-5 ml-2" />}
            </button>
            
            {/* Botón de agregar (derecha) */}
            {botonAgregar && (
                <button
                    onClick={botonAgregar.onClick}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded flex items-center gap-1.5 text-sm ml-4 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {botonAgregar.texto}
                </button>
            )}
        </div>
        
        <div className={`p-4 ${abierto ? 'block' : 'hidden'}`}>
            {children}
        </div>
    </div>
);