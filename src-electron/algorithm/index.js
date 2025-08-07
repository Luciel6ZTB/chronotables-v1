const fs = require('fs')
const path = require('path')
function getAlgorithmPath() {
  // En desarrollo: __dirname apunta directamente a la carpeta algorithm
  // En producción: __dirname estará en resources/algorithm
  return __dirname
}
const algorithmPath = getAlgorithmPath()
const configPath = path.join(algorithmPath, 'config.json') // Ahora usa path.join para mejor compatibilidad

// Maneja los _id provenientes de MongoDB o JSON
function normalizarId(id) {
  if (!id) return id
  if (typeof id === 'object') {
    if (id.$oid) return String(id.$oid)
    if (typeof id.toString === 'function' && id.toString !== Object.prototype.toString) {
      const str = id.toString()
      if (str !== '[object Object]') return str
    }
    if (id._id && id._id !== id) return normalizarId(id._id)
  }
  return String(id)
}

/**
 * ================== ORIGEN DE DATOS  ==================
 * Por default el generador usa la base de datos (MongoDB).
 * Para trabajar sin DB y usar los archivos JSON:
 *  1) Descomenta la línea `cargarDatos = cargarDatosDesdeArchivos`. (línea 73)
 *  2) Comenta la asignación de MongoDB.
 * Para volver a la base de datos, invierte los pasos anteriores.

async function cargarDatosDesdeArchivos() {
  const materias = JSON.parse(fs.readFileSync('./filesToAvoidUsingDB/materias.json', 'utf8')).map(
    (m) => ({ ...m, _id: normalizarId(m._id) }),
  )
  const grupos = JSON.parse(fs.readFileSync('./filesToAvoidUsingDB/grupos.json', 'utf8'))
  const profesores = JSON.parse(
    fs.readFileSync('./filesToAvoidUsingDB/profesores.json', 'utf8'),
  ).map((p) => ({
    ...p,
    materias: p.materias?.map((mp) => ({ ...mp, materia: normalizarId(mp.materia) })) || [],
  }))
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

  return { materias, grupos, profesores, config }
}
*/

async function cargarDatosDesdeDB() {
  //ruta relativa para dev y produccion
  const conectarDB = require(path.join(algorithmPath, 'db'))
  const { Materia, Profesor, Grupo } = require(path.join(algorithmPath, 'models/esquemas'))
  await conectarDB()

  const materias = await Materia.find()
  const profesores = await Profesor.find().populate('materias.materia')
  const grupos = await Grupo.find()
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) // Cargar config desde archivo

  const materiasNormalizadas = materias.map((m) => ({
    ...m.toObject(),
    _id: normalizarId(m._id),
  }))

  const profesoresNormalizados = profesores.map((p) => {
    const profesorObj = p.toObject()
    return {
      ...profesorObj,
      materias: profesorObj.materias.map((mp) => ({
        ...mp,
        materia: normalizarId(mp.materia && mp.materia._id ? mp.materia._id : mp.materia),
      })),
    }
  })

  return { materias: materiasNormalizadas, profesores: profesoresNormalizados, grupos, config }
}

// ======= Selecciona el origen de datos comentando/descomentando UNA de las siguientes líneas =======
const cargarDatos = cargarDatosDesdeDB // <-- usar MongoDB
// const cargarDatos = cargarDatosDesdeArchivos; // <-- usar archivos JSON

// const cargarDatos = cargarDatosDesdeArchivos; // <-- usar archivos JSON

// ================== INICIO DE ALGORITMO ==================
class GeneradorHorarios {
  constructor(materias, grupos, profesores, config) {
    this.materias = materias
    this.grupos = grupos
    this.profesores = profesores
    this.config = config
    this.dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']
    this.totalBloques = config.bloques_matutino + config.bloques_vespertino - 1

    this.estadisticasGrupos = new Map()
    this.inicializarEstadisticas()
  }

  inicializarEstadisticas() {
    this.grupos.forEach((grupo) => {
      this.estadisticasGrupos.set(grupo.nomenclatura, {
        horasPorDia: { Lunes: 0, Martes: 0, Miercoles: 0, Jueves: 0, Viernes: 0 },
        totalHoras: 0,
        horasMateriaAsignadas: new Map(),
      })
    })
  }

  // ================== Creación de matrices ==================
  crearMatrizHorarioProfesores() {
    const matriz = {}
    for (let dia of this.dias) {
      matriz[dia] = {}
      for (let bloque = 1; bloque <= this.totalBloques; bloque++) {
        matriz[dia][bloque] = { materia: null, abreviatura: null, grupo: null, semestre: null }
      }
    }
    return matriz
  }

  crearMatrizHorarioEscolar(grupo) {
    const matriz = {}
    let bloque_inicio, bloque_fin
    if (grupo.turno === 'Matutino') {
      bloque_inicio = 1
      bloque_fin = this.config.bloque_fin_matutino
    } else {
      bloque_inicio = this.config.bloque_inicio_vespertino
      bloque_fin = this.totalBloques
    }
    const total_bloques = bloque_fin - bloque_inicio + 1
    for (let dia of this.dias) {
      matriz[dia] = {}
      for (let bloque = bloque_inicio; bloque <= bloque_fin; bloque++) {
        matriz[dia][bloque] = { materia: null, abreviatura: null, docente: null, aula: null }
      }
    }
    return { matriz, total_bloques }
  }

  inicializarHorariosProfesores() {
    for (const profesor of this.profesores) {
      profesor.horario = this.crearMatrizHorarioProfesores()
    }
  }

  inicializarHorariosEscolares() {
    for (const grupo of this.grupos) {
      const resultado = this.crearMatrizHorarioEscolar(grupo)
      grupo.horario = resultado.matriz
      grupo.total_bloques = resultado.total_bloques
    }
  }

  // ================== Utilidad para usar _id ==================
  buscarMateriaPorId(materiaRef) {
    if (!materiaRef) return null
    const idString = normalizarId(materiaRef)
    return this.materias.find((m) => normalizarId(m._id) === idString)
  }

  // ================== Utilidades de validación ==================
  esMatutino(bloque) {
    return bloque <= this.config.bloque_fin_matutino
  }

  esVespertino(bloque) {
    return bloque >= this.config.bloque_inicio_vespertino
  }

  validarTurnoGrupo(grupo, bloque) {
    if (grupo.turno === 'Matutino' && !this.esMatutino(bloque)) return false
    if (grupo.turno === 'Vespertino' && !this.esVespertino(bloque)) return false
    return true
  }

  grupoTieneClases(grupo, dia, bloque) {
    for (const profesor of this.profesores) {
      const entrada = profesor.horario[dia][bloque]
      if (entrada.grupo === grupo.nomenclatura) return true
      if (
        entrada.semestre &&
        entrada.semestre === grupo.semestre &&
        entrada.materia?.toLowerCase().includes('extracurricular')
      )
        return true
    }
    return false
  }

