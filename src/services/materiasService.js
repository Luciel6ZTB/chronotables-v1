import { Materia } from 'src/models/Materia'

// Obtener todas las materias
export async function fetchMaterias() {
  if (!window.electronAPI?.invoke) {
    console.warn('No estás en Electron, usando mock de materias.')
    return []
  }

  const data = await window.electronAPI.invoke('get-materias')
  return data.map((m) => new Materia(m))
}

// Crear nueva materia
export async function crearMateria(materia) {
  const instancia = new Materia(materia)
  const payload = instancia.toPayload()
  const data = await window.electronAPI.invoke('create-materia', payload)
  return new Materia(data)
}

// Editar materia existente
export async function editarMateria(id, materia) {
  const payload = materia.toPayload?.() ?? materia
  const data = await window.electronAPI.invoke('update-materia', id, payload)
  return data ? new Materia(data) : null
}

// Eliminar materia por ID
export async function eliminarMateria(id) {
  return await window.electronAPI.invoke('delete-materia', id)
}
