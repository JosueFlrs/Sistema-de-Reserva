import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useAuth() {
    const [session, setSession] = useState(null)
    const [mostrarLogin, setMostrarLogin] = useState(false)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session))

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (session) setMostrarLogin(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = () => {
        // Limpieza agresiva de localStorage relacionada con Supabase y la App
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('sb-')) localStorage.removeItem(key)
        })
        localStorage.removeItem('wallyPendingReserva')
        localStorage.removeItem('wallyPendingDiaIndex')
        window.location.href = '/'
    }

    return {
        session,
        mostrarLogin,
        setMostrarLogin,
        handleLogout
    }
}