  contarHorasMateriaPorDia(grupo, materiaRef, dia) {
    const materiaInfo = this.buscarMateriaPorId(materiaRef)
    if (!materiaInfo) return 0

    let contador = 0
    for (const profesor of this.profesores) {
      for (let bloque = 1; bloque <= this.totalBloques; bloque++) {
        const asignacion = profesor.horario?.[dia]?.[bloque]
        if (asignacion?.grupo === grupo.nomenclatura && asignacion.materia === materiaInfo.nombre) {
          // ✅ Comparar con NOMBRE
          contador++
        }
      }
    }
    return contador
  }

  contarHorasMateriaTotalGrupo(grupo, materiaRef) {
    let total = 0
    for (const dia of this.dias) {
      total += this.contarHorasMateriaPorDia(grupo, materiaRef, dia)
    }
    return total
  }

  calcularMaxHorasPorDia(materiaRef) {
    const materiaInfo = this.buscarMateriaPorId(materiaRef)
    if (!materiaInfo) return 0
    return materiaInfo.tipo === 'modulo_profesional' ? 5 : 2
  }

  // ================== Verificar si bloques consecutivos están libres ==================
  cumpleRestricciones(dia, bloque, profesor, grupo, materiaRef) {
    if (profesor.horario[dia][bloque].materia != null) return false
    if (grupo.horario?.[dia]?.[bloque]?.materia) return false
    if (!this.validarTurnoGrupo(grupo, bloque)) return false
    if (profesor.bloques_recomendados_no_asignar?.includes(bloque)) return false

    const materiaObj = this.buscarMateriaPorId(materiaRef)
    if (materiaObj) {
      const horasEnEsteDia = this.contarHorasMateriaPorDia(grupo, materiaRef, dia)

      if (materiaObj.tipo === 'tronco_comun' && horasEnEsteDia > 0) return false
      if (materiaObj.tipo === 'modulo_profesional' && horasEnEsteDia > 0) return false

      const maxHorasPorDia = this.calcularMaxHorasPorDia(materiaRef)
      if (horasEnEsteDia >= maxHorasPorDia) return false

      const horasYaAsignadas = this.contarHorasMateriaTotalGrupo(grupo, materiaRef)
      if (horasEnEsteDia > 0 && horasYaAsignadas < materiaObj.horas_semanales) {
        const diasConEstaMateria = this.dias.filter(
          (d) => this.contarHorasMateriaPorDia(grupo, materiaRef, d) > 0,
        ).length
        const maxDias = materiaObj.tipo === 'modulo_profesional' ? 3 : 2
        if (diasConEstaMateria >= maxDias && horasYaAsignadas >= materiaObj.horas_semanales) {
          return false
        }
      }
    }

    const stats = this.estadisticasGrupos.get(grupo.nomenclatura)
    if (stats && stats.horasPorDia[dia] >= 8) return false

    return true
  }

  // ================== Asignación sin crear huecos ==================
  asignarMateria(dia, bloque, profesor, grupo, materiaRef) {
    const materiaInfo = this.buscarMateriaPorId(materiaRef)

    if (!materiaInfo) {
      console.error(` ERROR: No se pudo encontrar materia con referencia:`, materiaRef)
      console.error(`   Tipo de referencia:`, typeof materiaRef)
      console.error(
        `   Materias disponibles:`,
        this.materias.map((m) => ({ id: m._id, nombre: m.nombre })),
      )
      return
    }

    const registroProfesor = {
      materia: materiaInfo.nombre,
      abreviatura: materiaInfo.abreviatura || null,
      grupo: grupo.nomenclatura,
      semestre: grupo.semestre,
    }

    profesor.horario[dia][bloque] = registroProfesor

    if (grupo.horario?.[dia]?.[bloque]) {
      grupo.horario[dia][bloque] = {
        materia: materiaInfo.nombre, // Usar el _id normalizado
        abreviatura: materiaInfo.abreviatura,
        docente: profesor.nombre,
        aula: null,
      }
    }

    const stats = this.estadisticasGrupos.get(grupo.nomenclatura)
    if (stats) {
      stats.horasPorDia[dia]++
      stats.totalHoras++
    }
  }

  // ================== Encontrar bloques consecutivos SIN CREAR HUECOS ==================
  encontrarBloquesConsecutivosSinHuecos(dia, profesor, grupo, materia, cantidadHoras) {
    let bloqueInicio = grupo.turno === 'Matutino' ? 1 : this.config.bloque_inicio_vespertino
    let bloqueFin = grupo.turno === 'Matutino' ? this.config.bloque_fin_matutino : this.totalBloques

    // Buscar todas las posiciones posibles que no creen huecos
    for (let inicio = bloqueInicio; inicio <= bloqueFin - cantidadHoras + 1; inicio++) {
      // Verificar si esta posición crearía huecos
      const creaHueco = this.verificarSiCreaHueco(grupo, dia, inicio, cantidadHoras)
      if (creaHueco) continue

      // Verificar disponibilidad del profesor y restricciones
      let disponible = true
      for (let i = 0; i < cantidadHoras; i++) {
        if (!this.cumpleRestricciones(dia, inicio + i, profesor, grupo, materia)) {
          disponible = false
          break
        }
      }

      if (disponible) {
        return Array.from({ length: cantidadHoras }, (_, i) => inicio + i)
      }
    }

    return null
  }

  // ================== Verificar si una asignación crearía hueco ==================
  verificarSiCreaHueco(grupo, dia, bloqueInicio, cantidadHoras) {
    let bloqueInicioGrupo = grupo.turno === 'Matutino' ? 1 : this.config.bloque_inicio_vespertino
    let bloqueFinGrupo =
      grupo.turno === 'Matutino' ? this.config.bloque_fin_matutino : this.totalBloques

    // Simular la asignación
    const horarioSimulado = JSON.parse(JSON.stringify(grupo.horario[dia]))
    for (let i = 0; i < cantidadHoras; i++) {
      horarioSimulado[bloqueInicio + i] = { materia: 'TEMPORAL' }
    }

    // Verificar si quedarían huecos
    let primerClase = null
    let ultimaClase = null

    for (let bloque = bloqueInicioGrupo; bloque <= bloqueFinGrupo; bloque++) {
      if (horarioSimulado[bloque]?.materia || this.grupoTieneClases(grupo, dia, bloque)) {
        if (primerClase === null) primerClase = bloque
        ultimaClase = bloque
      }
    }

    if (primerClase === null || ultimaClase === null) return false

    // Contar huecos en el rango ocupado
    let huecos = 0
    for (let bloque = primerClase; bloque <= ultimaClase; bloque++) {
      if (!horarioSimulado[bloque]?.materia && !this.grupoTieneClases(grupo, dia, bloque)) {
        huecos++
      }
    }

    return huecos > 0
  }

