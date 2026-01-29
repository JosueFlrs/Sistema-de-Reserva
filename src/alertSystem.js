// Este objeto controla los eventos de las alertas
const events = {
    emit(event, data) {
        window.dispatchEvent(new CustomEvent(event, { detail: data }))
    }
}

// 1. ALERTA SIMPLE (Reemplaza a alert())
export const showAlert = (title, message, icon = 'success') => {
    return new Promise((resolve) => {
        events.emit('open-alert', {
            type: 'alert',
            title,
            message,
            icon,
            onClose: () => resolve(true)
        })
    })
}

// 2. CONFIRMACIÓN (Reemplaza a confirm())
// Retorna true (si) o false (no)
export const showConfirm = (title, message) => {
    return new Promise((resolve) => {
        events.emit('open-alert', {
            type: 'confirm',
            title,
            message,
            icon: 'question',
            onClose: (result) => resolve(result)
        })
    })
}

// 3. PROMPT / INPUT (Reemplaza a prompt())
// Retorna el texto escrito o null si cancela
export const showPrompt = (title, message, placeholder = '', defaultValue = '') => {
    return new Promise((resolve) => {
        events.emit('open-alert', {
            type: 'prompt',
            title,
            message,
            placeholder,
            defaultValue,
            icon: 'edit',
            onClose: (result) => resolve(result) // result será el texto o null
        })
    })
}