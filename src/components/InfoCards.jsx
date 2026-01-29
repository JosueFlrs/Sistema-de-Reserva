import React from 'react'
import { CLUB_CONFIG } from '../config'
import { Map } from './ui/map'


export const TarjetaUbicacion = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-4 transition-colors">
        <div>
            <h3 className="font-bold mb-4 dark:text-white text-lg">Ubicación</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{CLUB_CONFIG.direccion}</p>
        </div>
        <a
            href="https://www.google.com/maps/dir/?api=1&destination=-32.852333,-68.863624"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors mt-20"
        >
            Ver en Google Maps
        </a>
    </div>
)

export const TarjetaHorarios = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-4 transition-colors">
        <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-4">Horarios del Club</h3>
        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex justify-between border-b border-gray-50 dark:border-slate-700 pb-2"><span>Lunes:</span> <span className="font-medium">18:00 a 23:00</span></li>
            <li className="flex justify-between border-b border-gray-50 dark:border-slate-700 pb-2"><span>Martes, Miercoles:</span> <span className="font-medium">18:00 a 1:00 am</span></li>
            <li className="flex justify-between border-b border-gray-50 dark:border-slate-700 pb-2"><span>Jueves, Viernes:</span> <span className="font-medium">18:00 a 2:00 am</span></li>
            <li className="flex justify-between border-b border-gray-50 dark:border-slate-700 pb-2"><span>Domingo, Sabado:</span> <span className="font-medium">17:00 a 21:00</span></li>
        </ul>
    </div>
)

export const TarjetaMapa = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-4 transition-colors">
        <h3 className="font-bold mb-4 dark:text-white text-lg">Mapa</h3>


        {/* 1. MAPA FULL WIDTH (Todo el ancho) */}
        <div className="w-full bg-white dark:bg-slate-800 h-[400px] rounded-xl shadow overflow-hidden mb-8 relative border border-gray-200 dark:border-slate-700">
            <Map
                initialViewState={{
                    longitude: -68.863624, // TUS COORDENADAS
                    latitude: -32.852333,
                    zoom: 15
                }}
                className="w-full h-full"
            />
        </div>
    </div>
)

export const TarjetaServicios = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-4 transition-colors">
        <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-4">Servicios del Club</h3>
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs md:text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">🚗 Estacionamiento</div>
            <div className="flex items-center gap-2">✚ Ayuda Médica</div>
            <div className="flex items-center gap-2">🏆 Torneos</div>
            <div className="flex items-center gap-2">🎂 Cumpleaños</div>
            <div className="flex items-center gap-2">🍖 Parrilla</div>
            <div className="flex items-center gap-2">⚽ Escuelita</div>
            <div className="flex items-center gap-2">🍹 Bar / Resto</div>
            <div className="flex items-center gap-2">🏠 Quincho</div>
        </div>
    </div>
)