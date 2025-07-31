import mongoose from 'mongoose'

const uri = 'mongodb://localhost:27017/timetables_system'

let isConnected = false

export async function connectToDatabase() {
  if (!isConnected) {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    isConnected = true
    console.log('Conectado a MongoDB con Mongoose')
  }
}
