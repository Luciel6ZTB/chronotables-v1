import { connectToDatabase } from '../db'
import Materia from '../models/MateriaSchema'

// GET: Obtener todas las materias
export async function obtenerMaterias() {
  await connectToDatabase()
  const materias = await Materia.find().lean()
  return materias.map((m) => ({
    ...m,
    _id: m._id.toString(),
  }))
}

// POST: Crear una nueva materia
export async function crearMateria(data) {
  await connectToDatabase()

  // Limpia campos no deseados para tronco común
  if (data.tipo === 'tronco_comun') {
    delete data.submodulos
    delete data.especialidad
  }

  const nuevaMateria = new Materia(data)
  await nuevaMateria.save()

  const obj = nuevaMateria.toObject()
  delete obj.__v
  return { ...obj, _id: obj._id.toString() }
}

export async function editarMateria(id, data) {
  await connectToDatabase()

  if (data.tipo === 'tronco_comun') {
    data.$unset = { submodulos: '', especialidad: '' }
  }

  const materia = await Materia.findByIdAndUpdate(id, data, { new: true, lean: true })

  if (!materia) {
    throw new Error(`No se encontró materia con id ${id}`)
  }

  delete materia.__v

  return { ...materia, _id: materia._id.toString() }
}

// DELETE: Eliminar una materia por ID
export async function eliminarMateria(id) {
  await connectToDatabase()
  const materia = await Materia.findByIdAndDelete(id)
  // DELETE unificado (opcional)
  return materia ? { ...materia.toObject(), _id: materia._id.toString() } : null
}
