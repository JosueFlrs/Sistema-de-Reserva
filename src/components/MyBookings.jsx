import { useState, useMemo } from 'react'

export default function MyBookings({ misReservas, onCancel }) {
    const [busqueda, setBusqueda] = useState('')
    const [orden, setOrden] = useState('desc') // 'desc' = Nuevos arriba (Default)
    const [filtroEstado, setFiltroEstado] = useState('todos') // 'todos', 'proximos', 'pasados'

    // Lógica de filtrado y ordenamiento en tiempo real
    const reservasFiltradas = useMemo(() => {
        let resultado = [...misReservas]

        // 1. Filtrar por Búsqueda (Texto)
        if (busqueda) {
            const termino = busqueda.toLowerCase()
            resultado = resultado.filter(r => 
                (r.canchas?.nombre || '').toLowerCase().includes(termino) ||
                r.fecha.includes(termino) ||
                r.hora_inicio.includes(termino)
            )
        }

        // 2. Filtrar por Estado (Próximos vs Pasados)
        const ahora = new Date()
        if (filtroEstado === 'proximos') {
            resultado = resultado.filter(r => new Date(r.fecha + 'T' + r.hora_inicio) >= ahora)
        } else if (filtroEstado === 'pasados') {
            resultado = resultado.filter(r => new Date(r.fecha + 'T' + r.hora_inicio) < ahora)
        }

        // 3. Ordenar (Por Fecha y Hora)
        resultado.sort((a, b) => {
            const fechaA = new Date(a.fecha + 'T' + a.hora_inicio)
            const fechaB = new Date(b.fecha + 'T' + b.hora_inicio)
            return orden === 'asc' ? fechaA - fechaB : fechaB - fechaA
        })

        return resultado
    }, [misReservas, busqueda, orden, filtroEstado])

    if (misReservas.length === 0) return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/50">
            <p>No tienes reservas registradas aún.</p>
        </div>
    )

    return (
        <div className="space-y-4 animate-fade-in">
            
            {/* --- BARRA DE HERRAMIENTAS (Buscador y Filtros) --- */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row gap-3 transition-colors">
                
                {/* Buscador */}
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Buscar cancha, fecha..." 
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                    {/* Selector de Estado */}
                    <select 
                        value={filtroEstado} 
                        onChange={e => setFiltroEstado(e.target.value)}
                        className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-white text-sm outline-none focus:border-blue-500 cursor-pointer min-w-[100px]"
                    >
                        <option value="todos">Todo</option>
                        <option value="proximos">🟢 Futuros</option>
                        <option value="pasados">⚫ Pasados</option>
                    </select>

                    {/* Selector de Orden */}
                    <button 
                        onClick={() => setOrden(orden === 'desc' ? 'asc' : 'desc')}
                        className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-white text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 min-w-[140px] justify-center"
                    >
                        {orden === 'desc' ? '⬇️ Recientes' : '⬆️ Antiguos'}
                    </button>
                </div>
            </div>

            {/* --- LISTA DE TURNOS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservasFiltradas.length > 0 ? (
                    reservasFiltradas.map(reserva => {
                        const fechaObj = new Date(reserva.fecha + 'T' + reserva.hora_inicio)
                        const esPasado = fechaObj < new Date()
                        
                        return (
                            <div key={reserva.id} className={`relative bg-white dark:bg-slate-800 border rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md 
                                ${esPasado ? 'opacity-60 grayscale border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50' : 'border-blue-200 dark:border-blue-800'}`}>
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${esPasado ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200'}`}>
                                                {reserva.canchas?.nombre || 'Cancha'}
                                            </span>
                                            {esPasado && <span className="text-[10px] font-bold text-gray-500 border border-gray-300 px-1 rounded">FINALIZADO</span>}
                                        </div>
                                        <h4 className="font-bold text-gray-800 dark:text-white text-xl">
                                            {reserva.fecha.split('-').reverse().join('/')}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-gray-700 dark:text-gray-300 leading-none">
                                            {reserva.hora_inicio.slice(0, 5)}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            ID: #{reserva.id}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-700 pt-3 mt-1">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Monto Total</span>
                                        <span className="font-bold text-green-600 dark:text-green-400 text-lg">${reserva.total}</span>
                                    </div>

                                    {!esPasado ? (
                                        <button 
                                            onClick={() => onCancel(reserva.id)} 
                                            className="text-red-500 hover:text-white hover:bg-red-500 border border-red-200 dark:border-red-900/30 px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1"
                                        >
                                            🗑️ Cancelar
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                                            <span>✓ Completado</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-400 dark:text-gray-500">
                        <div className="text-4xl mb-2">🔍</div>
                        <p>No encontramos reservas con esos filtros.</p>
                        <button 
                            onClick={() => { setBusqueda(''); setFiltroEstado('todos'); }}
                            className="text-blue-500 text-sm hover:underline mt-2"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}