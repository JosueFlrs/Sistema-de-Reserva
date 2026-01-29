export const HORARIOS = [
    '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00', '23:00'
]

export const getProximosDias = () => {
    const dias = []
    const hoy = new Date()

    for (let i = 0; i < 7; i++) {
        const fecha = new Date(hoy)
        fecha.setDate(hoy.getDate() + i)
        const valorDB = fecha.toISOString().split('T')[0]

        const numDia = fecha.getDate()
        const mes = fecha.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.', '')
        const nombreDia = fecha.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().replace('.', '')

        let etiquetaDesktop
        if (i === 0) etiquetaDesktop = `Hoy ${numDia}/${fecha.getMonth() + 1}`
        else etiquetaDesktop = `${nombreDia.charAt(0) + nombreDia.slice(1).toLowerCase()}. ${numDia}/${fecha.getMonth() + 1}`

        dias.push({
            fecha: valorDB,
            etiquetaDesktop,
            movilDia: i === 0 ? 'HOY' : nombreDia,
            movilNum: numDia,
            movilMes: mes
        })
    }
    return dias
}

export const sumarHora = (hora) => {
    let [h, m] = hora.split(':')
    return `${parseInt(h) + 1}:${m}`
}

// --- WHATSAPP HELPERS ---

export const formatearHora = (hora) => {
    if (!hora) return ''
    return hora.slice(0, 5)
}

export const limpiarTelefono = (telefono) => {
    if (!telefono) return ''
    let limpio = telefono.replace(/\D/g, '')
    // Si el número no tiene código de país (ej: es corto, de 8 dígitos para Bolivia celular sin 0), agregamos 591
    // Ajuste para Bolivia: Celulares suelen ser 8 dígitos (ej: 70000000). 
    // Si tiene 8, le agregamos 591.
    if (limpio.length === 8) limpio = '591' + limpio 
    return limpio
}

export const generarLinkWhatsApp = (telefono, mensaje) => {
    const tel = limpiarTelefono(telefono)
    if (!tel) return null
    return `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`
}

export const generarMensajeCancelacion = (nombre, fecha, hora, motivo) => {
    const horaCorta = formatearHora(hora)
    return `Hola ${nombre || 'Jugador'}, lamentamos informarte que tu turno del ${fecha} a las ${horaCorta} hs ha sido cancelado. 😔\n\n🛑 Motivo: *${motivo}*\n\nPor favor contáctanos para reprogramar. ¡Disculpas por las molestias! 🙏`
}

// Lista de Países Comunes
// Lista de Países con código ISO para las banderas
export const PAISES = [
    { codigo: '591', iso: 'bo', nombre: 'Bolivia' },
    { codigo: '549', iso: 'ar', nombre: 'Argentina' },
    { codigo: '569', iso: 'cl', nombre: 'Chile' },
    { codigo: '55',  iso: 'br', nombre: 'Brasil' },
    { codigo: '51',  iso: 'pe', nombre: 'Perú' },
    { codigo: '598', iso: 'uy', nombre: 'Uruguay' },
    { codigo: '595', iso: 'py', nombre: 'Paraguay' },
    { codigo: '57',  iso: 'co', nombre: 'Colombia' },
    { codigo: '52',  iso: 'mx', nombre: 'México' },
    { codigo: '1',   iso: 'us', nombre: 'USA' },
    { codigo: '34',  iso: 'es', nombre: 'España' }
]