  asignarBloquesConsecutivosSinHuecos(dia, profesor, grupo, materia, cantidadHoras) {
    const bloques = this.encontrarBloquesConsecutivosSinHuecos(
      dia,
      profesor,
      grupo,
      materia,
      cantidadHoras,
    )
    if (!bloques) return false
    for (const bloque of bloques) {
      const materiaId = materia ? normalizarId(materia._id || materia) : null
      this.asignarMateria(dia, bloque, profesor, grupo, materiaId)
    }
    return true
  }

  // ================== Encontrar mejor día considerando huecos ==================
  encontrarMejorDiaParaAsignarSinHuecos(profesor, grupo, materia, cantidadHoras) {
    const diasDisponibles = []

    for (const dia of this.dias) {
      const bloques = this.encontrarBloquesConsecutivosSinHuecos(
        dia,
        profesor,
        grupo,
        materia,
        cantidadHoras,
      )
      if (bloques) {
        const stats = this.estadisticasGrupos.get(grupo.nomenclatura)
        const horasEnDia = stats ? stats.horasPorDia[dia] : 0

        // Calcular prioridad: preferir días con menos carga pero que ya tengan algunas clases
        let prioridad = 0
        if (horasEnDia === 0) {
          prioridad = 1000 // Menor prioridad para días vacíos
        } else {
          prioridad = horasEnDia // Preferir días con menos horas pero que ya tengan clases
        }

        diasDisponibles.push({ dia, horasEnDia, bloques, prioridad })
      }
    }

    // Ordenar por prioridad (menor es mejor)
    diasDisponibles.sort((a, b) => {
      // Si ambos tienen clases, preferir el que tenga menos horas
      if (a.horasEnDia > 0 && b.horasEnDia > 0) {
        return a.horasEnDia - b.horasEnDia
      }
      // Si solo uno tiene clases, preferir ese
      if (a.horasEnDia > 0 && b.horasEnDia === 0) return -1
      if (a.horasEnDia === 0 && b.horasEnDia > 0) return 1
      // Si ambos están vacíos, mantener orden
      return 0
    })

    return diasDisponibles.length > 0 ? diasDisponibles[0] : null
  }

  // ================== Asignar módulo profesional  ==================
  asignarModuloProfesional() {
    console.log('Iniciando asignación de módulos profesionales...')

    for (const profesor of this.profesores) {
      if (!profesor.materias) continue

      for (const materiaProfesor of profesor.materias) {
        const materiaObj = this.buscarMateriaPorId(materiaProfesor.materia)
        if (!materiaObj || materiaObj.tipo !== 'modulo_profesional') continue

        const gruposAsignados = materiaProfesor.grupos_preferidos_asignar || []

        for (const grupoNom of gruposAsignados) {
          const grupo = this.grupos.find((g) => g.nomenclatura === grupoNom)
          if (!grupo) continue

          let horasAsignadas = 0
          console.log(
            `Asignando ${materiaObj.nombre} (${materiaObj.horas_semanales}h) a grupo ${grupoNom}`,
          )

          while (horasAsignadas < materiaObj.horas_semanales) {
            let asignado = false
            const horasFaltantes = materiaObj.horas_semanales - horasAsignadas

            let tamañoOptimo
            if (materiaObj.horas_semanales === 17 && horasFaltantes === 5) {
              tamañoOptimo = 5
            } else {
              tamañoOptimo = Math.min(4, horasFaltantes)
            }

            for (let tam = tamañoOptimo; tam >= 1 && !asignado; tam--) {
              const mejorDia = this.encontrarMejorDiaParaAsignarSinHuecos(
                profesor,
                grupo,
                materiaProfesor.materia,
                tam,
              )
              if (mejorDia) {
                if (
                  this.asignarBloquesConsecutivosSinHuecos(
                    mejorDia.dia,
                    profesor,
                    grupo,
                    materiaProfesor.materia,
                    tam,
                  )
                ) {
                  horasAsignadas += tam
                  asignado = true
                  console.log(`  → Asignado ${tam}h en ${mejorDia.dia}`)
                }
              }
            }

            if (!asignado) {
              console.warn(
                `  ⚠ No se pudieron asignar más horas para ${materiaObj.nombre} al grupo ${grupoNom}. Asignadas: ${horasAsignadas}/${materiaObj.horas_semanales}`,
              )
              break
            }
          }
        }
      }
    }
  }

  // ================== Asignar tronco común ==================
  asignarTroncoComun() {
    console.log('Iniciando asignación de tronco común...')

    for (const profesor of this.profesores) {
      if (!profesor.materias) continue

      for (const materiaProfesor of profesor.materias) {
        const materiaObj = this.buscarMateriaPorId(materiaProfesor.materia)
        if (!materiaObj || materiaObj.tipo !== 'tronco_comun') continue

        const gruposAsignados = materiaProfesor.grupos_preferidos_asignar || []

        for (const grupoNom of gruposAsignados) {
          const grupo = this.grupos.find((g) => g.nomenclatura === grupoNom)
          if (!grupo) continue

          let horasAsignadas = 0
          console.log(
            `Asignando ${materiaObj.nombre} (${materiaObj.horas_semanales}h) a grupo ${grupoNom}`,
          )

          while (horasAsignadas < materiaObj.horas_semanales) {
            let asignado = false
            const horasFaltantes = materiaObj.horas_semanales - horasAsignadas
            let tamañoOptimo = Math.min(2, horasFaltantes)

            for (let tam = tamañoOptimo; tam >= 1 && !asignado; tam--) {
              const mejorDia = this.encontrarMejorDiaParaAsignarSinHuecos(
                profesor,
                grupo,
                materiaProfesor.materia,
                tam,
              )
              if (mejorDia) {
                if (
                  this.asignarBloquesConsecutivosSinHuecos(
                    mejorDia.dia,
                    profesor,
                    grupo,
                    materiaProfesor.materia,
                    tam,
                  )
                ) {
                  horasAsignadas += tam
                  asignado = true
                  console.log(`  → Asignado ${tam}h en ${mejorDia.dia}`)
                }
              }
            }

            if (!asignado) {
              console.warn(
                `  ⚠ No se pudieron asignar más horas para ${materiaObj.nombre} al grupo ${grupoNom}. Asignadas: ${horasAsignadas}/${materiaObj.horas_semanales}`,
              )
              break
            }
          }
        }
      }
    }
  }

