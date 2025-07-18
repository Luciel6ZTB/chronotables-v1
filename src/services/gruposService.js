import { Grupo } from 'src/models/Grupo'

export async function fetchGrupos() {
  if (!window.electronAPI?.invoke) {
    console.warn('No estás en Electron, usando mock de grupos.')
    return []
  }

  const data = await window.electronAPI.invoke('get-grupos')
  return data.map((g) => new Grupo(g))
}
