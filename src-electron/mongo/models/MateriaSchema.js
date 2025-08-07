import mongoose from 'mongoose'

const SubmoduloSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  horas: { type: Number, required: true },
})

const MateriaSchema = new mongoose.Schema(
  {
    id: { type: String, default: undefined }, // Nuevo campo explícito
    nombre: { type: String, required: true },
    abreviatura: { type: String, required: true },
    semestre: { type: Number, required: true },
    tipo: { type: String, required: true }, // ej. 'modulo_profesional', 'tronco_comun', etc.
    horas_semanales: { type: Number, required: true },
    especialidad: { type: String, required: false }, // solo si aplica
    submodulos: {
      type: [SubmoduloSchema],
      default: undefined, // evita que se agregue si no se provee
    },
  },
  {
    collection: 'materias',
    versionKey: false,
  },
)

export default mongoose.models.Materia || mongoose.model('Materia', MateriaSchema)
