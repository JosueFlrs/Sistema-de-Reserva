import { useState, useEffect, useRef } from 'react'
import { PAISES } from '../helpers'

export default function CountrySelect({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef(null)

    // Encontrar el país seleccionado actualmente
    const selectedCountry = PAISES.find(p => p.codigo === value) || PAISES[0]

    // Cerrar el menú si hacen clic afuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={containerRef}>
            {/* Botón Principal (SOLO BANDERA) */}
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-3 h-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            >
                <img 
                    src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`} 
                    alt={selectedCountry.nombre}
                    className="w-6 h-4 object-cover rounded-sm shadow-sm"
                />
                {/* Hemos quitado el código numérico de aquí */}
                <svg className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {/* Lista Desplegable */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto animate-fade-in-down">
                    <div className="py-1">
                        {PAISES.map(pais => (
                            <button
                                key={pais.codigo}
                                type="button"
                                onClick={() => {
                                    onChange(pais.codigo)
                                    setIsOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${value === pais.codigo ? 'bg-blue-50 dark:bg-slate-700/50' : ''}`}
                            >
                                <img 
                                    src={`https://flagcdn.com/w40/${pais.iso}.png`} 
                                    alt={pais.nombre}
                                    className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                                />
                                {/* Aquí mostramos el Nombre en lugar del código para identificar mejor */}
                                <span className="text-sm text-gray-700 dark:text-gray-200 font-medium truncate">{pais.nombre}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}