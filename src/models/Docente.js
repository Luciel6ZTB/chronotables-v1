export class Docente {
  constructor({
    _id,
    nombre,
    abreviatura,
    horas_semanales_totales,
    materias,
    horas_fortalecimiento_academico,
    horas_dual,
    horas_extracurriculares,
    bloques_recomendados_no_asignar,
  }) {
    this.id = _id?.$oid || _id?.toString?.() || _id || null
    this.nombre = nombre ?? ''
    this.abreviatura = abreviatura ?? ''
    this.horas_semanales_totales = horas_semanales_totales ?? 0

    // Todos los campos opcionales inicializan como undefined si no se usaron
    this.materias = Array.isArray(materias) ? materias : undefined
    this.horas_fortalecimiento_academico = Array.isArray(horas_fortalecimiento_academico)
      ? horas_fortalecimiento_academico
      : undefined
    this.horas_dual = Array.isArray(horas_dual) ? horas_dual : undefined
    this.horas_extracurriculares = Array.isArray(horas_extracurriculares)
      ? horas_extracurriculares
      : undefined

    this.bloques_recomendados_no_asignar = Array.isArray(bloques_recomendados_no_asignar)
      ? bloques_recomendados_no_asignar
      : undefined
  }

  toPayload() {
    const payload = {
      nombre: this.nombre,
      abreviatura: this.abreviatura,
      horas_semanales_totales: this.horas_semanales_totales,
    }

    if (
      Array.isArray(this.bloques_recomendados_no_asignar) &&
      this.bloques_recomendados_no_asignar.length > 0
    ) {
      payload.bloques_recomendados_no_asignar = this.bloques_recomendados_no_asignar
    }

    if (Array.isArray(this.materias) && this.materias.length > 0) {
      payload.materias = this.materias
    }

    if (
      Array.isArray(this.horas_fortalecimiento_academico) &&
      this.horas_fortalecimiento_academico.length > 0
    ) {
      payload.horas_fortalecimiento_academico = this.horas_fortalecimiento_academico
    }

    if (Array.isArray(this.horas_dual) && this.horas_dual.length > 0) {
      payload.horas_dual = this.horas_dual
    }

    if (Array.isArray(this.horas_extracurriculares) && this.horas_extracurriculares.length > 0) {
      payload.horas_extracurriculares = this.horas_extracurriculares
    }

    return payload
  }
}
