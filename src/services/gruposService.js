import { Grupo } from 'src/models/Grupo'

export async function fetchGrupos() {
  if (!window.electronAPI?.invoke) {
    console.warn('No estás en Electron, usando mock de grupos.')
    return [] // fallback si lo deseas
  }

  const data = await window.electronAPI.invoke('get-grupos')
  return data.map((g) => new Grupo(g))
}