  // ================== Asignar extracurriculares - Últimos bloques ==================
  asignarExtracurriculares() {
    console.log('Iniciando asignación de extracurriculares...')

    const profesoresExtracurriculares = this.profesores.filter(
      (p) => p.horas_extracurriculares && p.horas_extracurriculares.length > 0,
    )

    const semestres = [
      ...new Set(this.grupos.filter((g) => g.turno === 'Matutino').map((g) => g.semestre)),
    ].sort()

    console.log(`Semestres encontrados: ${semestres.join(', ')}`)

    for (const semestre of semestres) {
      console.log(`\nAsignando extracurricular para semestre ${semestre}...`)

      let horasNecesarias = 3
      let diasAsignados = 0

      for (const dia of this.dias) {
        if (diasAsignados >= horasNecesarias) break

        let bloqueAsignado = null
        const gruposDelSemestre = this.grupos.filter(
          (g) => g.semestre === semestre && g.turno === 'Matutino',
        )

        // CAMBIO: Buscar desde el ÚLTIMO bloque hacia atrás
        for (let bloque = this.config.bloque_fin_matutino; bloque >= 1; bloque--) {
          // Verificar que el bloque esté disponible para todos los grupos del semestre
          const gruposDisponibles = gruposDelSemestre.every((g) => {
            return !this.grupoTieneClases(g, dia, bloque)
          })

          const profesDisponibles = profesoresExtracurriculares.every(
            (p) => !p.horario[dia][bloque]?.materia,
          )

          // Verificar que no cree huecos para ningún grupo del semestre
          const noCreariaHuecos = gruposDelSemestre.every((g) => {
            return !this.verificarSiCreaHueco(g, dia, bloque, 1)
          })

          if (gruposDisponibles && profesDisponibles && noCreariaHuecos) {
            bloqueAsignado = bloque
            break
          }
        }

        // Si no se pudo asignar en los bloques altos sin crear huecos, buscar cualquier bloque válido
        if (!bloqueAsignado) {
          console.log(
            `  → Buscando bloque alternativo para extracurricular semestre ${semestre} en ${dia}`,
          )
          for (let bloque = 1; bloque <= this.config.bloque_fin_matutino; bloque++) {
            const gruposDisponibles = gruposDelSemestre.every((g) => {
              return !this.grupoTieneClases(g, dia, bloque)
            })

            const profesDisponibles = profesoresExtracurriculares.every(
              (p) => !p.horario[dia][bloque]?.materia,
            )

            const noCreariaHuecos = gruposDelSemestre.every((g) => {
              return !this.verificarSiCreaHueco(g, dia, bloque, 1)
            })

            if (gruposDisponibles && profesDisponibles && noCreariaHuecos) {
              bloqueAsignado = bloque
              console.log(`  → Asignando en bloque alternativo ${bloque}`)
              break
            }
          }
        }

        // Si encontró un bloque, asignarlo a todos los profesores
        if (bloqueAsignado) {
          profesoresExtracurriculares.forEach((p) => {
            const actividad = p.horas_extracurriculares[0]
            p.horario[dia][bloqueAsignado] = {
              materia: `Extracurricular: ${actividad.nombre} - ${semestre}° Semestre`,
              abreviatura: actividad.abreviatura || null,
              grupo: `Semestre ${semestre}`,
              semestre: semestre,
            }
          })

          // Actualizar horarios y estadísticas para todos los grupos del semestre
          gruposDelSemestre.forEach((grupo) => {
            if (grupo.horario?.[dia]?.[bloqueAsignado]) {
              grupo.horario[dia][bloqueAsignado] = {
                materia: 'Extracurricular',
                abreviatura: null,
                docente: null,
                aula: null,
              }
            }
            const stats = this.estadisticasGrupos.get(grupo.nomenclatura)
            if (stats) {
              stats.horasPorDia[dia]++
              stats.totalHoras++
            }
          })

          console.log(
            `  ✓ Asignado extracurricular semestre ${semestre} - ${dia} Bloque ${bloqueAsignado}`,
          )
          diasAsignados++
        } else {
          console.warn(
            `  ⚠ No se pudo asignar extracurricular para semestre ${semestre} en ${dia}`,
          )
        }
      }

      if (diasAsignados < horasNecesarias) {
        console.warn(
          `Solo se asignaron ${diasAsignados} de ${horasNecesarias} horas para extracurricular del semestre ${semestre}`,
        )
      } else {
        console.log(
          `  ✅ Completadas ${horasNecesarias} horas de extracurricular para semestre ${semestre}`,
        )
      }
    }
  }

  // ================== Tutorías ==================
  asignarTutorias() {
    console.log('Iniciando asignación de tutorías...')

    for (const grupo of this.grupos) {
      if (grupo.turno === 'Vespertino' && grupo.semestre === 3) {
        console.log(`  → Grupo ${grupo.nomenclatura} no requiere tutorías, se omite.`)
        continue
      }

      let asignado = false
      console.log(`Asignando tutoría para grupo ${grupo.nomenclatura}...`)

      // PASO 1: Buscar profesores que YA dan clases a este grupo Y tienen horas de tutoría
      let profesoresPreferidos = this.profesores.filter((profesor) => {
        const horasTutorias =
          profesor.horas_fortalecimiento_academico?.find((h) => h.nombre === 'Tutorías')?.horas || 0

        if (horasTutorias === 0) return false

        let tutoriasYaAsignadas = 0
        for (const dia of this.dias) {
          for (let bloque = 1; bloque <= this.totalBloques; bloque++) {
            if (profesor.horario[dia][bloque].materia === 'Tutorías') {
              tutoriasYaAsignadas++
            }
          }
        }
        if (tutoriasYaAsignadas >= horasTutorias) return false

        let tieneMateriaConGrupo = false
        for (const dia of this.dias) {
          for (let bloque = 1; bloque <= this.totalBloques; bloque++) {
            if (
              profesor.horario[dia][bloque].grupo === grupo.nomenclatura &&
              profesor.horario[dia][bloque].materia !== 'Tutorías'
            ) {
              tieneMateriaConGrupo = true
              break
            }
          }
          if (tieneMateriaConGrupo) break
        }

        return tieneMateriaConGrupo
      })

      if (profesoresPreferidos.length === 0) {
        console.log(
          `  → No hay profesores que ya den clases al grupo ${grupo.nomenclatura}, buscando cualquier profesor con tutorías...`,
        )

        profesoresPreferidos = this.profesores.filter((profesor) => {
          const horasTutorias =
            profesor.horas_fortalecimiento_academico?.find((h) => h.nombre === 'Tutorías')?.horas ||
            0

          if (horasTutorias === 0) return false

          let tutoriasYaAsignadas = 0
          for (const dia of this.dias) {
            for (let bloque = 1; bloque <= this.totalBloques; bloque++) {
              if (profesor.horario[dia][bloque].materia === 'Tutorías') {
                tutoriasYaAsignadas++
              }
            }
          }

          return tutoriasYaAsignadas < horasTutorias
        })
      }

      if (profesoresPreferidos.length === 0) {
        console.warn(
          `  ⚠ No se encontró profesor disponible con horas de tutoría para grupo ${grupo.nomenclatura}`,
        )
        continue
      }

      profesoresPreferidos.sort((a, b) => {
        const horasA = this.calcularHorasAsignadasProfesor(a)
        const horasB = this.calcularHorasAsignadasProfesor(b)
        return horasA - horasB
      })

      // PASO 3: Buscar horario disponible SIN CREAR HUECOS - Más flexible
      for (const profesor of profesoresPreferidos) {
        for (const dia of this.dias) {
          let bloqueInicio = grupo.turno === 'Matutino' ? 1 : this.config.bloque_inicio_vespertino
          let bloqueFin =
            grupo.turno === 'Matutino' ? this.config.bloque_fin_matutino : this.totalBloques

          // Buscar cualquier bloque que no cree huecos
          for (let bloque = bloqueInicio; bloque <= bloqueFin; bloque++) {
            const profesorDisponible = !profesor.horario[dia][bloque].materia
            const grupoDisponible = !this.grupoTieneClases(grupo, dia, bloque)
            const noEsHorarioRestringido = !(
              profesor.bloques_recomendados_no_asignar || []
            ).includes(bloque)
            const noCreariaHueco = !this.verificarSiCreaHueco(grupo, dia, bloque, 1)

            if (profesorDisponible && grupoDisponible && noEsHorarioRestringido && noCreariaHueco) {
              profesor.horario[dia][bloque] = {
                materia: 'Tutorías',
                abreviatura: 'TUTOR',
                grupo: grupo.nomenclatura,
                semestre: grupo.semestre,
              }
              if (grupo.horario?.[dia]?.[bloque]) {
                grupo.horario[dia][bloque] = {
                  materia: 'Tutorías',
                  abreviatura: 'TUTOR',
                  docente: profesor.nombre,
                  aula: null,
                }
              }
              // Actualizar estadísticas
              const stats = this.estadisticasGrupos.get(grupo.nomenclatura)
              if (stats) {
                stats.horasPorDia[dia]++
                stats.totalHoras++
              }

              console.log(
                `  ✓ Asignada tutoría: Grupo ${grupo.nomenclatura} con ${profesor.nombre} - ${dia} Bloque ${bloque}`,
              )
              asignado = true
              break
            }
          }
          if (asignado) break
        }
        if (asignado) break
      }

      if (!asignado) {
        console.warn(`  ⚠ No se pudo asignar tutoría al grupo ${grupo.nomenclatura}`)
      }
    }
  }

