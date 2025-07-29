import { Materia } from 'src/models/Materia'

export async function fetchMaterias() {
  if (!window.electronAPI?.invoke) {
    console.warn('No estás en Electron, usando mock de materias.')
    return []
  }

  const data = await window.electronAPI.invoke('get-materias')
  return data.map((m) => new Materia(m))
}
