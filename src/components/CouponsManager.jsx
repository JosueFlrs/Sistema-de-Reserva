import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { showAlert, showConfirm } from '../alertSystem'

export default function CouponsManager() {
    const [cupones, setCupones] = useState([])
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)

    // Estado del formulario
    const [formData, setFormData] = useState({
        codigo: '',
        descuento: ''
    })

    useEffect(() => {
        cargarCupones()
    }, [])

    const cargarCupones = async () => {
        let { data, error } = await supabase.from('cupones').select('*').order('created_at', { ascending: false })
        if (error) {
            const result = await supabase.from('cupones').select('*')
            data = result.data
        }
        setCupones(data || [])
    }

    const openModal = (cupon = null) => {
        if (cupon) {
            setEditingId(cupon.id)
            setFormData({
                codigo: cupon.codigo,
                descuento: cupon.descuento
            })
        } else {
            setEditingId(null)
            setFormData({ codigo: '', descuento: '' })
        }
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.codigo || !formData.descuento) return

        // Validación de porcentaje
        if (parseInt(formData.descuento) > 100) {
            await showAlert("Error", "El descuento no puede superar el 100%", "error")
            return
        }

        setLoading(true)
        try {
            if (editingId) {
                // EDITAR
                const { error } = await supabase.from('cupones').update({
                    codigo: formData.codigo.toUpperCase(),
                    descuento: parseInt(formData.descuento)
                }).eq('id', editingId)
                if (error) throw error
                await showAlert("Actualizado", "Cupón modificado correctamente.", "success")
            } else {
                // CREAR
                const { error } = await supabase.from('cupones').insert([{
                    codigo: formData.codigo.toUpperCase(),
                    descuento: parseInt(formData.descuento),
                    activo: true
                }])
                if (error) throw error
                await showAlert("Creado", "Nuevo cupón listo.", "success")
            }
            
            setFormData({ codigo: '', descuento: '' })
            setShowModal(false)
            await cargarCupones()

        } catch (error) {
            await showAlert("Error", error.message, "error")
        } finally {
            setLoading(false)
        }
    }

    const toggleCupon = async (id, estadoActual) => {
        await supabase.from('cupones').update({ activo: !estadoActual }).eq('id', id)
        await cargarCupones()
    }

    const borrarCupon = async (id) => {
        const confirmar = await showConfirm("¿Borrar Cupón?", "Esta acción es permanente.")
        if(!confirmar) return
        await supabase.from('cupones').delete().eq('id', id)
        await cargarCupones()
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700 p-4 md:p-6 animate-fade-in transition-colors">
            
            {/* CABECERA */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <span>🎟️</span> <span>Cupones (%)</span>
                </h3>
                <button 
                    onClick={() => openModal()}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
                >
                    + Nuevo Cupón
                </button>
            </div>

            {/* LISTA */}
            <div className="space-y-3">
                {cupones.map(c => (
                    <div key={c.id} className={`relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border transition-all ${c.activo ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900' : 'border-gray-200 bg-gray-50 dark:bg-slate-800 dark:border-slate-700 opacity-60'}`}>
                        
                        <div className="absolute top-3 right-3 sm:hidden">
                             <div className={`w-3 h-3 rounded-full ${c.activo ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-400'}`}></div>
                        </div>

                        <div className="mb-3 sm:mb-0 w-full">
                            <span className="font-black text-xl block text-gray-800 dark:text-white tracking-wide break-all">{c.codigo}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1 mt-1">
                                📉 Descuento: <span className="text-green-600 dark:text-green-400 font-bold text-base">{c.descuento}%</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 border-gray-200 dark:border-slate-700 pt-3 sm:pt-0">
                            <button 
                                onClick={() => toggleCupon(c.id, c.activo)}
                                className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm
                                    ${c.activo 
                                        ? 'bg-white text-green-700 border border-green-200 hover:bg-green-50' 
                                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600'
                                    }`}
                            >
                                {c.activo ? 'Activo' : 'Pausado'}
                            </button>
                            
                            <button 
                                onClick={() => openModal(c)} 
                                className="px-3 py-2 bg-white dark:bg-slate-700 text-blue-500 border border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors shadow-sm"
                                title="Editar"
                            >
                                ✏️
                            </button>

                            <button 
                                onClick={() => borrarCupon(c.id)} 
                                className="px-3 py-2 bg-white dark:bg-slate-700 text-red-500 border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shadow-sm"
                                title="Eliminar"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
                
                {cupones.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-slate-900/30 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                        <p className="text-4xl mb-2 grayscale opacity-50">🎟️</p>
                        <p className="text-gray-400 font-medium">No hay cupones activos</p>
                    </div>
                )}
            </div>

            {/* --- MODAL FORMULARIO CUPONES --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-slide-up">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white">✕</button>
                        
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                            {editingId ? '✏️ Editar Cupón' : '✨ Nuevo Cupón'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Código</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: VERANO2026"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 outline-none uppercase bg-gray-50 dark:bg-slate-700 dark:text-white focus:border-green-500 transition-colors font-bold tracking-widest text-center"
                                    value={formData.codigo}
                                    onChange={e => setFormData({...formData, codigo: e.target.value})}
                                    required
                                    autoFocus
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Porcentaje de Descuento (%)</label>
                                <input 
                                    type="number" 
                                    placeholder="Ej: 20"
                                    max="100"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 outline-none bg-gray-50 dark:bg-slate-700 dark:text-white focus:border-green-500 transition-colors text-center text-lg font-bold"
                                    value={formData.descuento}
                                    onChange={e => setFormData({...formData, descuento: e.target.value})}
                                    required
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg mt-4 transition-transform active:scale-95 flex justify-center items-center gap-2"
                            >
                                {loading ? 'Guardando...' : 'Guardar Cupón'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}