  // ================== Asignar fortalecimiento académico ==================
  asignarFortalecimientoAcademico() {
    console.log('Iniciando asignación de fortalecimiento académico...')

    for (const profesor of this.profesores) {
      const actividades = profesor.horas_fortalecimiento_academico

      if (!actividades || actividades.length == 0) continue

      for (const actividad of actividades) {
        if (actividad.nombre === 'Tutorías') continue

        let horasYaAsignadas = 0
        for (const dia of this.dias) {
          for (let bloque = 1; bloque <= this.totalBloques; bloque++) {
            if (profesor.horario[dia][bloque].materia === actividad.nombre) {
              horasYaAsignadas++
            }
          }
        }

        let horasPorAsignar = Math.max(actividad.horas - horasYaAsignadas, 0)
        if (horasPorAsignar === 0) {
          console.log(`${actividad.nombre} (0h restantes) a ${profesor.nombre}`)
          continue
        }
        console.log(
          `Asignando ${actividad.nombre} (${horasPorAsignar}h restantes) a ${profesor.nombre}`,
        )

        const bloquesPreferidos = profesor.bloques_recomendados_no_asignar || []
        const todosLosBloques = Array.from({ length: this.totalBloques }, (_, i) => i + 1)
        const bloquesOrdenados = [
          ...bloquesPreferidos,
          ...todosLosBloques.filter((b) => !bloquesPreferidos.includes(b)),
        ]

        for (const dia of this.dias) {
          if (horasPorAsignar <= 0) break

          for (const bloque of bloquesOrdenados) {
            if (horasPorAsignar <= 0) break

            if (profesor.horario[dia][bloque].materia === null) {
              profesor.horario[dia][bloque] = {
                materia: actividad.nombre,
                abreviatura: actividad.abreviatura || null,
                grupo: null,
                semestre: null,
              }
              horasPorAsignar--
              console.log(`  → Asignado ${actividad.nombre} - ${dia} Bloque ${bloque}`)
            }
          }
        }

        if (horasPorAsignar > 0) {
          console.warn(
            `  ⚠ Quedaron ${horasPorAsignar}h sin asignar de ${actividad.nombre} para ${profesor.nombre}`,
          )
        }
      }
    }
  }

