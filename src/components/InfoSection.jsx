import { TarjetaHorarios, TarjetaServicios } from './InfoCards'
import { Map } from './ui/map' // Import normal
import { CLUB_CONFIG } from '../config'

export default function InfoSection() {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-4 transition-colors">
                <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-4">Ubicación</h3>
                
                {/* Contenedor del Mapa OPTIMIZADO */}
                <div className="h-[200px] w-full rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-slate-800 relative">
                    
                        <Map 
                            initialViewState={{
                                longitude: -68.863624, 
                                latitude: -32.852333, 
                                zoom: 15
                            }}
                            className="w-full h-full"
                        />
                    )

                </div>

                <p className="text-sm text-gray-600 flex items-center gap-2 dark:text-white mb-4">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>  {CLUB_CONFIG.direccion}
                </p>

                <a 
                    href="https://www.google.com/maps/dir/?api=1&destination=-32.852333,-68.863624"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                >
                    Ir a Google Maps
                </a>

            </div>

            <TarjetaHorarios />
            <TarjetaServicios />
        </div>
    )
}