import { Aula } from 'src/models/Aula'

export async function fetchAulas() {
  if (!window.electronAPI?.invoke) {
    console.warn('No estás en Electron, usando mock de aulas.')
    return []
  }

  const data = await window.electronAPI.invoke('get-aula')
  return data.map((a) => new Aula(a))
}

export async function crearAula(aula) {
  const nuevaAula = await window.electronAPI.invoke('create-aula', aula)
  return new Aula(nuevaAula)
}

export async function editarAula(id, aula) {
  const aulaEditada = await window.electronAPI.invoke('update-aula', id, aula)
  return new Aula(aulaEditada)
}

export async function eliminarAula(id) {
  const eliminada = await window.electronAPI.invoke('delete-aula', id)
  return eliminada
}