  // ================== Completar horas de profesores ==================
  completarHorasProfesores() {
    console.log('Completando horas faltantes de profesores...')

    for (const profesor of this.profesores) {
      const horasAsignadas = this.calcularHorasAsignadasProfesor(profesor)
      const horasTotales = profesor.horas_semanales_totales || 0
      const horasFaltantes = horasTotales - horasAsignadas

      if (horasFaltantes <= 0) continue

      console.log(
        `Profesor ${profesor.nombre}: ${horasAsignadas}/${horasTotales} horas. Faltan: ${horasFaltantes}`,
      )

      let horasCompletadas = 0

      if (profesor.materias) {
        for (const materiaProfesor of profesor.materias) {
          if (horasCompletadas >= horasFaltantes) break

          const materia = this.buscarMateriaPorId(materiaProfesor.materia)
          if (!materia) continue

          const gruposAsignados = materiaProfesor.grupos_preferidos_asignar || []

          for (const grupoNom of gruposAsignados) {
            if (horasCompletadas >= horasFaltantes) break

            const grupo = this.grupos.find((g) => g.nomenclatura === grupoNom)
            if (!grupo) continue

            const horasYaAsignadas = this.contarHorasMateriaTotalGrupo(grupo, materia)
            const horasFaltantesMateria = materia.horas_semanales - horasYaAsignadas

            if (horasFaltantesMateria <= 0) continue

            console.log(
              `  → Intentando completar ${materia.nombre} para ${grupoNom}: faltan ${horasFaltantesMateria}h`,
            )

            const maxTam = materia.tipo === 'modulo_profesional' ? 4 : 2

            let horasAsignadasEstaMateria = 0
            while (
              horasAsignadasEstaMateria < horasFaltantesMateria &&
              horasCompletadas < horasFaltantes
            ) {
              let asignado = false

              for (
                let tam = Math.min(maxTam, horasFaltantesMateria - horasAsignadasEstaMateria);
                tam >= 1;
                tam--
              ) {
                const mejorDia = this.encontrarMejorDiaParaAsignarSinHuecos(
                  profesor,
                  grupo,
                  materia,
                  tam,
                )
                if (mejorDia) {
                  if (
                    this.asignarBloquesConsecutivosSinHuecos(
                      mejorDia.dia,
                      profesor,
                      grupo,
                      materia,
                      tam,
                    )
                  ) {
                    horasAsignadasEstaMateria += tam
                    horasCompletadas += tam
                    console.log(
                      `    ✓ Asignadas ${tam}h adicionales de ${materia.nombre} - ${mejorDia.dia}`,
                    )
                    asignado = true
                    break
                  }
                }
              }

              if (!asignado) break
            }
          }
        }
      }

      const horasAunFaltantes = horasFaltantes - horasCompletadas
      if (horasAunFaltantes > 0 && profesor.horas_fortalecimiento_academico) {
        console.log(
          `  → Asignando actividades de fortalecimiento académico específicas (${horasAunFaltantes}h)`,
        )

        const actividadesDisponibles = profesor.horas_fortalecimiento_academico.filter((act) => {
          if (act.nombre === 'Tutorías') return false

          let horasYaAsignadas = 0
          for (const dia of this.dias) {
            for (let bloque = 1; bloque <= this.totalBloques; bloque++) {
              if (profesor.horario[dia][bloque].materia === act.nombre) {
                horasYaAsignadas++
              }
            }
          }

          return horasYaAsignadas < act.horas
        })

        let horasFortalecimiento = 0
        for (const actividad of actividadesDisponibles) {
          if (horasFortalecimiento >= horasAunFaltantes) break

          let horasYaAsignadas = 0
          for (const dia of this.dias) {
            for (let bloque = 1; bloque <= this.totalBloques; bloque++) {
              if (profesor.horario[dia][bloque].materia === actividad.nombre) {
                horasYaAsignadas++
              }
            }
          }

          const horasDisponiblesActividad = actividad.horas - horasYaAsignadas
          const horasPorAsignar = Math.min(
            horasDisponiblesActividad,
            horasAunFaltantes - horasFortalecimiento,
          )

          let horasAsignadasActividad = 0
          for (const dia of this.dias) {
            if (horasAsignadasActividad >= horasPorAsignar) break

            for (let bloque = 1; bloque <= this.totalBloques; bloque++) {
              if (horasAsignadasActividad >= horasPorAsignar) break

              if (profesor.horario[dia][bloque].materia === null) {
                profesor.horario[dia][bloque] = {
                  materia: actividad.nombre,
                  abreviatura: actividad.abreviatura || null,
                  grupo: null,
                  semestre: null,
                }
                horasAsignadasActividad++
                horasFortalecimiento++
                console.log(`    ✓ Asignada ${actividad.nombre} - ${dia} Bloque ${bloque}`)
              }
            }
          }
        }

        const horasFinalesFaltantes = horasAunFaltantes - horasFortalecimiento
        if (horasFinalesFaltantes > 0) {
          console.warn(
            `  ⚠ Quedan ${horasFinalesFaltantes}h sin asignar para ${profesor.nombre} - No hay más actividades de fortalecimiento específicas`,
          )
        }
      } else if (horasAunFaltantes > 0) {
        console.warn(
          `  ⚠ Profesor ${profesor.nombre} no tiene actividades de fortalecimiento académico definidas. Quedan ${horasAunFaltantes}h sin asignar`,
        )
      }
    }
  }

  // ================== Balancear distribución diaria ==================
  balancearDistribucionDiaria() {
    console.log('Balanceando distribución diaria de grupos...')

    for (const grupo of this.grupos) {
      const stats = this.estadisticasGrupos.get(grupo.nomenclatura)
      if (!stats) continue

      console.log(`Grupo ${grupo.nomenclatura}:`)
      let totalHoras = 0
      let diasConClases = 0

      for (const dia of this.dias) {
        const horas = stats.horasPorDia[dia]
        console.log(`  ${dia}: ${horas} horas`)
        totalHoras += horas
        if (horas > 0) diasConClases++
      }

      const promedioHorasPorDia = diasConClases > 0 ? totalHoras / diasConClases : 0
      console.log(
        `  Total: ${totalHoras}h, Promedio: ${promedioHorasPorDia.toFixed(1)}h/día activo`,
      )

      // Verificar huecos (no debería haber ninguno con la nueva lógica)
      const huecos = this.calcularHuecosGrupo(grupo)
      if (huecos > 0) {
        console.warn(`  ⚠ ADVERTENCIA: Grupo ${grupo.nomenclatura} tiene ${huecos} huecos`)
      } else {
        console.log(`  ✅ Sin huecos en el horario`)
      }
    }
  }

  // ================== Generar horarios principales ==================
  generarHorariosDocentes() {
    console.log('\n=== INICIALIZANDO HORARIOS DE PROFESORES ===')
    this.inicializarHorariosProfesores()
    this.inicializarHorariosEscolares()

    console.log('\n=== ASIGNANDO EXTRACURRICULARES ===')
    this.asignarExtracurriculares()

    console.log('\n=== ASIGNANDO MÓDULOS PROFESIONALES ===')
    this.asignarModuloProfesional()

    console.log('\n=== ASIGNANDO TRONCO COMÚN ===')
    this.asignarTroncoComun()

    console.log('\n=== ASIGNANDO TUTORÍAS ===')
    this.asignarTutorias()

    console.log('\n=== COMPLETANDO HORAS DE PROFESORES ===')
    this.completarHorasProfesores()

    console.log('\n=== ASIGNANDO FORTALECIMIENTO ACADÉMICO ===')
    this.asignarFortalecimientoAcademico()
  }

  generarHorariosGrupales() {
    console.log('\n=== GENERANDO HORARIOS GRUPALES ===')

    for (const profesor of this.profesores) {
      for (const dia of this.dias) {
        for (let bloque = 1; bloque <= this.totalBloques; bloque++) {
          const bProfesor = profesor.horario[dia][bloque]
          if (!bProfesor.materia) continue

          // Caso especial: extracurriculares
          if (bProfesor.materia.toLowerCase().startsWith('extracurricular')) {
            const semestre = bProfesor.semestre
            if (semestre) {
              const gruposSemestre = this.grupos.filter(
                (g) => g.semestre === semestre && g.turno === 'Matutino',
              )
              for (const grupo of gruposSemestre) {
                if (this.validarTurnoGrupo(grupo, bloque) && !grupo.horario[dia][bloque]?.materia) {
                  grupo.horario[dia][bloque] = {
                    materia: 'Extracurricular',
                    abreviatura: null,
                    docente: null,
                    aula: null,
                  }
                }
              }
            }
          }
          // Caso normal
          else if (bProfesor.grupo) {
            const grupo = this.grupos.find((g) => g.nomenclatura === bProfesor.grupo)
            if (
              grupo &&
              this.validarTurnoGrupo(grupo, bloque) &&
              !grupo.horario[dia][bloque]?.materia
            ) {
              grupo.horario[dia][bloque] = {
                materia: bProfesor.materia,
                abreviatura: bProfesor.abreviatura,
                docente: profesor.nombre,
                aula: null,
              }
            }
          }
        }
      }
    }
  }

  // ================== Utilidades para estadísticas ==================
  calcularHorasAsignadasProfesor(profesor) {
    let horas = 0
    for (const dia of this.dias) {
      for (let bloque = 1; bloque <= this.totalBloques; bloque++) {
        if (profesor.horario[dia][bloque].materia) horas++
      }
    }
    return horas
  }

