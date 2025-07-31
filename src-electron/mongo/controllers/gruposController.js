import { connectToDatabase } from '../db'
import Grupo from '../models/GrupoSchema' // importa el modelo mongoose

// GET: Obtener todos los grupos
export async function obtenerGrupos() {
  await connectToDatabase()
  const grupos = await Grupo.find().lean() // lean() para objeto plano
  return grupos.map((g) => ({
    ...g,
    _id: g._id.toString(), // importante convertir a string para el frontend
  }))
}

// POST: Crear un grupo
export async function crearGrupo(grupoData) {
  await connectToDatabase()
  const nuevoGrupo = new Grupo(grupoData)
  await nuevoGrupo.save()
  return {
    ...nuevoGrupo.toObject(),
    _id: nuevoGrupo._id.toString(),
  }
}

// PUT: Editar un grupo
export async function editarGrupo(id, datosActualizados) {
  await connectToDatabase()
  const grupo = await Grupo.findByIdAndUpdate(id, datosActualizados, {
    new: true, // retorna el documento actualizado
    lean: true,
  })
  return {
    ...grupo,
    _id: grupo._id.toString(),
  }
}

// DELETE: Eliminar un grupo
export async function eliminarGrupo(id) {
  await connectToDatabase()
  const grupo = await Grupo.findByIdAndDelete(id)
  return {
    ...grupo.toObject(),
    _id: grupo._id.toString(),
  }
}
