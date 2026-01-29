import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function ExpenseTracker() {
    const [gastos, setGastos] = useState([])
    const [concepto, setConcepto] = useState('')
    const [monto, setMonto] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        cargarGastos()
    }, [])

    const cargarGastos = async () => {
        const { data } = await supabase.from('gastos').select('*').order('id', { ascending: false })
        setGastos(data || [])
    }

    const agregarGasto = async (e) => {
        e.preventDefault()
        if (!concepto || !monto) return
        setLoading(true)
        
        const { error } = await supabase.from('gastos').insert([
            { concepto, monto: parseFloat(monto), fecha: new Date().toISOString().split('T')[0] }
        ])

        if (!error) {
            setConcepto('')
            setMonto('')
            cargarGastos()
        } else {
            alert(error.message)
        }
        setLoading(false)
    }

    const borrarGasto = async (id) => {
        if(!confirm('¿Borrar este gasto?')) return
        await supabase.from('gastos').delete().eq('id', id)
        cargarGastos()
    }

    const totalGastos = gastos.reduce((acc, curr) => acc + curr.monto, 0)

    return (
        // CAMBIO: p-6 -> p-4
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700 p-4 md:p-6 animate-fade-in h-full transition-colors">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                📉 Caja Chica
            </h3>

            {/* Formulario Optimizado */}
            <form onSubmit={agregarGasto} className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    placeholder="Ej: Luz" 
                    className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white placeholder-gray-400"
                    value={concepto}
                    onChange={e => setConcepto(e.target.value)}
                />
                <input 
                    type="number" 
                    placeholder="$" 
                    className="w-16 md:w-20 border rounded-lg px-2 md:px-3 py-2 text-sm outline-none focus:border-red-400 bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white placeholder-gray-400 text-center"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                />
                <button disabled={loading} className="bg-red-500 text-white w-10 rounded-lg font-bold hover:bg-red-600 transition flex items-center justify-center shadow-sm flex-shrink-0">
                    +
                </button>
            </form>

            {/* Resumen */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 rounded-lg mb-4 flex justify-between items-center">
                <span className="text-red-800 dark:text-red-300 text-sm font-medium">Total Gastos</span>
                <span className="text-xl font-bold text-red-600 dark:text-red-400">${totalGastos}</span>
            </div>

            {/* Lista con Truncate para evitar desbordes */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {gastos.map(g => (
                    <div key={g.id} className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-slate-700 pb-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 px-1 rounded transition-colors gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="text-gray-400 text-[10px] block">{g.fecha}</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300 truncate block" title={g.concepto}>{g.concepto}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">- ${g.monto}</span>
                            <button onClick={() => borrarGasto(g.id)} className="text-gray-300 hover:text-red-500 dark:hover:text-red-400 font-bold px-1">×</button>
                        </div>
                    </div>
                ))}
                {gastos.length === 0 && <p className="text-center text-gray-400 text-xs py-4">Sin gastos registrados.</p>}
            </div>
        </div>
    )
}