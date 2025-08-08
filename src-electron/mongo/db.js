import mongoose from 'mongoose'

const uri =
  'mongodb+srv://susely:X1K0g7GyM2i5k21B@main-cluster.hdfxlwy.mongodb.net/horariosDB?retryWrites=true&w=majority&appName=main-cluster'

export async function connectToDatabase() {
  try {
    await mongoose.connect(uri, {})
    console.log('Conectado a MongoDB con Mongoose')
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error)
    throw new Error('Error al conectar a la base de datos')
  }
}
