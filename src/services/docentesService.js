import { Docente } from 'src/models/Docente'

export async function fetchDocentes() {
  if (!window.electronAPI?.invoke) {
    console.warn('No estás en Electron, usando mock de docentes.')
    return []
  }

  const data = await window.electronAPI.invoke('get-docentes')
  return data.map((d) => new Docente(d))
}
