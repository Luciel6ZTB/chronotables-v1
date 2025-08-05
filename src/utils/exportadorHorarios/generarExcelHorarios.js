import * as XLSX from 'xlsx-js-style'
import {
  obtenerEstructuraDeBloques,
  getNombreSemestre,
  obtenerGruposPorSeccionYSemestreYTurno,
} from './estructuraHorarioSemestre'

const COLOR_MATERIA = '000000'
const COLOR_DOCENTE = 'C00000'
const COLOR_AULA = '0070C0'
const COLOR_BLOQUE = 'D9D9D9'
const COLOR_BORDE_GRUESO = '000000'
const FILA_INICIO_TABLA = 6
const ESPACIADO_ENTRE_TABLAS = 10
const ALTURA_RECESO = 50 // píxeles para la fila de receso

function bordeCelda({
  left = false,
  right = false,
  top = false,
  bottom = false,
  thick = false,
} = {}) {
  const style = {}
  if (left) style.left = { style: thick ? 'thick' : 'thin', color: { rgb: COLOR_BORDE_GRUESO } }
  if (right) style.right = { style: thick ? 'thick' : 'thin', color: { rgb: COLOR_BORDE_GRUESO } }
  if (top) style.top = { style: thick ? 'thick' : 'thin', color: { rgb: COLOR_BORDE_GRUESO } }
  if (bottom) style.bottom = { style: thick ? 'thick' : 'thin', color: { rgb: COLOR_BORDE_GRUESO } }
  return style
}

function formatearCelda(
  texto,
  {
    color = COLOR_MATERIA,
    bold = false,
    bg = null,
    align = 'left',
    border = {},
    wrap = false,
  } = {},
) {
  const style = {
    font: { color: { rgb: color }, bold, sz: 11 },
    alignment: { wrapText: wrap, vertical: 'center', horizontal: align },
    border: bordeCelda(border),
  }
  if (bg) style.fill = { patternType: 'solid', fgColor: { rgb: bg } }
  return { v: texto, s: style }
}

