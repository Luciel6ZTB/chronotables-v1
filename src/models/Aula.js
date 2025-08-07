export class Aula {
  constructor({ _id, nombre, clave, tipo }) {
    this.id = _id?.$oid || _id?.toString?.() || _id || null
    this.nombre = nombre ?? ''
    this.clave = clave ?? ''
    this.tipo = tipo ?? ''
  }
}
