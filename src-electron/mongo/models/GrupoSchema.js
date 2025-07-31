import mongoose from 'mongoose'

const GrupoSchema = new mongoose.Schema({
  semestre: Number,
  grupo: String,
  nomenclatura: String,
  carrera: String,
  turno: String,
})

export default mongoose.models.Grupo || mongoose.model('Grupo', GrupoSchema)
