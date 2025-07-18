//campos de mongodb.
export class Grupo {
  constructor({ _id, nombre, semestre, turno }) {
    this.id = _id?.$oid || _id?.toString?.() || _id || null
    this.nombre = nombre
    this.semestre = semestre
    this.turno = turno
  }
}
