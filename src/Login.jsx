import { useState } from 'react'
import { supabase } from './supabase'
import { CLUB_CONFIG } from './config' 

export default function Login({ onCancel }) {
    const [loading, setLoading] = useState(false)

    const handleGoogleLogin = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                queryParams: { access_type: 'offline', prompt: 'consent' },
                redirectTo: window.location.origin
            }
        })
        if (error) {
            alert("Error: " + error.message)
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-900 overflow-hidden">
            {/* FONDO DINÁMICO */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={CLUB_CONFIG.imagenFondo} 
                    alt="Fondo" 
                    className="w-full h-full object-cover opacity-40 scale-105 filter blur-sm" 
                />
                <div className="absolute inset-0 bg-slate-900/60"></div>
            </div>

            {/* TARJETA LOGIN */}
            <div className="relative z-10 w-full max-w-sm px-4 animate-fade-in-up">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl overflow-hidden p-8 text-center">
                    
                    <div className="mb-8">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                            <img src={CLUB_CONFIG.emoji} alt="Estadio" className="w-9 h-9 object-cover" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{CLUB_CONFIG.nombre}</h1>
                        <p className="text-gray-300 text-sm mt-2">Sistema de Reservas</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
                        >
                            {loading ? (
                                <span className="animate-pulse">Conectando...</span>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.16-3.16C17.45 1.14 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continuar con Google
                                </>
                            )}
                        </button>

                        {/* Botón Volver */}
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="w-full py-3 px-4 text-white/70 hover:text-white hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
                            >
                                Volver a la web
                            </button>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-2">
                            Gestión inteligente de canchas de Wally.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}