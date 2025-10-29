import { ChevronDown, ChevronUp } from "lucide-react";

export const SeccionColapsable = ({ titulo, icono: Icono, children, abierto, onToggle, obligatorio = false }) => (
    <div className="border border-gray-300 rounded-lg mb-4 overflow-hidden">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
            <div className="flex items-center gap-2">
                {Icono && <Icono className="w-5 h-5" />}
                <span className="font-semibold text-lg">{titulo}</span>
                {obligatorio && <span className="text-red-500 text-sm">*</span>}
            </div>
            {abierto ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        <div className={`p-4 ${abierto ? 'block' : 'hidden'}`}>
            {children}
        </div>
    </div>
);