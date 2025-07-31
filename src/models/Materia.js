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
    this.tipo = tipo ?? 'tronco_comun'
    this.horas_semanales = horas_semanales ?? 0

    // Solo agregar si es modulo profesional
    if (this.esModuloProfesional()) {
      this.especialidad = especialidad ?? ''
      this.submodulos = Array.isArray(submodulos) ? submodulos : []
    } else {
      this.especialidad = null
      this.submodulos = []
    }
  }

  esModuloProfesional() {
    return this.tipo === 'modulo_profesional'
  }

  esTroncoComun() {
    return this.tipo === 'tronco_comun'
  }

  toPayload() {
    const base = {
      abreviatura: this.abreviatura,
      nombre: this.nombre,
      semestre: this.semestre,
      tipo: this.tipo,
      horas_semanales: this.horas_semanales,
    }

    if (this.esModuloProfesional()) {
      base.especialidad = this.especialidad
      base.submodulos = this.submodulos
    }

    return base
  }
}
