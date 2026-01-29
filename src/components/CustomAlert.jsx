import { useState, useEffect, useRef } from 'react'

export default function CustomAlert() {
    const [isOpen, setIsOpen] = useState(false)
    const [config, setConfig] = useState({})
    const [inputValue, setInputValue] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        const handleOpen = (e) => {
            setConfig(e.detail)
            setInputValue(e.detail.defaultValue || '')
            setIsOpen(true)
            if (e.detail.type === 'prompt') {
                setTimeout(() => inputRef.current?.focus(), 100)
            }
        }

        window.addEventListener('open-alert', handleOpen)
        return () => window.removeEventListener('open-alert', handleOpen)
    }, [])

    // --- GESTIÓN DEL BOTÓN ATRÁS PARA ALERTAS ---
    useEffect(() => {
        if (isOpen) {
            window.history.pushState({ modal: 'alert' }, '', window.location.href)
            
            const handlePop = () => {
                // Al volver atrás, cerramos la alerta (cancelando si es confirm/prompt)
                handleClose(null)
            }
            
            window.addEventListener('popstate', handlePop)
            return () => window.removeEventListener('popstate', handlePop)
        }
    }, [isOpen])

    // BLOQUEAR SCROLL DEL FONDO AL ABRIR
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    const handleClose = (result) => {
        setIsOpen(false)
        if (config.onClose) {
            config.onClose(result)
        }
    }

    if (!isOpen) return null

    // ICONOS ADAPTADOS (Colores suaves en modo oscuro)
    const renderIcon = () => {
        const icons = {
            success: <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4 transition-colors"><svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div>,
            error: <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 transition-colors"><svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></div>,
            question: <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4 transition-colors"><svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>,
            edit: <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4 transition-colors"><svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></div>
        }
        return icons[config.icon] || icons.success
    }

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 text-center">
                
                {/* Backdrop Oscuro con Blur */}
                <div 
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
                    aria-hidden="true"
                    onClick={() => handleClose(null)}
                ></div>

                {/* Modal Card - Fondo blanco o gris oscuro */}
                <div className="relative z-10 inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm w-full animate-fade-in-up">
                    <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 transition-colors">
                        <div className="flex flex-col items-center text-center">
                            {renderIcon()}
                            <div className="mt-2 text-center w-full">
                                {/* Título */}
                                <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white" id="modal-title">
                                    {config.title}
                                </h3>
                                {/* Mensaje */}
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-300 whitespace-pre-line">
                                        {config.message}
                                    </p>
                                </div>
                                
                                {/* Input para Prompts */}
                                {config.type === 'prompt' && (
                                    <div className="mt-4">
                                        <input 
                                            ref={inputRef}
                                            type="text" 
                                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-800 bg-gray-50 text-center dark:bg-slate-900 dark:text-white dark:border-slate-600 transition-colors"
                                            placeholder={config.placeholder}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleClose(inputValue)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Pie de modal (Botones) */}
                    <div className="bg-gray-50 dark:bg-slate-900/50 px-4 py-4 flex justify-center gap-3 transition-colors">
                        {config.type === 'alert' && (
                            <button onClick={() => handleClose(true)} className="min-w-[100px] inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:text-sm transition-transform active:scale-95">
                                Entendido
                            </button>
                        )}
                        
                        {(config.type === 'confirm' || config.type === 'prompt') && (
                            <>
                                <button 
                                    onClick={() => handleClose(null)} 
                                    className="min-w-[100px] inline-flex justify-center rounded-xl border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none sm:text-sm transition-transform active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={() => handleClose(config.type === 'prompt' ? inputValue : true)} 
                                    className="min-w-[100px] inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:text-sm transition-transform active:scale-95"
                                >
                                    {config.type === 'prompt' ? 'Aceptar' : 'Sí, continuar'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}