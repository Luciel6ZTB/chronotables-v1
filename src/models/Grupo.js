export class Grupo {
  constructor({ _id, semestre, grupo, nomenclatura, carrera, turno }) {
    this.id = _id?.$oid || _id?.toString?.() || _id || null
    this.semestre = semestre ?? null
    this.grupo = grupo ?? ''
    this.nomenclatura = nomenclatura ?? ''
    this.carrera = carrera ?? ''
    this.turno = turno ?? ''
  }
}
