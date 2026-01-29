import { useState, useEffect } from 'react'
import { HORARIOS, sumarHora, PAISES } from '../helpers'
import { supabase } from '../supabase'
import CountrySelect from './CountrySelect'

export default function FixedShiftModal({ isOpen, onClose, canchas, onReload, adminId }) {
    const [cliente, setCliente] = useState('')
    const [telefono, setTelefono] = useState('')
    const [codigoPais, setCodigoPais] = useState('591')
    
    const [canchaId, setCanchaId] = useState('')
    const [diaSemana, setDiaSemana] = useState('1')
    const [hora, setHora] = useState('19:00')
    const [duracion, setDuracion] = useState(1)
    const [meses, setMeses] = useState(1)
    const [loading, setLoading] = useState(false)

    // BLOQUEAR SCROLL AL ABRIR
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    if (!isOpen) return null

    const DIAS = [
        { id: 1, nombre: 'Lunes' }, { id: 2, nombre: 'Martes' }, { id: 3, nombre: 'Miércoles' },
        { id: 4, nombre: 'Jueves' }, { id: 5, nombre: 'Viernes' }, { id: 6, nombre: 'Sábado' }, { id: 0, nombre: 'Domingo' }
    ]

    const generarReservas = async (e) => {
        e.preventDefault()
        if (!canchaId || !cliente) {
            alert("Faltan datos")
            return
        }
        
        const telefonoCompleto = telefono ? (codigoPais + telefono.replace(/\D/g, '')) : ''

        setLoading(true)
        const reservasAInsertar = []
        const fechaInicio = new Date()
        const fechaFin = new Date()
        fechaFin.setMonth(fechaFin.getMonth() + parseInt(meses))

        let actual = new Date(fechaInicio)
        
        while (actual <= fechaFin) {
            if (actual.getDay() == diaSemana) {
                const fechaStr = actual.toISOString().split('T')[0]
                const cancha = canchas.find(c => c.id == canchaId)
                
                for (let i = 0; i < duracion; i++) {
                    const horaBase = parseInt(hora.split(':')[0])
                    const horaBloque = horaBase + i
                    const horaInicioStr = `${horaBloque}:00`
                    const horaFinStr = `${horaBloque + 1}:00`

                    if (horaBloque >= 24) continue 

                    reservasAInsertar.push({
                        cancha_id: canchaId,
                        usuario_id: adminId, 
                        fecha: fechaStr,
                        hora_inicio: horaInicioStr,
                        hora_fin: horaFinStr,
                        total: cancha.precio_hora,
                        estado: 'pendiente', 
                        nombre_cliente: `${cliente} (Fijo)`,
                        telefono: telefonoCompleto,
                        es_fijo: true
                    })
                }
            }
            actual.setDate(actual.getDate() + 1)
        }

        if (reservasAInsertar.length > 0) {
            const { error } = await supabase.from('reservas').insert(reservasAInsertar)

            if (error) alert("Error: " + error.message)
            else {
                alert(`¡Éxito! Se crearon ${reservasAInsertar.length} bloques.`)
                onReload()
                onClose()
            }
        } else {
            alert("No se generaron fechas en este rango.")
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative transition-colors">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white">✕</button>
                
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                    📅 Crear Turno Fijo
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Genera reservas automáticas por meses.</p>

                <form onSubmit={generarReservas} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
                            <input 
                                type="text" 
                                required 
                                className="w-full border rounded-lg p-2 text-sm outline-none focus:border-purple-500 bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white" 
                                placeholder="Nombre" 
                                value={cliente} 
                                onChange={e => setCliente(e.target.value)} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                            <div className="flex gap-1 relative">
                                <CountrySelect 
                                    value={codigoPais} 
                                    onChange={setCodigoPais} 
                                />
                                <input 
                                    type="text" 
                                    className="w-full border rounded-lg p-2 text-sm outline-none focus:border-purple-500 bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white" 
                                    placeholder="Num" 
                                    value={telefono} 
                                    onChange={e => setTelefono(e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Cancha</label>
                            <select 
                                className="w-full border rounded-lg p-2 text-sm outline-none focus:border-purple-500 bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white" 
                                required 
                                onChange={e => setCanchaId(e.target.value)} 
                                value={canchaId}
                            >
                                <option value="">Seleccionar...</option>
                                {canchas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Día Fijo</label>
                            <select 
                                className="w-full border rounded-lg p-2 text-sm outline-none focus:border-purple-500 bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white" 
                                value={diaSemana} 
                                onChange={e => setDiaSemana(e.target.value)}
                            >
                                {DIAS.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Inicio</label>
                            <select 
                                className="w-full border rounded-lg p-2 text-sm outline-none focus:border-purple-500 bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white" 
                                value={hora} 
                                onChange={e => setHora(e.target.value)}
                            >
                                {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                        
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Duración</label>
                            <select 
                                className="w-full border rounded-lg p-2 text-sm outline-none focus:border-purple-500 bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white" 
                                value={duracion} 
                                onChange={e => setDuracion(e.target.value)}
                            >
                                <option value="1">1 Hora</option>
                                <option value="2">2 Horas</option>
                                <option value="3">3 Horas</option>
                            </select>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Plazo</label>
                            <select 
                                className="w-full border rounded-lg p-2 text-sm outline-none focus:border-purple-500 bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white" 
                                value={meses} 
                                onChange={e => setMeses(e.target.value)}
                            >
                                <option value="1">1 Mes</option>
                                <option value="2">2 Meses</option>
                                <option value="3">3 Meses</option>
                                <option value="6">6 Meses</option>
                                <option value="12">1 Año</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg mt-4 transition-transform active:scale-95"
                    >
                        {loading ? 'Generando...' : 'Confirmar Abono'}
                    </button>
                </form>
            </div>
        </div>
    )
}