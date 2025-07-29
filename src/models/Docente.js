export class Docente {
  constructor({
    _id,
    nombre,
    nombre_corto,
    materias,
    horas_dual,
    horas_fortalecimiento_academico,
    horas_semanales_totales,
  }) {
    this.id = _id?.$oid || _id?.toString?.() || _id || null
    this.nombre = nombre ?? ''
    this.nombre_corto = nombre_corto ?? ''
    this.materias = Array.isArray(materias) ? materias : []

    // estos dos solo si existen en el documento original
    if (horas_dual) {
      this.horas_dual = horas_dual
    }

    if (horas_fortalecimiento_academico) {
      this.horas_fortalecimiento_academico = horas_fortalecimiento_academico
    }

    this.horas_semanales_totales = horas_semanales_totales ?? 0
  }

  tieneDual() {
    return !!this.horas_dual
  }

  tieneFortalecimiento() {
    return !!this.horas_fortalecimiento_academico
  }

  tieneMaterias() {
    return this.materias.length > 0
  }
}
