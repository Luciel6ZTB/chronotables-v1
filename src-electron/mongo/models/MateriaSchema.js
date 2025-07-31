import mongoose from 'mongoose'

const SubmoduloSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  horas: { type: Number, required: true },
})

const MateriaSchema = new mongoose.Schema(
  {
    abreviatura: { type: String, required: true },
    nombre: { type: String, required: true },
    semestre: { type: Number, required: true },
    tipo: { type: String, required: true }, // ej. 'modulo_profesional', 'tronco_comun', etc.
    especialidad: { type: String }, // solo si aplica
    horas_semanales: { type: Number, required: true },
    submodulos: {
      type: [SubmoduloSchema],
      default: undefined, //segun evita que mongo agregue
    }, // opcional
  },
  {
    collection: 'materias',
    versionKey: false,
  },
)

export default mongoose.models.Materia || mongoose.model('Materia', MateriaSchema)
