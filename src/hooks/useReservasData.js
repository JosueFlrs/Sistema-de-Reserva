import { useState, useCallback } from 'react'
import { supabase } from '../supabase'
import { showAlert, showConfirm } from '../alertSystem'

export function useReservasData(diaActual, session) {
    const [canchas, setCanchas] = useState([])
    const [reservas, setReservas] = useState([])
    const [misReservas, setMisReservas] = useState([])

    const cargarDatos = useCallback(async () => {
        const { data: canchasData } = await supabase.from('canchas').select('*').order('id')
        setCanchas(canchasData || [])

        const { data: reservasData } = await supabase
            .from('reservas')
            .select('*, canchas(nombre)')
            .eq('fecha', diaActual.fecha)
            .neq('estado', 'cancelada')
        setReservas(reservasData || [])
    }, [diaActual])

    const cargarMisReservas = useCallback(async () => {
        if (!session?.user?.id) {
            setMisReservas([])
            return
        }
        const { data } = await supabase
            .from('reservas')
            .select(`*, canchas ( nombre )`)
            .eq('usuario_id', session.user.id)
            .neq('estado', 'cancelada')
            .order('fecha', { ascending: true })
            .order('hora_inicio', { ascending: true })
        setMisReservas(data || [])
    }, [session])

    const cancelarReserva = async (id, motivoAdmin = null) => {
        if (!motivoAdmin) {
            const confirmado = await showConfirm("¿Cancelar Turno?", "Esta acción no se puede deshacer.")
            if (!confirmado) return false
        }
        const { error } = await supabase.from('reservas').update({ estado: 'cancelada' }).eq('id', id)
        if (!error) {
            if (!motivoAdmin) await showAlert("Cancelado", "La reserva ha sido cancelada exitosamente.")
            cargarDatos()
            cargarMisReservas()
            return true
        } else {
            await showAlert("Error", error.message, "error")
            return false
        }
    }

    const adminCambiarEstadoPago = async (id, estadoActual) => {
        const nuevoEstado = estadoActual === 'pagada' ? 'pendiente' : 'pagada'
        const { error } = await supabase.from('reservas').update({ estado: nuevoEstado }).eq('id', id)
        if (!error) cargarDatos()
    }

    return {
        canchas,
        reservas,
        misReservas,
        cargarDatos,
        cargarMisReservas,
        cancelarReserva,
        adminCambiarEstadoPago
    }
}