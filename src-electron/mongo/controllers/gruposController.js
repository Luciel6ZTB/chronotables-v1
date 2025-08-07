import { connectToDatabase } from '../db'
import Grupo from '../models/GrupoSchema'

export async function obtenerGrupos() {
  await connectToDatabase()
  const grupos = await Grupo.find().lean()
  return grupos.map((g) => ({
    ...g,
    _id: g._id.toString(),
  }))
}

export async function crearGrupo(grupoData) {
  await connectToDatabase()
  const nuevoGrupo = new Grupo(grupoData)
  await nuevoGrupo.save()
  return {
    ...nuevoGrupo.toObject(),
    _id: nuevoGrupo._id.toString(),
  }
}

export async function editarGrupo(id, datosActualizados) {
  await connectToDatabase()
  const grupo = await Grupo.findByIdAndUpdate(id, datosActualizados, {
    new: true,
    lean: true,
  })
  return {
    ...grupo,
    _id: grupo._id.toString(),
  }
}

export async function eliminarGrupo(id) {
  await connectToDatabase()
  const grupo = await Grupo.findByIdAndDelete(id)
  return {
    ...grupo.toObject(),
    _id: grupo._id.toString(),
  }
}
