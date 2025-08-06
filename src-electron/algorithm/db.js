const mongoose = require('mongoose')

async function conectarDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/horariosDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('CONECTADO A MONGODB')
  } catch (error) {
    console.error('ERROR CON CONEXION:', error)
    process.exit(1)
  }
}

module.exports = conectarDB
