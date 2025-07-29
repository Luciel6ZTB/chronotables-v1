import { connectToDatabase } from '../db'

export async function obtenerMaterias() {
  const db = await connectToDatabase()
  const materias = await db.collection('materias').find({}).toArray()

  // Serializar _id a string
  return materias.map((m) => ({
    ...m,
    _id: m._id.toString(),
  }))
}
