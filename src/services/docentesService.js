export async function fetchDocentes() {
  if (!window.electronAPI?.invoke) {
    console.warn('No estás en Electron, usando mock de docentes.')
    return []
  }

  return await window.electronAPI.invoke('get-docentes')
}

export async function crearDocente(payloadPlano) {
  if (!window.electronAPI?.invoke) {
    console.warn('No estás en Electron, creación de docente no disponible.')
    return null
  }

  return await window.electronAPI.invoke('create-docente', payloadPlano)
}

export async function editarDocente(id, payloadPlano) {
  if (!window.electronAPI?.invoke) {
    console.warn('No estás en Electron, actualización de docente no disponible.')
    return null
  }

  return await window.electronAPI.invoke('update-docente', {
    id,
    datosActualizados: payloadPlano,
  })
}

export async function eliminarDocente(id) {
  if (!window.electronAPI?.invoke) {
    console.warn('No estás en Electron, eliminación de docente no disponible.')
    return null
  }

  return await window.electronAPI.invoke('delete-docente', id)
}
