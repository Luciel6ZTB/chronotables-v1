import { MongoClient } from 'mongodb'

//cambiar el nombre de la base de datos
const uri = 'mongodb://localhost:27017'
const dbName = 'timetables_system'

let client = null

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
    console.log('Conectado a MongoDB')
  }
  return client.db(dbName)
}