  calcularHuecosGrupo(grupo) {
    let huecos = 0
    let bloqueInicio = grupo.turno === 'Matutino' ? 1 : this.config.bloque_inicio_vespertino
    let bloqueFin = grupo.turno === 'Matutino' ? this.config.bloque_fin_matutino : this.totalBloques

    for (const dia of this.dias) {
      let primerClase = null
      let ultimaClase = null
      for (let bloque = bloqueInicio; bloque <= bloqueFin; bloque++) {
        if (grupo.horario[dia][bloque]?.materia) {
          if (primerClase === null) primerClase = bloque
          ultimaClase = bloque
        }
      }
      if (primerClase !== null && ultimaClase !== null) {
        for (let bloque = primerClase; bloque <= ultimaClase; bloque++) {
          if (!grupo.horario[dia][bloque]?.materia) huecos++
        }
      }
    }
    return huecos
  }

  // ================== Validación de coherencia ==================
  validarCoherenciaHorarios() {
    console.log('\n=== VALIDANDO COHERENCIA ENTRE HORARIOS ===')
    let errores = 0
    let huecosTotales = 0

    // Validar coherencia entre profesores y grupos
    for (const profesor of this.profesores) {
      for (const dia of this.dias) {
        for (let bloque = 1; bloque <= this.totalBloques; bloque++) {
          const asignacionProfesor = profesor.horario[dia][bloque]
          if (!asignacionProfesor.materia) continue

          // Validar extracurriculares
          if (asignacionProfesor.materia.toLowerCase().includes('extracurricular')) {
            const match = asignacionProfesor.materia.match(/(\d+)° Semestre/)
            if (match) {
              const semestre = parseInt(match[1])
              const gruposMatutinos = this.grupos.filter(
                (g) => g.semestre === semestre && g.turno === 'Matutino',
              )

              for (const grupo of gruposMatutinos) {
                if (this.validarTurnoGrupo(grupo, bloque)) {
                  const asignacionGrupo = grupo.horario[dia][bloque]
                  if (!asignacionGrupo?.materia || asignacionGrupo.materia !== 'Extracurricular') {
                    console.error(
                      `❌ ERROR: Profesor ${profesor.nombre} tiene extracurricular en ${dia} bloque ${bloque}, pero grupo ${grupo.nomenclatura} no la tiene`,
                    )
                    errores++
                  }
                }
              }
            }
          }
          // Validar materias normales
          else if (asignacionProfesor.grupo) {
            const grupo = this.grupos.find((g) => g.nomenclatura === asignacionProfesor.grupo)
            if (grupo && this.validarTurnoGrupo(grupo, bloque)) {
              const asignacionGrupo = grupo.horario[dia][bloque]
              if (
                !asignacionGrupo?.materia ||
                asignacionGrupo.materia !== asignacionProfesor.materia ||
                asignacionGrupo.docente !== profesor.nombre
              ) {
                console.error(
                  `❌ ERROR: Inconsistencia en ${dia} bloque ${bloque} - Profesor ${profesor.nombre} tiene ${asignacionProfesor.materia} con grupo ${asignacionProfesor.grupo}, pero el grupo tiene ${asignacionGrupo?.materia || 'vacío'}`,
                )
                errores++
              }
            }
          }
        }
      }
    }

    // Validar que los grupos no tengan huecos
    for (const grupo of this.grupos) {
      const huecos = this.calcularHuecosGrupo(grupo)
      huecosTotales += huecos
      if (huecos > 0) {
        console.error(`❌ ERROR: Grupo ${grupo.nomenclatura} tiene ${huecos} huecos`)
        errores++
      }

      // Validar coherencia inversa (grupos -> profesores)
      for (const dia of this.dias) {
        const horarioDia = grupo.horario[dia]
        for (const bloqueStr of Object.keys(horarioDia)) {
          const bloque = parseInt(bloqueStr)
          const asignacionGrupo = horarioDia[bloque]
          if (!asignacionGrupo.materia || asignacionGrupo.materia === 'Extracurricular') continue

          const profesor = asignacionGrupo.docente
            ? this.profesores.find((p) => p.nombre === asignacionGrupo.docente)
            : null
          const asignacionProfesor = profesor?.horario[dia][bloque]
          if (
            !profesor ||
            !asignacionProfesor ||
            asignacionProfesor.grupo !== grupo.nomenclatura ||
            asignacionProfesor.materia !== asignacionGrupo.materia
          ) {
            console.error(
              `❌ ERROR: Grupo ${grupo.nomenclatura} tiene ${asignacionGrupo.materia} con ${asignacionGrupo.docente || 'N/A'} en ${dia} bloque ${bloque}, pero no coincide con horario docente`,
            )
            errores++
          }
        }
      }
    }

    if (errores === 0) {
      console.log('✅ Todos los horarios están coherentes')
      console.log(`✅ Total de huecos en todos los grupos: ${huecosTotales}`)
    } else {
      console.log(`❌ Se encontraron ${errores} errores de coherencia`)
      console.log(`❌ Total de huecos en todos los grupos: ${huecosTotales}`)
    }

    return errores === 0 && huecosTotales === 0
  }

  // ================== Estadísticas detalladas ==================
  mostrarEstadisticasDetalladas() {
    console.log('\n=== ESTADÍSTICAS DETALLADAS ===')

    console.log('\n--- PROFESORES ---')
    let totalHorasAsignadas = 0
    let totalHorasRequeridas = 0

    for (const profesor of this.profesores) {
      const horasAsignadas = this.calcularHorasAsignadasProfesor(profesor)
      const horasRequeridas = profesor.horas_semanales_totales || 0
      const porcentaje =
        horasRequeridas > 0 ? ((horasAsignadas / horasRequeridas) * 100).toFixed(1) : 0

      totalHorasAsignadas += horasAsignadas
      totalHorasRequeridas += horasRequeridas

      console.log(
        `${profesor.nombre.padEnd(25)} | ${horasAsignadas.toString().padStart(2)}/${horasRequeridas.toString().padStart(2)} horas (${porcentaje}%)`,
      )
    }

    const porcentajeGlobal =
      totalHorasRequeridas > 0 ? ((totalHorasAsignadas / totalHorasRequeridas) * 100).toFixed(1) : 0
    console.log(
      `${'TOTAL'.padEnd(25)} | ${totalHorasAsignadas}/${totalHorasRequeridas} horas (${porcentajeGlobal}%)`,
    )

    console.log('\n--- GRUPOS ---')
    let totalHuecos = 0
    for (const grupo of this.grupos) {
      const stats = this.estadisticasGrupos.get(grupo.nomenclatura)
      const huecos = this.calcularHuecosGrupo(grupo)
      totalHuecos += huecos

      const estado = huecos === 0 ? '✅' : '❌'
      console.log(
        `${estado} ${grupo.nomenclatura.padEnd(15)} | Total: ${stats.totalHoras.toString().padStart(2)}h | Huecos: ${huecos} | Distribución: ${this.dias.map((dia) => `${dia.substr(0, 3)}:${stats.horasPorDia[dia]}`).join(' ')}`,
      )
    }

    console.log(`\n--- RESUMEN FINAL ---`)
    console.log(`Total de huecos en el sistema: ${totalHuecos}`)
    console.log(`Horarios sin huecos: ${totalHuecos === 0 ? '✅ SÍ' : '❌ NO'}`)

    console.log('\n--- RESUMEN POR MATERIA ---')
    const resumenMaterias = new Map()

    for (const profesor of this.profesores) {
      for (const dia of this.dias) {
        for (let bloque = 1; bloque <= this.totalBloques; bloque++) {
          const asignacion = profesor.horario[dia][bloque]
          if (asignacion.materia && asignacion.grupo) {
            const key = `${asignacion.materia}-${asignacion.grupo}`
            if (!resumenMaterias.has(key)) {
              resumenMaterias.set(key, 0)
            }
            resumenMaterias.set(key, resumenMaterias.get(key) + 1)
          }
        }
      }
    }

    for (const [key, horas] of resumenMaterias) {
      const [materia, grupo] = key.split('-')
      console.log(`${materia.padEnd(30)} | ${grupo.padEnd(10)} | ${horas}h`)
    }
  }

