import { useState, useRef, useEffect } from 'react'
import { getProximosDias } from '../helpers'

const DIAS_DISPONIBLES = getProximosDias()

export function useBookingFlow() {
    // Lógica de URL
    const getTabFromPath = (path) => {
        if (path === '/mis-turnos') return 'mis_turnos'
        if (path === '/info') return 'info'
        return 'reservar'
    }

    const getPathFromTab = (tab) => {
        if (tab === 'mis_turnos') return '/mis-turnos'
        if (tab === 'info') return '/info'
        return '/'
    }

    const [tabActiva, setTabActiva] = useState(() => getTabFromPath(window.location.pathname))
    const [diaIndex, setDiaIndex] = useState(0)
    const [mobileDaySelected, setMobileDaySelected] = useState(false)
    const [horaFiltroMovil, setHoraFiltroMovil] = useState(null)
    const [seleccion, setSeleccion] = useState(null)
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
    const [mostrarMapaDesktop, setMostrarMapaDesktop] = useState(false)

    const dateRef = useRef(null)

    const diaActual = DIAS_DISPONIBLES[diaIndex]
    const minDate = DIAS_DISPONIBLES[0].fecha
    const maxDate = DIAS_DISPONIBLES[DIAS_DISPONIBLES.length - 1].fecha

    // Manejo del historial del navegador
    useEffect(() => {
        const handlePopState = () => {
            setTabActiva(getTabFromPath(window.location.pathname))
            // Cerrar modales si se retrocede
            if (mostrarConfirmacion) setMostrarConfirmacion(false)
        }
        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [mostrarConfirmacion])

    // Scroll automático en móvil
    useEffect(() => {
        if (mobileDaySelected) {
            setTimeout(() => {
                const elemento = document.getElementById('paso-2-horarios')
                if (elemento) {
                    const rect = elemento.getBoundingClientRect()
                    const y = window.scrollY + rect.bottom - window.innerHeight + 80
                    window.scrollTo({ top: y, behavior: 'smooth' })
                }
            }, 150)
        }
    }, [diaIndex, mobileDaySelected])

    useEffect(() => {
        if (horaFiltroMovil) {
            setTimeout(() => {
                const elemento = document.getElementById('paso-3-canchas')
                if (elemento) {
                    const rect = elemento.getBoundingClientRect()
                    const y = window.scrollY + rect.bottom - window.innerHeight + 80
                    window.scrollTo({ top: y, behavior: 'smooth' })
                }
            }, 300)
        }
    }, [horaFiltroMovil])

    const handleCalendarChange = (e) => {
        const idx = DIAS_DISPONIBLES.findIndex(d => d.fecha === e.target.value)
        if (idx !== -1) setDiaIndex(idx)
    }

    const abrirCalendario = () => { try { dateRef.current.showPicker() } catch { dateRef.current.focus() } }

    const irASeccion = (sec) => {
        const nuevaRuta = getPathFromTab(sec)
        window.history.pushState({ tab: sec }, '', nuevaRuta)
        setTabActiva(sec)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const irAMapa = () => {
        irASeccion('info')
        setTimeout(() => document.getElementById('seccion-mapa')?.scrollIntoView({ behavior: 'smooth' }), 100)
    }

    return {
        tabActiva, setTabActiva,
        diaIndex, setDiaIndex,
        mobileDaySelected, setMobileDaySelected,
        horaFiltroMovil, setHoraFiltroMovil,
        seleccion, setSeleccion,
        mostrarConfirmacion, setMostrarConfirmacion,
        mostrarMapaDesktop, setMostrarMapaDesktop,
        diaActual, minDate, maxDate, dateRef,
        DIAS_DISPONIBLES,
        handleCalendarChange, abrirCalendario, irASeccion, irAMapa, getPathFromTab
    }
}