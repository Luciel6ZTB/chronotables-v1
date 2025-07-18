import { connectToDatabase } from './db.js'

export async function obtenerGrupos() {
  const db = await connectToDatabase()
  const grupos = await db.collection('groups').find({}).toArray()
  return grupos
}
