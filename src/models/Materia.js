export class Materia {
  constructor({
    _id,
    abreviatura,
    nombre,
    semestre,
    tipo,
    especialidad,
    horas_semanales,
    submodulos,
  }) {
    this.id = _id?.$oid || _id?.toString?.() || _id || null
    this.abreviatura = abreviatura ?? ''
    this.nombre = nombre ?? ''
    this.semestre = semestre ?? null
    this.tipo = tipo ?? 'tronco_comun' // valor por defecto
    this.especialidad = especialidad ?? null
    this.horas_semanales = horas_semanales ?? 0
    this.submodulos = Array.isArray(submodulos) ? submodulos : []
  }
  //para los v-if
  esModuloProfesional() {
    return this.tipo === 'modulo_profesional'
  }

  esTroncoComun() {
    return this.tipo === 'tronco_comun'
  }
}