function generarTablaDeSemestre(
  ws,
  bloqueEstructura,
  grupos,
  horariosPorGrupo,
  inicioFila,
  semestre,
  totalCols,
) {
  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']
  const colInicio = 0

  // Título de semestre (solo el nombre, izquierda)
  ws[XLSX.utils.encode_cell({ c: 0, r: inicioFila })] = formatearCelda(
    getNombreSemestre(semestre),
    { bold: true, align: 'left' },
  )

  // Encabezados
  let encabezado1 = [
    formatearCelda('TIEMPO', {
      bold: true,
      border: { left: true, top: true, right: true, bottom: true },
      align: 'center',
    }),
    formatearCelda('HORA', { bold: true, border: { top: true }, align: 'center' }),
    formatearCelda('GRUPO', { bold: true, border: { top: true }, align: 'center' }),
  ]
  let mergeRanges = []

  dias.forEach((dia, idx) => {
    let isFirst = idx === 0,
      isLast = idx === dias.length - 1
    encabezado1.push(
      formatearCelda(dia.toUpperCase(), {
        bold: true,
        border: { top: true, left: isFirst, right: isLast },
        align: 'center',
      }),
      formatearCelda('', { border: { top: true } }),
      formatearCelda('', { border: { top: true, right: isLast } }),
    )
    // Merge de las 3 columnas del día
    const col = 3 + idx * 3
    mergeRanges.push({ s: { c: col, r: inicioFila + 1 }, e: { c: col + 2, r: inicioFila + 1 } })
  })

  // Subcolumnas
  let encabezado2 = [
    formatearCelda('', { border: { left: true } }),
    formatearCelda('', {}),
    formatearCelda('', {}),
  ]
  for (let d = 0; d < dias.length; ++d) {
    let isFirst = d === 0,
      isLast = dias.length - 1 === d
    encabezado2.push(
      formatearCelda('Materia', {
        color: COLOR_MATERIA,
        bold: true,
        border: { top: false, bottom: true, left: isFirst },
        align: 'center',
      }),
      formatearCelda('Docente', {
        color: COLOR_DOCENTE,
        bold: true,
        border: { top: false, bottom: true },
        align: 'center',
      }),
      formatearCelda('Aula', {
        color: COLOR_AULA,
        bold: true,
        border: { top: false, bottom: true, right: isLast },
        align: 'center',
      }),
    )
  }

  XLSX.utils.sheet_add_aoa(ws, [encabezado1], { origin: { r: inicioFila + 1, c: colInicio } })
  XLSX.utils.sheet_add_aoa(ws, [encabezado2], { origin: { r: inicioFila + 2, c: colInicio } })

  // Filas de bloques
  let filaActual = inicioFila + 3
  ws['!rows'] = ws['!rows'] || []

  for (const bloque of bloqueEstructura) {
    if (bloque.numero === 'R') {
      // Fila de receso: merge horizontal, altura grande
      let filaReceso = [
        formatearCelda('', { border: { left: true } }),
        formatearCelda('', {}),
        formatearCelda('', {}),
      ]
      for (let d = 0; d < dias.length * 3; d++) {
        filaReceso.push(formatearCelda('', {}))
      }
      filaReceso[3] = formatearCelda('RECESO', { color: '888888', bold: true, align: 'center' })
      XLSX.utils.sheet_add_aoa(ws, [filaReceso], { origin: { r: filaActual, c: colInicio } })
      // Merge horizontal desde la primer columna de Materia hasta el final de Aula
      mergeRanges.push({
        s: { c: 3, r: filaActual },
        e: { c: totalCols - 1, r: filaActual },
      })
      // Altura grande para la fila
      ws['!rows'][filaActual] = { hpt: ALTURA_RECESO }
      filaActual++
      continue
    }

    // Filas de grupo
    const bloqueStart = filaActual
    const grupoCount = grupos.length
    for (let idx = 0; idx < grupoCount; idx++) {
      const grupo = grupos[idx]
      const isFirstGrupo = idx === 0
      const isLastGrupo = idx === grupoCount - 1
      const fila = [
        // Agrupamiento vertical de tiempo/hora. Solo la primera fila tiene valores, las demás van vacías.
        formatearCelda(isFirstGrupo ? bloque.numero : '', {
          bold: true,
          border: { left: true, top: isFirstGrupo, bottom: isLastGrupo },
          align: 'center',
        }),
        formatearCelda(isFirstGrupo ? bloque.hora : '', {
          bold: true,
          border: { top: isFirstGrupo, bottom: isLastGrupo },
          align: 'center',
        }),
        formatearCelda(grupo, { bold: true, align: 'left' }),
      ]
      for (let d = 0; d < dias.length; d++) {
        const dia = dias[d]
        const clase = horariosPorGrupo?.[grupo]?.horario?.[dia]?.[bloque.numero]
        // Bordes finos entre grupos y días, borde grueso solo al marco de clases del bloque (vertical por día)
        let isFirstDay = d === 0,
          isLastDay = d === dias.length - 1
        let borderMateria = {
          top: isFirstGrupo,
          bottom: isLastGrupo,
          left: isFirstDay,
          right: false,
          thick: false,
        }
        let borderDocente = {
          top: isFirstGrupo,
          bottom: isLastGrupo,
          left: false,
          right: false,
          thick: false,
        }
        let borderAula = {
          top: isFirstGrupo,
          bottom: isLastGrupo,
          left: false,
          right: true,
          thick: isLastDay,
        }
        // Poner borde grueso en vertical exterior de bloque
        if (isFirstDay) (borderMateria.left = true), (borderMateria.thick = true)
        if (isLastDay) (borderAula.right = true), (borderAula.thick = true)
        // Borde grueso horizontal superior/inferior solo en primera/última fila del bloque
        if (isFirstGrupo)
          (borderMateria.top = borderDocente.top = borderAula.top = true),
            (borderMateria.thick = borderDocente.thick = borderAula.thick = true)
        if (isLastGrupo)
          (borderMateria.bottom = borderDocente.bottom = borderAula.bottom = true),
            (borderMateria.thick = borderDocente.thick = borderAula.thick = true)

        fila.push(
          formatearCelda(clase?.materia || '', {
            color: COLOR_MATERIA,
            bg: COLOR_BLOQUE,
            border: borderMateria,
            align: 'left',
            wrap: false,
          }),
          formatearCelda(clase?.docente || '', {
            color: COLOR_DOCENTE,
            bold: true,
            bg: COLOR_BLOQUE,
            border: borderDocente,
            align: 'left',
            wrap: false,
          }),
          formatearCelda(clase?.aula || '', {
            color: COLOR_AULA,
            bold: true,
            bg: COLOR_BLOQUE,
            border: borderAula,
            align: 'left',
            wrap: false,
          }),
        )
      }
      XLSX.utils.sheet_add_aoa(ws, [fila], { origin: { r: filaActual, c: colInicio } })
      filaActual++
    }
    // Agrupamiento (merge) de tiempo/hora en vertical por bloque
    if (grupoCount > 1) {
      mergeRanges.push({
        s: { c: 0, r: bloqueStart },
        e: { c: 0, r: filaActual - 1 },
      })
      mergeRanges.push({
        s: { c: 1, r: bloqueStart },
        e: { c: 1, r: filaActual - 1 },
      })
    }
  }

  ws['!merges'] = (ws['!merges'] || []).concat(mergeRanges)
  ws['!cols'] = [
    { wch: 8 }, // Tiempo
    { wch: 13 }, // Hora
    { wch: 10 }, // Grupo
    ...Array(dias.length * 3).fill({ wch: 18 }),
  ]
  return filaActual + ESPACIADO_ENTRE_TABLAS
}

export async function generarExcelHorarioGrupal() {
  const wb = XLSX.utils.book_new()
  const todosLosHorarios = await window.electronAPI.invoke('leer-horarios-grupales')
  const datosGrupos = await obtenerGruposPorSeccionYSemestreYTurno()
  for (const turno of ['matutino', 'vespertino']) {
    let ws = {}
    let fila = FILA_INICIO_TABLA
    const semestresEnTurno = [1, 2, 3, 4, 5, 6].filter((s) =>
      Object.values(datosGrupos).some((seccion) => seccion[s]?.[turno]?.length),
    )
    for (let idx = 0; idx < semestresEnTurno.length; idx++) {
      const semestre = semestresEnTurno[idx]
      let gruposRaw = []
      for (const seccion of Object.values(datosGrupos)) {
        if (seccion[semestre]?.[turno]) {
          gruposRaw = gruposRaw.concat(seccion[semestre][turno])
        }
      }
      const grupos = gruposRaw.map((g) => g.grupo)
      if (grupos.length === 0) continue
      const estructura = await obtenerEstructuraDeBloques(turno)
      const totalCols = 3 + 5 * 3
      fila = generarTablaDeSemestre(
        ws,
        estructura,
        grupos,
        todosLosHorarios,
        fila,
        semestre,
        totalCols,
      )
    }
    const totalCols = 3 + 5 * 3
    ws['!ref'] = XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: totalCols - 1, r: fila },
    })
    XLSX.utils.book_append_sheet(wb, ws, `Turno ${turno[0].toUpperCase() + turno.slice(1)}`)
  }
  XLSX.writeFile(wb, 'horario_general.xlsx')
}
