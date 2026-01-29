import { useState } from 'react'
import { supabase } from '../supabase'
import { showConfirm, showAlert } from '../alertSystem'

export default function CourtsManager({ canchas, onReload }) {
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    
    // Estado del formulario unificado
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio_hora: ''
    })

    // Abrir modal (limpio si es crear, lleno si es editar)
    const openModal = (cancha = null) => {
        if (cancha) {
            setEditingId(cancha.id)
            setFormData({
                nombre: cancha.nombre,
                descripcion: cancha.tipo || '', 
                precio_hora: cancha.precio_hora
            })
        } else {
            setEditingId(null)
            setFormData({ nombre: '', descripcion: '', precio_hora: '' })
        }
        setShowModal(true)
    }

    // Guardar (Crear o Editar)
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.nombre || !formData.precio_hora) return

        setLoading(true)
        try {
            if (editingId) {
                // EDITAR
                const { error } = await supabase.from('canchas').update({
                    nombre: formData.nombre,
                    tipo: formData.descripcion,
                    precio_hora: parseInt(formData.precio_hora)
                }).eq('id', editingId)
                if (error) throw error
                await showAlert("Actualizado", "Los cambios se guardaron correctamente.", "success")
            } else {
                // CREAR
                const { error } = await supabase.from('canchas').insert([{
                    nombre: formData.nombre,
                    tipo: formData.descripcion,
                    precio_hora: parseInt(formData.precio_hora),
                    techada: true
                }])
                if (error) throw error
                await showAlert("¡Listo!", "Nueva cancha agregada.", "success")
            }
            
            setShowModal(false)
            if (onReload) await onReload()
            
        } catch (error) {
            await showAlert("Error", error.message, "error")
        } finally {
            setLoading(false)
        }
    }

    // Borrar
    const handleDeleteCancha = async (id) => {
        const confirm = await showConfirm("¿Eliminar Cancha?", "Esta acción no se puede deshacer.")
        if (!confirm) return

        setLoading(true)
        const { error } = await supabase.from('canchas').delete().eq('id', id)

        if (error) await showAlert("Error", "No se puede borrar si tiene reservas asociadas.", "error")
        else {
            await showAlert("Eliminado", "La cancha ha sido eliminada.", "success")
            if (onReload) await onReload()
        }
        setLoading(false)
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700 p-6 animate-fade-in transition-colors">
            
            {/* CABECERA */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">🏟️ Mis Canchas</h3>
                <button 
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
                >
                    + Nueva Cancha
                </button>
            </div>

            {/* LISTA DE CANCHAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {canchas.map(c => (
                    <div key={c.id} className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 hover:border-blue-300 transition-colors">
                        <div>
                            <h4 className="font-bold text-lg text-gray-800 dark:text-white">{c.nombre}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{c.tipo || 'Sin descripción'}</p>
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">${c.precio_hora} / hora</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => openModal(c)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                title="Editar"
                            >
                                ✏️
                            </button>
                            <button 
                                onClick={() => handleDeleteCancha(c.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Eliminar"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {canchas.length === 0 && (
                <p className="text-center text-gray-400 py-8">No hay canchas registradas.</p>
            )}

            {/* --- MODAL FORMULARIO --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-slide-up">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white">✕</button>
                        
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                            {editingId ? '✏️ Editar Cancha' : '✨ Nueva Cancha'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Nombre</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: Cancha 1"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 outline-none bg-gray-50 dark:bg-slate-700 dark:text-white focus:border-blue-500 transition-colors"
                                    value={formData.nombre}
                                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                                    required
                                    autoFocus
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Información Extra</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: Sintético, Techada, 5vs5"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 outline-none bg-gray-50 dark:bg-slate-700 dark:text-white focus:border-blue-500 transition-colors"
                                    value={formData.descripcion}
                                    onChange={e => setFormData({...formData, descripcion: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Precio por Hora ($)</label>
                                <input 
                                    type="number" 
                                    placeholder="Ej: 150"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 outline-none bg-gray-50 dark:bg-slate-700 dark:text-white focus:border-blue-500 transition-colors"
                                    value={formData.precio_hora}
                                    onChange={e => setFormData({...formData, precio_hora: e.target.value})}
                                    required
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg mt-4 transition-transform active:scale-95 flex justify-center items-center gap-2"
                            >
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}