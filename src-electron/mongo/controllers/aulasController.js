import { connectToDatabase } from '../db'
import Aula from '../models/AulaSchema'

export async function obtenerAulas() {
  await connectToDatabase()
  const aulas = await Aula.find().lean()
  return aulas.map((a) => ({
    ...a,
    _id: a._id.toString(),
  }))
}

export async function crearAula(aula) {
  await connectToDatabase()
  const nuevaAula = new Aula(aula)
  await nuevaAula.save()
  return {
    ...nuevaAula.toObject(),
    _id: nuevaAula._id.toString(),
  }
}

export async function actualizarAula(id, datosActualizados) {
  await connectToDatabase()
  const aula = await Aula.findByIdAndUpdate(id, datosActualizados, {
    new: true,
    lean: true,
  })
  return {
    ...aula,
    _id: aula._id.toString(),
  }
}

export async function eliminarAula(id) {
  await connectToDatabase()
  const aula = await Aula.findByIdAndDelete(id)
  return {
    ...aula.toObject(),
    _id: aula._id.toString(),
  }
}
