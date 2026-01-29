import { useState, useEffect } from 'react'
import { CLUB_CONFIG } from '../config'
import { generarLinkWhatsApp } from '../helpers' 

export default function Navbar({ irASeccion, irAMapa, tabActiva, esAdmin, onLogout, user, onLoginClick }) {
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
    const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false)
    
    const linkContacto = generarLinkWhatsApp(CLUB_CONFIG.telefono, "¡Hola! 👋 Quisiera hacer una consulta sobre la cancha.")

    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
        }
        return false
    })

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [darkMode])

    useEffect(() => {
        if (menuMovilAbierto) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [menuMovilAbierto])

    const handleNav = (action) => {
        action()
        setMenuMovilAbierto(false)
    }

    // --- CORRECCIÓN 1: Buscar la imagen en ambas propiedades posibles ---
    const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
    const fullName = user?.user_metadata?.full_name || user?.email
    const inicial = fullName ? fullName.charAt(0).toUpperCase() : 'U'

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 shadow-md z-50 flex items-center justify-between px-4 md:px-8 transition-colors duration-300">
                
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav(() => irASeccion('reservar'))}>
                    <img src={CLUB_CONFIG.emoji} alt="Estadio" className="w-9 h-9 object-cover" />
                    <span className="font-bold text-xl text-gray-800 dark:text-white tracking-tight transition-colors">{CLUB_CONFIG.nombre}</span>
                </div>

                {/* DESKTOP MENU */}
                <div className="hidden md:flex items-center gap-6">
                    <button 
                        onClick={() => setDarkMode(!darkMode)} 
                        className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                    >
                        {darkMode ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </button>

                    <button onClick={() => irASeccion('reservar')} className={`font-medium transition-colors ${tabActiva === 'reservar' ? 'text-blue-600 font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'}`}>Reservar</button>
                    <button onClick={() => irASeccion('mis_turnos')} className={`font-medium transition-colors ${tabActiva === 'mis_turnos' ? 'text-blue-600 font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'}`}>Mis Turnos</button>
                    
                    <a href={linkContacto} target="_blank" rel="noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors flex items-center gap-1">Contacto</a>

                    {esAdmin && (
                        <button onClick={() => irASeccion('admin')} className="bg-slate-800 dark:bg-slate-700 text-white px-3 py-1 rounded hover:bg-black transition text-sm font-bold shadow-lg border border-slate-600 flex items-center gap-2">
                            <span>🛠️</span> ADMIN
                        </button>
                    )}

                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>

                    {/* USUARIO O LOGIN */}
                    <div className="relative">
                        {user ? (
                            <>
                                <button onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)} className="flex items-center gap-2 focus:outline-none group">
                                    {avatarUrl ? (
                                        // --- CORRECCIÓN 2: referrerPolicy="no-referrer" ---
                                        <img 
                                            src={avatarUrl} 
                                            alt="Perfil" 
                                            referrerPolicy="no-referrer" 
                                            className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm" 
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-200 font-bold shadow-sm">
                                            {inicial}
                                        </div>
                                    )}
                                </button>
                                {menuUsuarioAbierto && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setMenuUsuarioAbierto(false)}></div>
                                        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-20 animate-fade-in-down origin-top-right">
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 mb-1 bg-gray-50 dark:bg-slate-800/50">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Hola</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{fullName}</p>
                                            </div>
                                            <button onClick={() => { setMenuUsuarioAbierto(false); irASeccion('mis_turnos'); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 flex items-center gap-2">
                                                <span>📅</span> Mis Reservas
                                            </button>
                                            <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 font-medium">
                                                <span>🚪</span> Cerrar Sesión
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <button onClick={onLoginClick} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors">
                                Iniciar Sesión
                            </button>
                        )}
                    </div>
                </div>

                {/* MOBILE MENU TOGGLE */}
                <div className="flex items-center gap-4 md:hidden">
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400">
                        {darkMode ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </button>
                    <button className="p-2 text-gray-600 dark:text-white" onClick={() => setMenuMovilAbierto(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                    </button>
                </div>
            </nav>

            {/* SIDEBAR MÓVIL */}
            <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 md:hidden ${menuMovilAbierto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMenuMovilAbierto(false)} />
            <div className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${menuMovilAbierto ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full text-gray-800 dark:text-white relative">
                    <div className="p-6 bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            {user ? (
                                avatarUrl ? (
                                    // --- CORRECCIÓN 3: referrerPolicy="no-referrer" en móvil ---
                                    <img 
                                        src={avatarUrl} 
                                        alt="Perfil" 
                                        referrerPolicy="no-referrer"
                                        className="w-14 h-14 rounded-full border-2 border-white dark:border-slate-600 shadow-md" 
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-200 font-bold text-xl shadow-sm">{inicial}</div>
                                )
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-2xl">👋</div>
                            )}
                            <button onClick={() => setMenuMovilAbierto(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
                        </div>
                        <p className="text-sm font-bold truncate">{user ? fullName : 'Bienvenido'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user ? user.email : 'Invitado'}</p>
                    </div>
                    
                    <div className="flex flex-col p-4 space-y-2">
                        <button onClick={() => handleNav(() => irASeccion('reservar'))} className="flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl text-left transition-colors">
                        
                        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        
                        <span className="font-bold">Reservar Cancha</span></button>
                        <button onClick={() => handleNav(() => irASeccion('mis_turnos'))} className="flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl text-left transition-colors">
                        
                        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        
                        <span className="font-bold">Mis Turnos</span></button>
                        <button onClick={() => handleNav(irAMapa)} className="flex items-center gap-3 p-3 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-xl text-left transition-colors">
                        
                        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> 

                        <span className="font-bold">Ubicación y Info</span></button>
                        {esAdmin && (
                            <button onClick={() => handleNav(() => irASeccion('admin'))} className="flex items-center gap-3 p-3 bg-slate-800 text-white rounded-xl text-left transition-colors mt-4">
                                <span className="text-xl">🛠️</span><span className="font-bold">PANEL ADMIN</span>
                            </button>
                        )}
                    </div>

                    <div className="mt-auto p-4 border-t border-gray-100 dark:border-slate-700">
                        {user ? (
                            <button onClick={onLogout} className="flex items-center gap-3 p-3 w-full text-left text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 transition-colors"><span className="text-xl">🚪</span><span className="font-bold">Cerrar Sesión</span></button>
                        ) : (
                            <button onClick={() => { setMenuMovilAbierto(false); onLoginClick(); }} className="flex items-center gap-3 p-3 w-full text-left text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 transition-colors"><span className="text-xl">🔑</span><span className="font-bold">Iniciar Sesión</span></button>
                        )}
                    </div>

                    <a href={linkContacto} target="_blank" rel="noreferrer" className="absolute bottom-24 right-6 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center animate-fade-in-up">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    </a>
                </div>
            </div>
        </>
    )
}