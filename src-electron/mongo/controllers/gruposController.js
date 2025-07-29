import { connectToDatabase } from '../db'

export async function obtenerGrupos() {
  const db = await connectToDatabase()
  const grupos = await db.collection('grupos').find({}).toArray()

  return grupos.map((g) => ({
    ...g,
    _id: g._id.toString(),
  }))
}
