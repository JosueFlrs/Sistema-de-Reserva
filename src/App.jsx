import { useEffect, useState, useRef, lazy, Suspense } from 'react'
import { supabase } from './supabase'
import Login from './Login'
import { CLUB_CONFIG } from './config'
import { HORARIOS, getProximosDias, sumarHora, generarLinkWhatsApp } from './helpers'
import { showAlert, showConfirm } from './alertSystem'

import Navbar from './components/Navbar'
/* import AdminPanel from './components/AdminPanel' */
import MyBookings from './components/MyBookings'
import InfoSection from './components/InfoSection'
import { TarjetaHorarios, TarjetaServicios } from './components/InfoCards'
import CountrySelect from './components/CountrySelect'
import CustomAlert from './components/CustomAlert'
import Footer from './components/Footer'
import { Map } from './components/ui/map'

const AdminPanel = lazy(() => import('./components/AdminPanel'))

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL
const DIAS_DISPONIBLES = getProximosDias()

function App() {
  const [session, setSession] = useState(null)
  const [mostrarLogin, setMostrarLogin] = useState(false)

  const restoreRef = useRef(null)
  const lastRestoreTimeRef = useRef(0)

  // 1. Lógica de URL
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

  const [canchas, setCanchas] = useState([])
  const [reservas, setReservas] = useState([])
  const [misReservas, setMisReservas] = useState([])

  const [diaIndex, setDiaIndex] = useState(0)
  const [mobileDaySelected, setMobileDaySelected] = useState(false)

  const [seleccion, setSeleccion] = useState(null)
  const [loading, setLoading] = useState(false)

  const [horaFiltroMovil, setHoraFiltroMovil] = useState(null)

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [telefonoUsuario, setTelefonoUsuario] = useState('')
  const [codigoPais, setCodigoPais] = useState('591')

  const [guardarTelefono, setGuardarTelefono] = useState(false)

  const [cuponInput, setCuponInput] = useState('')
  const [descuento, setDescuento] = useState(0)
  const [mensajeCupon, setMensajeCupon] = useState('')

  const dateRef = useRef(null)
  const diaActual = DIAS_DISPONIBLES[diaIndex]
  const minDate = DIAS_DISPONIBLES[0].fecha
  const maxDate = DIAS_DISPONIBLES[DIAS_DISPONIBLES.length - 1].fecha
  const esAdmin = session?.user?.email === ADMIN_EMAIL

  const [mostrarMapaDesktop, setMostrarMapaDesktop] = useState(false)

  // --- LÓGICA PARA BLOQUEAR HORAS PASADAS ---
  const esHoraPasada = (horaStr) => {
    if (diaIndex !== 0) return false
    const ahora = new Date()
    const horaActual = ahora.getHours()
    const horaTurno = parseInt(horaStr.split(':')[0])
    return horaTurno <= horaActual
  }

  useEffect(() => {
    const handlePopState = () => {
      setTabActiva(getTabFromPath(window.location.pathname))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        setMostrarLogin(false)

        const pendingReserva = localStorage.getItem('wallyPendingReserva')
        const pendingDiaIndex = localStorage.getItem('wallyPendingDiaIndex')

        if (pendingReserva && pendingDiaIndex) {
          restoreRef.current = JSON.parse(pendingReserva)
          const targetDia = parseInt(pendingDiaIndex)

          localStorage.removeItem('wallyPendingReserva')
          localStorage.removeItem('wallyPendingDiaIndex')

          window.history.replaceState(null, '', '/')
          setTabActiva('reservar')

          if (diaIndex !== targetDia) {
            setDiaIndex(targetDia)
          } else {
            cargarDatos()
          }
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    cargarDatos()
    if (session) {
      cargarMisReservas()
    } else {
      setMisReservas([])
    }
  }, [session, diaIndex])

  useEffect(() => {
    if (mostrarConfirmacion) {
      window.history.pushState({ modal: 'confirm' }, '', window.location.href)
      const handlePop = () => setMostrarConfirmacion(false)
      window.addEventListener('popstate', handlePop)
      return () => window.removeEventListener('popstate', handlePop)
    }
  }, [mostrarConfirmacion])

  useEffect(() => {
    if (mostrarLogin && !session) {
      window.history.pushState({ modal: 'login' }, '', window.location.href)
      const handlePop = () => setMostrarLogin(false)
      window.addEventListener('popstate', handlePop)
      return () => window.removeEventListener('popstate', handlePop)
    }
  }, [mostrarLogin, session])

  useEffect(() => {
    if (mostrarConfirmacion || mostrarLogin) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [mostrarConfirmacion, mostrarLogin])

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

  const requerirLogin = async () => {
    const confirmar = await showConfirm(
      "Iniciar Sesión Requerido",
      "Para realizar una reserva o ver tus turnos necesitas identificarte.\n\n¿Quieres ingresar ahora?"
    )
    if (confirmar) {
      setMostrarLogin(true)
    }
  }

  const cargarDatos = async () => {
    const { data: canchasData } = await supabase.from('canchas').select('*').order('id')
    setCanchas(canchasData || [])
    const { data: reservasData } = await supabase.from('reservas').select('*, canchas(nombre)').eq('fecha', diaActual.fecha).neq('estado', 'cancelada')
    setReservas(reservasData || [])

    if (restoreRef.current) {
      const datos = restoreRef.current
      setSeleccion(datos)
      iniciarReserva(datos, true)
      lastRestoreTimeRef.current = Date.now()
      restoreRef.current = null
    } else {
      if (Date.now() - lastRestoreTimeRef.current > 2000) {
        setSeleccion(null)
      }
    }
    setHoraFiltroMovil(null)
  }

  const cargarMisReservas = async () => {
    if (!session?.user?.id) return
    const { data } = await supabase.from('reservas').select(`*, canchas ( nombre )`).eq('usuario_id', session.user.id).neq('estado', 'cancelada').order('fecha', { ascending: true }).order('hora_inicio', { ascending: true })
    setMisReservas(data || [])
  }

  const cancelarReserva = async (id, motivoAdmin = null) => {
    if (!motivoAdmin) {
      const confirmado = await showConfirm("¿Cancelar Turno?", "Esta acción no se puede deshacer.")
      if (!confirmado) return
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

  const iniciarReserva = (datosReserva = null, skipCheck = false) => {
    const datosParaUsar = datosReserva || seleccion

    if (!session && !skipCheck) {
      if (datosParaUsar) {
        localStorage.setItem('wallyPendingReserva', JSON.stringify(datosParaUsar))
        localStorage.setItem('wallyPendingDiaIndex', diaIndex.toString())
      }
      requerirLogin()
      return
    }

    setDescuento(0)
    setCuponInput('')
    setMensajeCupon('')

    const telefonoGuardado = localStorage.getItem('wallyUserPhone')
    const paisGuardado = localStorage.getItem('wallyUserCountry')

    if (telefonoGuardado) {
      setTelefonoUsuario(telefonoGuardado)
      setGuardarTelefono(true)
      if (paisGuardado) setCodigoPais(paisGuardado)
    } else {
      setTelefonoUsuario('')
      setGuardarTelefono(false)
    }

    setMostrarConfirmacion(true)
  }

  const verificarCupon = async () => {
    if (!cuponInput) return

    const { data, error } = await supabase
      .from('cupones')
      .select('*')
      .eq('codigo', cuponInput.toUpperCase())
      .eq('activo', true)
      .single()

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
    if (!seleccion) return
    if (!telefonoUsuario || telefonoUsuario.length < 6) { await showAlert("Falta información", "Por favor ingresa un número válido.", "error"); return }
    if (guardarTelefono) { localStorage.setItem('wallyUserPhone', telefonoUsuario); localStorage.setItem('wallyUserCountry', codigoPais) }
    else { localStorage.removeItem('wallyUserPhone'); localStorage.removeItem('wallyUserCountry') }

    setLoading(true)
    const { data: ocupado } = await supabase.from('reservas').select('id').eq('cancha_id', seleccion.canchaId).eq('fecha', diaActual.fecha).eq('hora_inicio', seleccion.hora).neq('estado', 'cancelada').maybeSingle()

    if (ocupado) {
      setLoading(false); setMostrarConfirmacion(false); await showAlert("¡Lo sentimos!", "Alguien ganó este turno hace unos segundos.", "error"); cargarDatos(); return
    }

    const telefonoCompleto = codigoPais + telefonoUsuario.replace(/\D/g, '')
    const cancha = canchas.find(c => c.id === seleccion.canchaId)
    const precioFinal = Math.max(0, cancha.precio_hora - descuento)

    const { error } = await supabase.from('reservas').insert([{
      cancha_id: seleccion.canchaId, usuario_id: session.user.id, fecha: diaActual.fecha, hora_inicio: seleccion.hora, hora_fin: sumarHora(seleccion.hora), total: precioFinal, estado: 'pendiente', nombre_cliente: session.user.user_metadata.full_name || 'Web App', telefono: telefonoCompleto, descuento_aplicado: descuento
    }])

    if (error) await showAlert("Error", error.message, "error")
    else {
      const mensaje = `¡Hola! Reserva en ${CLUB_CONFIG.nombre} ⚽\n📅 ${diaActual.etiquetaDesktop}\n⏰ ${seleccion.hora}\n📍 ${seleccion.nombre}\n💰 $${precioFinal}`
      const link = generarLinkWhatsApp(telefonoCompleto, mensaje)
      const quiereWp = await showConfirm("¡Reserva Exitosa!", "Tu turno ha sido agendado.\n¿Recibir comprobante por WhatsApp?")
      if (quiereWp) window.open(link, '_blank')
      setMostrarConfirmacion(false); cargarDatos(); cargarMisReservas();

      const nuevaRuta = getPathFromTab('mis_turnos')
      window.history.pushState({ tab: 'mis_turnos' }, '', nuevaRuta)
      setTabActiva('mis_turnos')
    }
    setLoading(false)
  }

  const adminCambiarEstadoPago = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'pagada' ? 'pendiente' : 'pagada'
    const { error } = await supabase.from('reservas').update({ estado: nuevoEstado }).eq('id', id)
    if (!error) cargarDatos()
  }

  const handleCalendarChange = (e) => {
    const idx = DIAS_DISPONIBLES.findIndex(d => d.fecha === e.target.value)
    if (idx !== -1) setDiaIndex(idx)
  }
  const abrirCalendario = () => { try { dateRef.current.showPicker() } catch { dateRef.current.focus() } }

  const irASeccion = (sec) => {
    if (sec === 'mis_turnos' && !session) {
      requerirLogin()
      return
    }
    const nuevaRuta = getPathFromTab(sec)
    window.history.pushState({ tab: sec }, '', nuevaRuta)
    setTabActiva(sec)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const irAMapa = () => {
    irASeccion('info')
    setTimeout(() => document.getElementById('seccion-mapa')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const estaOcupada = (cId, h) => reservas.some(r => r.cancha_id === cId && r.hora_inicio.slice(0, 5) === h)
  const esHorarioLleno = (h) => reservas.filter(r => r.hora_inicio.slice(0, 5) === h).length >= canchas.length

  const handleLogout = async () => {
    Object.keys(localStorage).forEach((key) => { if (key.startsWith('sb-')) localStorage.removeItem(key) })
    localStorage.removeItem('wallyPendingReserva'); localStorage.removeItem('wallyPendingDiaIndex')
    window.location.href = '/'
  }

  if (mostrarLogin && !session) {
    return <Login onCancel={() => setMostrarLogin(false)} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans text-gray-800 dark:text-gray-100 pb-0 pt-16 transition-colors duration-300 flex flex-col">
      <CustomAlert />

      <Navbar
        irASeccion={irASeccion}
        irAMapa={irAMapa}
        tabActiva={tabActiva}
        esAdmin={esAdmin}
        onLogout={handleLogout}
        user={session?.user}
        onLoginClick={() => setMostrarLogin(true)}
      />

      {tabActiva !== 'admin' && (
        <div className="relative">
          <div className="h-full md:h-[350px] w-full overflow-hidden">
            <img src={CLUB_CONFIG.imagenFondo} alt="Estadio" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
          </div>
          <div className="md:hidden relative -mt-6 bg-white dark:bg-slate-800 rounded-t-[30px] px-6 pt-6 pb-2 shadow-sm z-10 transition-colors">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{CLUB_CONFIG.nombre}</h1>
            <div className="flex items-center gap-1 text-gray-400 text-xs mt-1 mb-6">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {CLUB_CONFIG.direccion}</div>
            <div className="flex border-b border-gray-200 dark:border-slate-700">
              <div className="flex-1 pb-3 text-sm font-bold text-center border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {tabActiva === 'reservar' ? 'RESERVAR' : tabActiva === 'mis_turnos' ? 'MIS TURNOS' : 'INFO GENERAL'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-8 flex-grow w-full pb-52">

        {tabActiva === 'admin' && esAdmin && (
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 text-sm font-medium">Cargando panel...</p>
                </div>
            }>
                <AdminPanel
                    canchas={canchas} reservas={reservas} diaActual={diaActual} userId={session.user.id}
                    onPrevDay={() => setDiaIndex(Math.max(0, diaIndex - 1))}
                    onNextDay={() => setDiaIndex(Math.min(DIAS_DISPONIBLES.length - 1, diaIndex + 1))}
                    onCancel={cancelarReserva}
                    onChangePaymentStatus={adminCambiarEstadoPago}
                    onReloadApp={cargarDatos}
                />
            </Suspense>
        )}

        {/* --- SECCIÓN RESERVAR --- */}
        <div className={`${tabActiva === 'reservar' && tabActiva !== 'admin' ? 'block' : 'hidden'}`}>
          {!((tabActiva === 'admin') && esAdmin) && (
            <div className="animate-fade-in">
              {/* PASO 1: Selector de Día */}
              <div className="md:hidden">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">1. Elige una fecha</h2>

                <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-4">
                  {DIAS_DISPONIBLES.map((dia, index) => {
                    const esSeleccionado = mobileDaySelected && index === diaIndex
                    return (
                      <button key={index}
                        onClick={() => {
                          setDiaIndex(index);
                          setHoraFiltroMovil(null);
                          setMobileDaySelected(true);
                        }}
                        className={`min-w-[70px] h-[60px] rounded-xl flex flex-col items-center justify-center border transition-all 
                            ${esSeleccionado
                            ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-600 dark:text-blue-400 shadow-md'
                            : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                        <span className="text-[10px] font-bold tracking-widest">{dia.movilDia}</span>
                        <span className="text-lg font-bold leading-none">{dia.movilNum}</span>
                        <span className="text-[10px]">{dia.movilMes}</span>
                      </button>
                    )
                  })}
                </div>

                {/* --- MENSAJE CONDICIONAL: Se oculta al seleccionar fecha --- */}
                {!mobileDaySelected && (
                  <div className="text-center py-6 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl mb-6 bg-gray-50/50 dark:bg-slate-800/30">👆 Selecciona una fecha para ver los horarios</div>
                )}
              </div>

              {/* PASO 2: Selector de Horario */}
              <div id="paso-2-horarios" className={`md:hidden space-y-4 scroll-mt-24 transition-opacity duration-500 ${mobileDaySelected ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">2. Elige un horario</h2>

                <div className="grid grid-cols-4 gap-3 mb-4">
                  {HORARIOS.map(hora => (
                    <button key={hora}
                      disabled={esHorarioLleno(hora) || esHoraPasada(hora)}
                      onClick={() => setHoraFiltroMovil(hora)}
                      className={`py-3 rounded-lg text-sm font-bold border shadow-sm transition-colors
                        ${(esHorarioLleno(hora) || esHoraPasada(hora))
                          ? 'bg-gray-100 dark:bg-slate-800 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
                          : horaFiltroMovil === hora
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-slate-700'}`}>
                      {hora}
                    </button>
                  ))}
                </div>

                {/* --- MENSAJE CONDICIONAL: Se oculta al seleccionar hora --- */}
                {!horaFiltroMovil && (
                  <div className="text-center py-6 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl mb-6 bg-gray-50/50 dark:bg-slate-800/30">👆 Selecciona un horario para ver las canchas</div>
                )}
              </div>

              {/* PASO 3: Selector de Cancha */}
              {horaFiltroMovil && mobileDaySelected && (
                <div id="paso-3-canchas" className="animate-slide-up space-y-4 scroll-mt-32 md:hidden mt-8 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">3. Selecciona una cancha</h2>

                  {canchas.filter(c => !estaOcupada(c.id, horaFiltroMovil)).map(c => (
                    <div key={c.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 transition-colors">
                      <div className="flex justify-between mb-4">
                        <div><h3 className="font-bold text-lg text-gray-800 dark:text-white">{c.nombre}</h3><p className="text-xs text-gray-400">Sintético | Cubierta</p></div>
                        <div className="text-right"><span className="block font-bold text-blue-600 dark:text-blue-400 text-lg">{c.precio_hora} Bs</span></div>
                      </div>
                      <button
                        onClick={() => {
                          const datos = { canchaId: c.id, hora: horaFiltroMovil, precio: c.precio_hora, nombre: c.nombre }
                          setSeleccion(datos);
                          iniciarReserva(datos);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow active:scale-95"
                      >
                        CONFIRMAR
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* DESKTOP */}
              <div className="hidden md:block">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Elige tu turno</h2>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mb-12 transition-colors">
                  <div className="flex border-b border-gray-200 dark:border-slate-700 p-2 items-center justify-between">
                    <div className="flex items-center gap-4 px-4">
                      <img src={CLUB_CONFIG.emoji} alt="Estadio" className="w-9 h-9 object-cover" />
                      <span className="font-bold text-lg dark:text-white">Calendario</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setDiaIndex(Math.max(0, diaIndex - 1))} className="text-2xl hover:text-blue-600 text-gray-400 dark:text-gray-500">{'<'}</button>
                      <div onClick={abrirCalendario} className="relative cursor-pointer border-b-2 border-blue-500 pb-1 px-2 font-bold text-lg dark:text-white">
                        {diaActual.etiquetaDesktop}
                        <input ref={dateRef} type="date" value={diaActual.fecha} min={minDate} max={maxDate} onChange={handleCalendarChange} className="absolute inset-0 opacity-0 pointer-events-none" />
                      </div>
                      <button onClick={() => setDiaIndex(Math.min(DIAS_DISPONIBLES.length - 1, diaIndex + 1))} className="text-2xl hover:text-blue-600 text-gray-400 dark:text-gray-500">{'>'}</button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="flex min-w-[800px] border-b border-gray-100 dark:border-slate-700">
                      <div className="w-[200px] flex-shrink-0 bg-gray-50 dark:bg-slate-800/50"></div>
                      <div className="flex-1 flex">
                        {HORARIOS.map(h => <div key={h} className="flex-1 text-center py-4 text-sm font-medium text-gray-500 dark:text-gray-400 border-l border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">{h}</div>)}
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-slate-700 min-w-[800px]">
                      {canchas.map(c => (
                        <div key={c.id} className="flex h-28 group hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                          <div className="w-[200px] flex-shrink-0 p-4 border-r border-gray-100 dark:border-slate-700 flex flex-col justify-center">
                            <div className="font-bold text-sm text-gray-800 dark:text-white mb-1">{c.nombre}</div>
                            <div className="text-xs text-gray-400">Sintético | Cubierta</div>
                          </div>
                          <div className="flex-1 flex">
                            {HORARIOS.map(h => (
                              <div key={h} className="flex-1 border-l border-gray-100 dark:border-slate-700 p-2 relative">
                                {(estaOcupada(c.id, h) || esHoraPasada(h)) ? (
                                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 cursor-not-allowed relative group">
                                    <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-2 py-1 rounded whitespace-nowrap mb-1 z-10">
                                      {esHoraPasada(h) ? 'Hora pasada' : 'Ocupado'}
                                    </span>
                                  </div>
                                ) : (
                                  <button onClick={() => setSeleccion({ canchaId: c.id, hora: h, precio: c.precio_hora, nombre: c.nombre })} className={`w-full h-full rounded-md transition-all ${seleccion?.canchaId === c.id && seleccion?.hora === h ? 'bg-blue-500 shadow-md scale-95' : 'hover:bg-blue-200 dark:hover:bg-blue-900/50'}`} />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div id="seccion-mapa" className="scroll-mt-20">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Información</h2>
                  
                  {/* Fila de Tarjetas Informativas (3 columnas) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* 1. Tarjeta Horarios */}
                      <TarjetaHorarios />

                    {/* 2. Tarjeta Servicios */}
                      <TarjetaServicios />

                    {/* 3. Tarjeta Ubicación (Extraída del panel lateral anterior) */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-4 transition-colors justify-between flex flex-col">
                      <div>
                        <h3 className="font-bold mb-4 dark:text-white text-lg">Ubicación</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{CLUB_CONFIG.direccion}</p>
                      </div>
                      <a
                        href="https://www.google.com/maps/dir/?api=1&destination=-32.852333,-68.863624"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        Ver en Google Maps
                      </a>
                    </div>
                  </div>

                  {/* Fila del Mapa (Ancho completo) */}
                  <div className="w-full bg-white dark:bg-slate-800 h-[400px] rounded-xl shadow overflow-hidden relative border border-gray-200 dark:border-slate-700">
                    
                      <Map
                        initialViewState={{
                          longitude: -68.863624,
                          latitude: -32.852333,
                          zoom: 15
                        }}
                        className="w-full h-full"
                      />
                    )
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ... (Resto de modales) ... */}
        <div className={`${tabActiva === 'mis_turnos' ? 'block' : 'hidden'} animate-fade-in`}>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Mis Reservas</h2>
          <div className="max-w-3xl">
            <MyBookings misReservas={misReservas} onCancel={cancelarReserva} />
          </div>
        </div>

        <div className={`${tabActiva === 'info' ? 'block' : 'hidden'} pt-4 md:hidden`}>
          <InfoSection />
        </div>

        {seleccion && !mostrarConfirmacion && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-blue-500 shadow-[0_-5px_30px_rgba(0,0,0,0.15)] p-4 animate-slide-up z-50 rounded-t-[30px] md:rounded-none transition-colors hidden md:block">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="text-left"><div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Cancha</div><div className="font-bold text-gray-800 dark:text-white text-lg">{seleccion.nombre}</div></div>
                <div className="h-8 w-px bg-gray-300 dark:bg-slate-600"></div>
                <div className="text-left"><div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Hora</div><div className="font-bold text-gray-800 dark:text-white text-lg">{seleccion.hora}</div></div>
              </div>
              <button
                onClick={() => iniciarReserva(seleccion)}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto px-8 py-3 rounded-lg font-bold text-lg shadow-lg flex justify-center items-center gap-2"
              >
                Continuar - {seleccion.precio} Bs
              </button>
            </div>
          </div>
        )}

        {mostrarConfirmacion && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-4 md:p-6 relative transition-colors">
              <button onClick={() => setMostrarConfirmacion(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white">✕</button>

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
                    <input
                      type="checkbox"
                      id="guardarTel"
                      checked={guardarTelefono}
                      onChange={(e) => setGuardarTelefono(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                    />
                    <label htmlFor="guardarTel" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                      Guardar para futuras reservas
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">¿Tienes un cupón?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="CÓDIGO"
                      value={cuponInput}
                      onChange={e => setCuponInput(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 uppercase focus:border-blue-500 outline-none dark:bg-slate-700 dark:text-white w-full"
                    />
                    <button onClick={verificarCupon} type="button" className="bg-blue-600 text-white px-4 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-sm">
                      APLICAR
                    </button>
                  </div>
                  {mensajeCupon && <p className={`text-xs mt-1 font-bold ${descuento > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{mensajeCupon}</p>}
                </div>

                <button
                  onClick={confirmarReservaFinal}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transform transition active:scale-95 flex justify-center items-center gap-2 mt-4"
                >
                  {loading ? 'Procesando...' : 'FINALIZAR RESERVA 🚀'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <Footer />

    </div>
  )
}

export default App