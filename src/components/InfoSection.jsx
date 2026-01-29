import { TarjetaHorarios, TarjetaServicios } from './InfoCards'
import { Map } from './ui/map' // Import normal
import { CLUB_CONFIG } from '../config'
import { useState } from 'react'

export default function InfoSection() {
    const [mostrarMapaMovil, setMostrarMapaMovil] = useState(false) // <--- ESTADO LOCAL
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-4 transition-colors">
                <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-4">Ubicación</h3>
                
                {/* Contenedor del Mapa OPTIMIZADO */}
                <div className="h-[200px] w-full rounded-lg overflow-hidden border border-gray-100 mb-4 bg-gray-100 dark:bg-slate-800 relative">
                    
                    {!mostrarMapaMovil ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-700/50 cursor-pointer" onClick={() => setMostrarMapaMovil(true)}>
                            <button className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg font-bold text-sm shadow border border-gray-200 dark:border-slate-600">
                                👆 Toca para ver el mapa
                            </button>
                        </div>
                    ) : (
                        <Map 
                            initialViewState={{
                                longitude: -68.863624, 
                                latitude: -32.852333, 
                                zoom: 15
                            }}
                            className="w-full h-full"
                        />
                    )}

                </div>

                <p className="text-sm text-gray-600 flex items-center gap-2 dark:text-white mb-4">
                    <span>📍</span> {CLUB_CONFIG.direccion}
                </p>

                <a 
                    href="https://www.google.com/maps/dir/?api=1&destination=-32.852333,-68.863624"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                >
                    📍 Cómo llegar con GPS
                </a>

            </div>

            <TarjetaHorarios />
            <TarjetaServicios />
        </div>
    )
}