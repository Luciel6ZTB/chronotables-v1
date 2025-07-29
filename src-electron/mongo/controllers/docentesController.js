import { connectToDatabase } from '../db'

export async function obtenerDocentes() {
  const db = await connectToDatabase()
  const docentes = await db.collection('docentes').find({}).toArray()
  return docentes.map((d) => ({
    ...d,
    _id: d._id.toString(),
  }))
}
