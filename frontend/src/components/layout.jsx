import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Navbar fijo en la parte superior */}
            <div className="fixed top-0 left-0 right-0 z-50 flex-shrink-0">
                <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            </div>
            
            {/* Contenedor principal con altura fija */}
            <div className="flex flex-1 mt-16">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                
                {/* Main content con altura fija */}
                <main className="flex-1 transition-all duration-300 ease-in-out lg:ml-16 xl:ml-20">
                    {/* Contenedor con altura fija y padding */}
                    <div className="h-full p-1 xs:p-2 sm:p-4 lg:p-6">
                        {/* Contenedor interno con altura fija y scroll */}
                        <div className="h-full bg-white rounded-none xs:rounded-lg shadow-sm border-0 xs:border border-gray-200">
                            {/* Aquí es donde va tu contenido con scroll controlado */}
                            <div className="h-full overflow-y-auto">
                                {children}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            
            {/* Overlay para móvil */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;