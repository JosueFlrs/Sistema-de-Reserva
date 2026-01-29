import { CLUB_CONFIG } from '../config'

export default function Footer({ irASeccion }) {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 pt-12 pb-6 mt-auto transition-colors">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

                    {/* COLUMNA 1: MARCA */}
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                            <img src={CLUB_CONFIG.emoji} alt="Estadio" className="w-9 h-9 object-cover" />
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
                                {CLUB_CONFIG.nombre}
                            </h4>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            Tu lugar favorito para disfrutar del deporte con amigos. 
                            Canchas de primera calidad y el mejor ambiente.
                        </p>
                        
                        {/* Redes Sociales (Iconos SVG) */}
                        <div className="flex justify-center md:justify-start gap-4">
                            <a href="#" className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </a>
                        </div>
                    </div>

                    {/* COLUMNA 2: ENLACES */}
                    <div className="text-center">
                        <h5 className="font-bold text-gray-800 dark:text-white mb-4 uppercase text-sm tracking-wider">Enlaces Rápidos</h5>
                        <ul className="space-y-2">
                            <li>
                                <button onClick={() => irASeccion('reservar')} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                                    Reservar Cancha
                                </button>
                            </li>
                            <li>
                                <button onClick={() => irASeccion('mis_turnos')} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                                    Mis Turnos
                                </button>
                            </li>
                            <li>
                                <button onClick={() => irASeccion('info')} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                                    Ubicación y Info
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* COLUMNA 3: CONTACTO */}
                    <div className="text-center md:text-right">
                        <h5 className="font-bold text-gray-800 dark:text-white mb-4 uppercase text-sm tracking-wider">Visítanos</h5>
                        
                        <div className="flex flex-col items-center md:items-end gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <p className="flex items-center gap-2">
                                <span>{CLUB_CONFIG.direccion}</span>
                                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </p>
                            
                            <p className="flex items-center gap-2">
                                <span>Lun a Dom: 08:00 - 00:00</span>
                                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </p>

                            <p className="flex items-center gap-2">
                                <span>{CLUB_CONFIG.telefono}</span>
                                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </p>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-200 dark:border-slate-800 my-6" />

                {/* COPYRIGHT Y CRÉDITOS */}
                <div className="text-center text-xs text-gray-400 dark:text-gray-500">
                    <p className="mb-2">
                        © {currentYear} <strong>{CLUB_CONFIG.nombre}</strong>. Todos los derechos reservados.
                    </p>
                    <p>
                        Desarrollado por
                        <a
                            href="mailto:josue.flores.dev@gmail.com"
                            className="text-gray-500 dark:text-gray-400 font-bold ml-1 hover:text-blue-500 transition-colors"
                            title="Envíame un correo"
                        >
                            Josue Flores
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    )
}