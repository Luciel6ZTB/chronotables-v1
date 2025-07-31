import { Grupo } from 'src/models/Grupo'

export async function fetchGrupos() {
  if (!window.electronAPI?.invoke) {
    console.warn('No estás en Electron, usando mock de grupos.')
    return []
  }

  const data = await window.electronAPI.invoke('get-grupos')
  return data.map((g) => new Grupo(g))
}

export async function crearGrupo(grupoData) {
  if (!window.electronAPI?.invoke) {
    console.warn('No estás en Electron, no se puede crear grupo.')
    return null
  }
  const nuevoGrupo = await window.electronAPI.invoke('create-grupo', grupoData)
  return new Grupo(nuevoGrupo)
}

export async function editarGrupo(id, grupoData) {
  if (!window.electronAPI?.invoke) {
    console.warn('No estás en Electron, no se puede editar grupo.')
    return null
  }
  const grupoEditado = await window.electronAPI.invoke('update-grupo', id, grupoData)
  return new Grupo(grupoEditado)
}

export async function eliminarGrupo(id) {
  if (!window.electronAPI?.invoke) {
    console.warn('No estás en Electron, no se puede eliminar grupo.')
    return false
  }
  const eliminado = await window.electronAPI.invoke('delete-grupo', id)
  return eliminado
}
