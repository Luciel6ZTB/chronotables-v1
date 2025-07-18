import { connectToDatabase } from './db.js'

export async function obtenerGrupos() {
  const db = await connectToDatabase()
  //cambiar según sea el nombre real de la coleccion
  const grupos = await db.collection('groups').find({}).toArray()
  return grupos
}
