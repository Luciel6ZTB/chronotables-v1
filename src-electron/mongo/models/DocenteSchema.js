import mongoose from 'mongoose'

const MateriaAsignadaSchema = new mongoose.Schema(
  {
    materia: {
      type: String,
      required: true,
    },
    grupos_preferidos_asignar: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
)

const FortalecimientoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    abreviatura: { type: String, required: true },
    horas: { type: Number, required: true },
  },
  { _id: false },
)

const DualSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    abreviatura: { type: String, required: true },
    semestre: { type: Number, required: true },
    horas_semanales: { type: Number, required: true },
  },
  { _id: false },
)

const ExtracurricularSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    abreviatura: { type: String, required: true },
    horas: { type: Number, required: true },
  },
  { _id: false },
)

const DocenteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    abreviatura: {
      type: String,
      required: true,
    },
    horas_semanales_totales: {
      type: Number,
      required: true,
    },
    // se cambia a opcional
    bloques_recomendados_no_asignar: {
      type: [Number],
      default: undefined,
    },
    materias: {
      type: [MateriaAsignadaSchema],
      default: undefined,
    },
    horas_fortalecimiento_academico: {
      type: [FortalecimientoSchema],
      default: undefined,
    },
    horas_dual: {
      type: [DualSchema],
      default: undefined,
    },
    horas_extracurriculares: {
      type: [ExtracurricularSchema],
      default: undefined,
    },
  },
  {
    collection: 'profesores',
    versionKey: false,
  },
)

export default mongoose.model('Docente', DocenteSchema)
