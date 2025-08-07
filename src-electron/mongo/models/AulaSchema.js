import mongoose from 'mongoose'

const AulaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    clave: { type: String, required: true },
    tipo: { type: String, required: true }, // 'aula' | 'laboratorio' | 'taller'
  },
  {
    collection: 'aulas',
    versionKey: false,
  },
)

export default mongoose.models.Aula || mongoose.model('Aula', AulaSchema)
