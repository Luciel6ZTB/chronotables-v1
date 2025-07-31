import { connectToDatabase } from '../db'
import Docente from '../models/DocenteSchema'

// GET: Obtener todos los docentes
export async function obtenerDocentes() {
  await connectToDatabase()
  const docentes = await Docente.find().lean()
  return docentes.map((docente) => ({
    ...docente,
    _id: docente._id.toString(),
  }))
}

// POST: Crear nuevo docente
export async function crearDocente(docenteData) {
  await connectToDatabase()
  const nuevoDocente = new Docente(docenteData)
  const saved = await nuevoDocente.save()
  return { _id: saved._id.toString() }
}

// PUT: Editar docente existente por ID
export async function editarDocente(id, datosActualizados) {
  await connectToDatabase()
  const updated = await Docente.findByIdAndUpdate(id, datosActualizados, {
    new: true, // <- Devuelve el documento actualizado
    runValidators: true,
  }).lean()

  if (!updated) throw new Error('Docente no encontrado')

  return {
    ...updated,
    _id: updated._id.toString(),
  }
}

// DELETE: Eliminar docente por ID
export async function eliminarDocente(id) {
  await connectToDatabase()
  const deleted = await Docente.findByIdAndDelete(id).lean()

  if (!deleted) throw new Error('Docente no encontrado')

  return {
    mensaje: 'Docente eliminado correctamente',
    _id: deleted._id.toString(),
  }
}
