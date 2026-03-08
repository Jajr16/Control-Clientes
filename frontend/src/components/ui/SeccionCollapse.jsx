import { ChevronDown, ChevronUp, Plus } from "lucide-react";

export const SeccionColapsable = ({
    titulo = null,
    icono: Icono,
    abierto,
    onToggle,
    obligatorio = false,
    boton = null, // { texto: "Agregar", onClick: () => {} }
    headerExtra = null,   // JSX extra que se muestra al lado del toggle
    borderStyle,
    children
}) => (
    <div className="border border-gray-300 rounded-lg mb-4 overflow-hidden">
        {/* Botón de toggle */}
        <div
            onClick={onToggle}
            className={`w-full flex items-center p-4 cursor-pointer hover:bg-gray-200 ${borderStyle || "bg-gray-100"}`}
        >
            {/* IZQUIERDA */}
            <div className="flex items-center gap-2">
                {Icono && <Icono className="w-5 h-5" />}
                <span className={titulo.className || "font-semibold text-lg"}>
                    {titulo.texto}
                </span>
                {obligatorio && <span className="text-red-500 text-sm">*</span>}
                {abierto ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}

                {/* headerExtra solo si hay botón */}
                {headerExtra && boton && (
                    <div className="ml-2 flex items-center gap-2">
                        {headerExtra}
                    </div>
                )}
            </div>

            {/* DERECHA */}
            <div className="ml-auto flex items-center gap-2">
                {/* headerExtra si NO hay botón */}
                {headerExtra && !boton && headerExtra}
                {boton && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            boton.onClick?.()
                        }}
                        className={boton.className}
                    >
                        {boton.icon && <boton.icon className="w-4 h-4" />}
                        {boton.texto}
                    </button>
                )}
            </div>
        </div>
        {/* Contenido expandible */}
        <div className={`p-4 ${abierto ? 'block' : 'hidden'}`}>
            {children}
        </div>
    </div>
);