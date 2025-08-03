import * as XLSX from 'xlsx'
import {
  obtenerEstructuraDeBloques,
  getNombreSemestre,
  obtenerGruposPorSeccionYSemestreYTurno,
} from 'src/utils/exportadorHorarios/estructuraHorarioSemestre'

function formatearCelda(texto, color = '000000') {
  return {
    v: texto,
    s: {
      font: { color: { rgb: color }, bold: false, sz: 11 },
      alignment: { wrapText: true, vertical: 'top' },
    },
  }
}

function generarTablaDeSemestre(
  ws,
  bloqueEstructura,
  grupos,
  horariosPorGrupo,
  inicioFila,
  semestre,
) {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
  const colInicio = 1 // Columna B

  // Encabezado: título del semestre
  const nombreSemestre = getNombreSemestre(semestre)
  const tituloCelda = XLSX.utils.encode_cell({ c: 5, r: inicioFila - 1 }) // F fila
  ws[tituloCelda] = {
    v: nombreSemestre,
    s: {
      font: { bold: true, sz: 12 },
      alignment: { horizontal: 'right' },
    },
  }

  // Fila 7: encabezados de días
  const headers = ['Hora', ...dias]
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: { r: inicioFila, c: colInicio - 1 } })

  let filaActual = inicioFila + 1

  for (const bloque of bloqueEstructura) {
    const fila = [bloque.hora]

    for (const dia of dias) {
      const contenido = []

      for (const grupo of grupos) {
        const clase = horariosPorGrupo?.[grupo]?.horario?.[dia]?.[bloque.numero]

        if (clase) {
          const lineaMateria = clase.materia || ''
          const lineaDocente = clase.docente ? `(${clase.docente})` : ''
          const lineaAula = clase.aula ? `[${clase.aula}]` : ''

          const celdaTexto =
            lineaMateria +
            '\n' +
            (lineaDocente ? `%${lineaDocente}` : '') +
            '\n' +
            (lineaAula ? `#${lineaAula}` : '')

          contenido.push({ grupo, texto: celdaTexto })
        }
      }

      // Junta contenido de todos los grupos del mismo semestre en esa celda
      const textoFinal = contenido.map(({ grupo, texto }) => `${grupo}:\n${texto}`).join('\n\n')

      fila.push(formatearCelda(textoFinal))
    }

    XLSX.utils.sheet_add_aoa(ws, [fila], { origin: { r: filaActual, c: colInicio - 1 } })
    filaActual++
  }

  return filaActual + 2 // espacio entre tablas
}

export async function generarExcelHorarioGrupal() {
  const wb = XLSX.utils.book_new()

  const datosGrupos = await obtenerGruposPorSeccionYSemestreYTurno()

  for (const turno of ['matutino', 'vespertino']) {
    const ws = {}
    let fila = 1

    const estructura = await obtenerEstructuraDeBloques(turno)

    const semestresEnTurno = Object.keys(datosGrupos[turno] || {}).sort((a, b) => +a - +b)

    for (const semestre of semestresEnTurno) {
      const grupos = datosGrupos[turno][semestre]
      const horariosPorGrupo = await window.electronAPI.invoke('leer-horarios-grupales')

      fila = generarTablaDeSemestre(ws, estructura, grupos, horariosPorGrupo, fila, semestre)
    }

    XLSX.utils.book_append_sheet(wb, ws, `Turno ${turno[0].toUpperCase() + turno.slice(1)}`)
  }

  XLSX.writeFile(wb, 'horario_general.xlsx')
}