  imprimirHorariosGrupales() {
    console.log('\n=== HORARIOS GRUPALES ===')
    for (const grupo of this.grupos) {
      console.log(`\n📋 Grupo ${grupo.nomenclatura} (${grupo.turno})`)
      console.log('═'.repeat(80))

      for (const dia of this.dias) {
        let linea = `${dia.padEnd(10)}: `
        let bloqueInicio = grupo.turno === 'Matutino' ? 1 : this.config.bloque_inicio_vespertino
        let bloqueFin =
          grupo.turno === 'Matutino' ? this.config.bloque_fin_matutino : this.totalBloques

        for (let bloque = bloqueInicio; bloque <= bloqueFin; bloque++) {
          const materia = grupo.horario[dia][bloque]?.materia || '-----'
          linea += `[${bloque}:${materia.substr(0, 8).padEnd(8)}] `
        }
        console.log(linea)
      }

      // Mostrar estadísticas de huecos por grupo
      const huecos = this.calcularHuecosGrupo(grupo)
      console.log(`Huecos: ${huecos} ${huecos === 0 ? '✅' : '❌'}`)
    }
  }

  imprimirAsignacionesProfesores() {
    console.log('\n=== HORARIOS PROFESORES ===')
    for (const profesor of this.profesores) {
      console.log(`\n👨‍🏫 Profesor: ${profesor.nombre}`)
      console.log('═'.repeat(60))

      for (const dia of this.dias) {
        console.log(`\n${dia}:`)
        for (let bloque = 1; bloque <= this.totalBloques; bloque++) {
          const bInfo = profesor.horario[dia][bloque]
          if (bInfo.materia) {
            console.log(`  Bloque ${bloque}: ${bInfo.materia.padEnd(25)} - ${bInfo.grupo || 'N/A'}`)
          }
        }
      }
    }
  }

  // ================== Exportación ==================
  exportarHorariosGrupalesJSON() {
    const horariosGrupales = {}
    for (const grupo of this.grupos) {
      horariosGrupales[grupo.nomenclatura] = {
        grupo: grupo.nomenclatura,
        semestre: grupo.semestre,
        turno: grupo.turno,
        carrera: grupo.carrera,
        horario: grupo.horario,
      }
    }
    const outputPath = path.join(algorithmPath, 'horarios_grupales.json')
    fs.writeFileSync(outputPath, JSON.stringify(horariosGrupales, null, 2))
  }

  exportarHorariosProfesoresJSON() {
    const horariosProfesor = {}
    for (const profesor of this.profesores) {
      horariosProfesor[profesor.nombre] = {
        abreviatura: profesor.abreviatura || null,
        horario: profesor.horario,
      }
    }
    const outputPath = path.join(algorithmPath, 'horarios_profesores.json')
    fs.writeFileSync(outputPath, JSON.stringify(horariosProfesor, null, 2))
  }

  // ================== Proceso principal ==================
  ejecutarGeneracionCompleta() {
    console.log('INICIANDO GENERACIÓNDE HORARIOS')
    console.log('═'.repeat(70))

    this.generarHorariosDocentes()
    this.generarHorariosGrupales()

    console.log('\n=== VALIDANDO COHERENCIA Y AUSENCIA DE HUECOS ===')
    const exitoso = this.validarCoherenciaHorarios()

    console.log('\n=== BALANCEANDO DISTRIBUCIÓN ===')
    this.balancearDistribucionDiaria()

    console.log('\n=== ESTADÍSTICAS FINALES ===')
    this.mostrarEstadisticasDetalladas()

    console.log('\n=== EXPORTANDO RESULTADOS ===')
    this.exportarHorariosGrupalesJSON()
    this.exportarHorariosProfesoresJSON()

    if (exitoso) {
      console.log('\n✅ Generación de horarios completada exitosamente SIN HUECOS')
    } else {
      console.log('\n❌ Generación completada pero con errores o huecos')
    }

    return exitoso
  }
}

// ================== PRUEBA Y DEBUG sin DB (descomentar linea para q funcione)==================
// try {
//     const generador = new GeneradorHorarios(materias, grupos, profesores, config);
//     const exitoso = generador.ejecutarGeneracionCompleta();

//     // Mostrar horarios en consola
//     generador.imprimirHorariosGrupales();
//     generador.imprimirAsignacionesProfesores();

//     console.log(`Generación de horarios ${exitoso ? 'completada exitosamente SIN HUECOS' : 'completada con errores o huecos'}`);
// } catch (error) {
//     console.error("Error durante la generación de horarios:", error);
//     process.exit(1);
// }

// ================== PRUEBA Y DEBUG CON DB ==================

async function iniciarGenerador() {
  let generacionLista = false

  try {
    const { materias, grupos, profesores, config } = await cargarDatos()

    const generador = new GeneradorHorarios(materias, grupos, profesores, config)
    const exitoso = generador.ejecutarGeneracionCompleta()

    // Mostrar horarios en consola
    generador.imprimirHorariosGrupales()
    generador.imprimirAsignacionesProfesores()

    generacionLista = exitoso
    console.log(
      `Generación de horarios ${exitoso ? 'completada exitosamente SIN HUECOS' : 'completada con errores o huecos'}`,
    )
  } catch (error) {
    console.error('Error durante la generación de horarios:', error)
    process.exit(1)
  }

  return generacionLista
}

iniciarGenerador().then((resultado) => {
  process.exit(resultado ? 0 : 1)
})
