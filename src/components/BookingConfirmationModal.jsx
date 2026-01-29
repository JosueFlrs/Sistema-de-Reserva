import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { sumarHora, generarLinkWhatsApp } from '../helpers'
import { showAlert, showConfirm } from '../alertSystem'
import { CLUB_CONFIG } from '../config'
import CountrySelect from './CountrySelect'

export default function BookingConfirmationModal({
    seleccion,
    diaActual,
    session,
    canchas,
    onClose,
    onSuccess
}) {
    const [telefonoUsuario, setTelefonoUsuario] = useState('')
    const [codigoPais, setCodigoPais] = useState('591')
    const [guardarTelefono, setGuardarTelefono] = useState(false)
    const [cuponInput, setCuponInput] = useState('')
    const [descuento, setDescuento] = useState(0)
    const [mensajeCupon, setMensajeCupon] = useState('')
    const [loading, setLoading] = useState(false)

    // Cargar datos guardados
    useEffect(() => {
        const telefonoGuardado = localStorage.getItem('wallyUserPhone')
        const paisGuardado = localStorage.getItem('wallyUserCountry')
        if (telefonoGuardado) {
            setTelefonoUsuario(telefonoGuardado)
            setGuardarTelefono(true)
            if (paisGuardado) setCodigoPais(paisGuardado)
        }
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = 'unset' }
    }, [])

    const verificarCupon = async () => {
        if (!cuponInput) return
        const { data, error } = await supabase.from('cupones').select('*').eq('codigo', cuponInput.toUpperCase()).eq('activo', true).single()

        if (error || !data) {
            setMensajeCupon('❌ Cupón inválido')
            setDescuento(0)
        } else {
            const porcentaje = data.descuento
            const precioCancha = seleccion?.precio || 0
            const montoDescuento = Math.round((precioCancha * porcentaje) / 100)
            setMensajeCupon(`✅ ¡Descuento del ${porcentaje}% aplicado! (-$${montoDescuento})`)
            setDescuento(montoDescuento)
        }
    }

    const confirmarReservaFinal = async () => {
        if (!telefonoUsuario || telefonoUsuario.length < 6) {
            await showAlert("Falta información", "Por favor ingresa un número válido.", "error")
            return
        }

        if (guardarTelefono) {
            localStorage.setItem('wallyUserPhone', telefonoUsuario)
            localStorage.setItem('wallyUserCountry', codigoPais)
        } else {
            localStorage.removeItem('wallyUserPhone')
            localStorage.removeItem('wallyUserCountry')
        }

        setLoading(true)

        // Verificar disponibilidad de último segundo
        const { data: ocupado } = await supabase.from('reservas')
            .select('id')
            .eq('cancha_id', seleccion.canchaId)
            .eq('fecha', diaActual.fecha)
            .eq('hora_inicio', seleccion.hora)
            .neq('estado', 'cancelada')
            .maybeSingle()

        if (ocupado) {
            setLoading(false)
            onClose() // Cerrar modal
            await showAlert("¡Lo sentimos!", "Alguien ganó este turno hace unos segundos.", "error")
            onSuccess(false) // Recargar datos sin éxito de reserva propia
            return
        }

        const telefonoCompleto = codigoPais + telefonoUsuario.replace(/\D/g, '')
        const cancha = canchas.find(c => c.id === seleccion.canchaId)
        const precioFinal = Math.max(0, cancha.precio_hora - descuento)

        const { error } = await supabase.from('reservas').insert([{
            cancha_id: seleccion.canchaId,
            usuario_id: session.user.id,
            fecha: diaActual.fecha,
            hora_inicio: seleccion.hora,
            hora_fin: sumarHora(seleccion.hora),
            total: precioFinal,
            estado: 'pendiente',
            nombre_cliente: session.user.user_metadata.full_name || 'Web App',
            telefono: telefonoCompleto,
            descuento_aplicado: descuento
        }])

        if (error) {
            await showAlert("Error", error.message, "error")
        } else {
            const mensaje = `¡Hola! Reserva en ${CLUB_CONFIG.nombre} ⚽\n📅 ${diaActual.etiquetaDesktop}\n⏰ ${seleccion.hora}\n📍 ${seleccion.nombre}\n💰 $${precioFinal}`
            const link = generarLinkWhatsApp(telefonoCompleto, mensaje)
            const quiereWp = await showConfirm("¡Reserva Exitosa!", "Tu turno ha sido agendado.\n¿Recibir comprobante por WhatsApp?")
            if (quiereWp) window.open(link, '_blank')
            onSuccess(true) // Notificar éxito
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-4 md:p-6 relative transition-colors">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white">✕</button>

                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Confirmar Reserva</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Completa tus datos para finalizar.</p>

                <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-700 transition-colors">
                        <div className="flex justify-between mb-2 text-gray-800 dark:text-gray-200">
                            <span className="text-sm opacity-70">Cancha</span>
                            <span className="font-bold">{seleccion?.nombre}</span>
                        </div>
                        <div className="flex justify-between mb-2 text-gray-800 dark:text-gray-200">
                            <span className="text-sm opacity-70">Fecha</span>
                            <span className="font-bold">{diaActual.etiquetaDesktop}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 dark:border-slate-700 pt-2 mt-2">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Precio Base</span>
                            <span className={`font-bold text-gray-800 dark:text-white ${descuento > 0 ? 'line-through decoration-red-400 text-xs text-gray-400' : ''}`}>${seleccion?.precio}</span>
                        </div>
                        {descuento > 0 && (
                            <div className="flex justify-between text-green-600 dark:text-green-400 text-sm font-bold">
                                <span>Descuento</span>
                                <span>- ${descuento}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-black text-gray-900 dark:text-white mt-1">
                            <span>Total Final</span>
                            <span>${Math.max(0, seleccion?.precio - descuento)}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tu Teléfono (WhatsApp) <span className="text-red-500">*</span></label>
                        <div className="flex gap-2 relative">
                            <CountrySelect value={codigoPais} onChange={setCodigoPais} />
                            <input
                                type="tel"
                                placeholder="Ej: 70123456"
                                value={telefonoUsuario}
                                onChange={(e) => setTelefonoUsuario(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 focus:border-blue-500 outline-none transition-all bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600 w-full"
                                autoFocus
                            />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" id="guardarTel" checked={guardarTelefono} onChange={(e) => setGuardarTelefono(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                            <label htmlFor="guardarTel" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">Guardar para futuras reservas</label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">¿Tienes un cupón?</label>
                        <div className="flex gap-2">
                            <input type="text" placeholder="CÓDIGO" value={cuponInput} onChange={e => setCuponInput(e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 uppercase focus:border-blue-500 outline-none dark:bg-slate-700 dark:text-white w-full" />
                            <button onClick={verificarCupon} type="button" className="bg-blue-600 text-white px-4 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-sm">APLICAR</button>
                        </div>
                        {mensajeCupon && <p className={`text-xs mt-1 font-bold ${descuento > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{mensajeCupon}</p>}
                    </div>

                    <button onClick={confirmarReservaFinal} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transform transition active:scale-95 flex justify-center items-center gap-2 mt-4">
                        {loading ? 'Procesando...' : 'FINALIZAR RESERVA 🚀'}
                    </button>
                </div>
            </div>
        </div>
    )
}