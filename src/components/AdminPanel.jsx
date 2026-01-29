import { useState, useEffect } from 'react'
import { HORARIOS, generarLinkWhatsApp, generarMensajeCancelacion, formatearHora, sumarHora } from '../helpers'
import { showPrompt, showConfirm, showAlert } from '../alertSystem'
import ExpenseTracker from './ExpenseTracker' 
import FixedShiftModal from './FixedShiftModal' 
import CourtsManager from './CourtsManager'
import CouponsManager from './CouponsManager'
import { supabase } from '../supabase' 

export default function AdminPanel({ 
    canchas, reservas, diaActual, 
    onPrevDay, onNextDay, 
    onCancel, 
    userId,
    onChangePaymentStatus,
    onReloadApp 
}) {
    const [totalGastos, setTotalGastos] = useState(0)
    const [showFixedModal, setShowFixedModal] = useState(false) 
    
    const [adminTab, setAdminTab] = useState('dashboard')

    const forceReload = () => {
        onNextDay(); setTimeout(onPrevDay, 100); 
        if(onReloadApp) onReloadApp() 
    }

    useEffect(() => {
        if (showFixedModal) {
            window.history.pushState({ modal: 'fixedShift' }, '', window.location.href)
            const handlePop = () => setShowFixedModal(false)
            window.addEventListener('popstate', handlePop)
            return () => window.removeEventListener('popstate', handlePop)
        }
    }, [showFixedModal])

    const handleManualReserve = async (canchaId, hora, precio) => {
        const nombre = await showPrompt("Nueva Reserva Manual", "Ingresa el nombre del cliente:", "Nombre Cliente")
        if (!nombre) return

        const tel = await showPrompt("Teléfono (Opcional)", "Ingresa el número para WhatsApp:", "Ej: 70123456") || ''
        
        const { error } = await supabase.from('reservas').insert([{
            cancha_id: canchaId, 
            usuario_id: userId, 
            fecha: diaActual.fecha,
            hora_inicio: hora, 
            hora_fin: sumarHora(hora), 
            total: precio, 
            estado: 'pagada', 
            nombre_cliente: nombre, 
            telefono: tel
        }])

        if (error) await showAlert("Error", error.message, "error")
        else forceReload()
    }

    useEffect(() => {
        const fetchGastos = async () => {
            const { data } = await supabase.from('gastos').select('monto')
            const total = data?.reduce((acc, curr) => acc + curr.monto, 0) || 0
            setTotalGastos(total)
        }
        fetchGastos()
    }, [reservas])

    const totalIngresos = reservas.reduce((acc, curr) => acc + curr.total, 0)
    const gananciaNeta = totalIngresos - totalGastos 
    const totalReservas = reservas.length

    const obtenerReserva = (canchaId, hora) => reservas.find(r => r.cancha_id === canchaId && r.hora_inicio.slice(0,5) === hora)

    const handleCancelacionAdmin = async (reserva) => {
        const motivo = await showPrompt("⚠️ CANCELAR TURNO", "Ingresa el motivo para notificar al cliente:", "Motivo (ej: Lluvia)", "Mal Clima ☔")
        
        if (!motivo) return 

        const exito = await onCancel(reserva.id, motivo)

        if (exito && reserva.telefono) {
            const mensaje = generarMensajeCancelacion(
                reserva.nombre_cliente, 
                diaActual.etiquetaDesktop, 
                reserva.hora_inicio, 
                motivo
            )
            const link = generarLinkWhatsApp(reserva.telefono, mensaje)
            
            const abrirWp = await showConfirm("Notificar Cliente", "¿Abrir WhatsApp para enviar el aviso?")
            if (abrirWp && link) window.open(link, '_blank')
        }
    }

    return (
        <div className="animate-fade-in space-y-6">
            
            {/* --- MENÚ DE NAVEGACIÓN MEJORADO (GRID 3 COLUMNAS) --- */}
            {/* Usamos grid-cols-3 para forzar equidad y p-1 bg-gray para el efecto pastilla */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-200 dark:bg-slate-700/50 rounded-xl mb-6">
                
                <button 
                    onClick={() => setAdminTab('dashboard')}
                    className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 rounded-lg text-[11px] md:text-sm font-bold transition-all
                    ${adminTab === 'dashboard' 
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm transform scale-[1.02]' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-slate-700'}`}
                >
                    <span className="text-base md:text-lg">📊</span>
                    {/* Texto adaptable: En móvil dice 'Dashboard', en PC 'Dashboard & Reservas' */}
                    <span className="md:hidden">Dashboard</span>
                    <span className="hidden md:inline">Dashboard & Reservas</span>
                </button>

                <button 
                    onClick={() => setAdminTab('canchas')}
                    className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 rounded-lg text-[11px] md:text-sm font-bold transition-all
                    ${adminTab === 'canchas' 
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm transform scale-[1.02]' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-slate-700'}`}
                >
                    <span className="text-base md:text-lg">🏟️</span>
                    <span className="md:hidden">Canchas</span>
                    <span className="hidden md:inline">Gestionar Canchas</span>
                </button>

                <button 
                    onClick={() => setAdminTab('cupones')}
                    className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 rounded-lg text-[11px] md:text-sm font-bold transition-all
                    ${adminTab === 'cupones' 
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm transform scale-[1.02]' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-slate-700'}`}
                >
                    <span className="text-base md:text-lg">🎟️</span>
                    <span>Cupones</span>
                </button>

            </div>

            {/* --- CONTENIDO SEGÚN PESTAÑA --- */}

            {adminTab === 'canchas' && (
                <CourtsManager canchas={canchas} onReload={onReloadApp} />
            )}

            {adminTab === 'cupones' && (
                <CouponsManager />
            )}

            {adminTab === 'dashboard' && (
                <>
                    <FixedShiftModal 
                        isOpen={showFixedModal} 
                        onClose={() => setShowFixedModal(false)}
                        canchas={canchas}
                        adminId={userId}
                        onReload={forceReload} 
                    />

                    {/* Dashboard Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
                            <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Ingresos Día</div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">${totalIngresos}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
                            <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Reservas Hoy</div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalReservas}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
                            <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Ganancia Neta</div>
                            <div className={`text-2xl font-bold ${gananciaNeta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>${gananciaNeta}</div>
                        </div>
                        <div className="bg-slate-800 dark:bg-slate-950 rounded-xl text-white flex flex-col justify-center items-center shadow-sm p-4 border border-slate-700 transition-colors">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Fecha Admin</div>
                            <div className="flex items-center gap-3">
                                <button onClick={onPrevDay} className="hover:text-blue-400 font-bold text-xl">{'<'}</button>
                                <span className="font-bold">{diaActual.etiquetaDesktop}</span>
                                <button onClick={onNextDay} className="hover:text-blue-400 font-bold text-xl">{'>'}</button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Grilla */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
                            <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-700 dark:text-white">Grilla de Canchas</h3>
                                <button 
                                    onClick={() => setShowFixedModal(true)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
                                >
                                    📅 + Fijo
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Hora</th>
                                            {canchas.map(c => <th key={c.id} className="px-4 py-3 text-center">{c.nombre}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                        {HORARIOS.map(hora => (
                                            <tr key={hora} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-4 py-3 font-bold text-gray-700 dark:text-gray-300 w-20 bg-white dark:bg-slate-800">{hora}</td>
                                                {canchas.map(cancha => {
                                                    const reserva = obtenerReserva(cancha.id, hora)
                                                    const linkRecordatorio = reserva && reserva.telefono ? generarLinkWhatsApp(reserva.telefono, `Hola ${reserva.nombre_cliente}, te recordamos tu turno hoy a las ${formatearHora(reserva.hora_inicio)} hs en la cancha ${cancha.nombre}. ⚽`) : '#'

                                                    return (
                                                        <td key={cancha.id} className="px-2 py-2 text-center border-l border-gray-100 dark:border-slate-700 align-top h-24 bg-white dark:bg-slate-800">
                                                            {reserva ? (
                                                                <div className={`p-2 rounded-lg text-xs border h-full flex flex-col justify-between shadow-sm
                                                                    ${reserva.es_fijo 
                                                                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300' 
                                                                        : (reserva.estado === 'pagada' 
                                                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
                                                                            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300')
                                                                    }`}>
                                                                    <div>
                                                                        <div className="flex justify-between items-start">
                                                                            <div className="font-bold uppercase truncate max-w-[80px]" title={reserva.nombre_cliente}>{reserva.nombre_cliente || 'Web'}</div>
                                                                            {reserva.es_fijo && <span className="text-[9px] bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-white px-1 rounded font-bold">FIJO</span>}
                                                                        </div>
                                                                        
                                                                        <div className="flex items-center gap-1 mt-1">
                                                                            {reserva.telefono && (
                                                                                <a href={linkRecordatorio} target="_blank" rel="noreferrer" className="bg-green-500 text-white rounded-full p-0.5 hover:bg-green-600 transition" title="Enviar recordatorio">
                                                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                                                                </a>
                                                                            )}
                                                                            <div className="opacity-75 text-[10px] truncate max-w-[50px]">${reserva.total}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-between items-end mt-2">
                                                                        <button 
                                                                            onClick={() => onChangePaymentStatus(reserva.id, reserva.estado)}
                                                                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${reserva.estado === 'pagada' ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' : 'bg-white dark:bg-slate-700 border dark:border-slate-600 shadow-sm text-gray-600 dark:text-gray-300'}`}
                                                                        >
                                                                            {reserva.estado === 'pagada' ? '$ OK' : '$ Pend'}
                                                                        </button>
                                                                        <button onClick={() => handleCancelacionAdmin(reserva)} className="text-red-400 hover:text-red-600 p-1 font-bold">X</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => handleManualReserve(cancha.id, hora, cancha.precio_hora)}
                                                                    className="w-full h-full rounded-lg border border-dashed border-gray-200 dark:border-slate-600 text-gray-300 dark:text-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1 group"
                                                                >
                                                                    <span className="text-xl group-hover:scale-110 transition-transform">+</span>
                                                                </button>
                                                            )}
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Gastos */}
                        <div className="lg:col-span-1">
                            <ExpenseTracker />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}