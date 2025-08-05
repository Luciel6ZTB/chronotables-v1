import * as XLSX from 'xlsx-js-style'
import { useEstructuraHorarioDocente } from './estructuraHorarioDocente'

function toRoman(num) {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
  return romans[num - 1] || ''
}

function celdaHead(text, opts = {}) {
  return {
    v: text,
    s: {
      font: { bold: true, color: { rgb: opts.color || '000000' }, sz: 12 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      ...(opts.bg ? { fill: { patternType: 'solid', fgColor: { rgb: opts.bg } } } : {}),
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
      },
    },
  }
}

function celdaHorario(text, opts = {}) {
  return {
    v: text,
    s: {
      font: { color: { rgb: '000000' }, sz: 11 },
      alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true,
      },
      ...(opts.bg ? { fill: { patternType: 'solid', fgColor: { rgb: opts.bg } } } : {}),
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
      },
    },
  }
}

async function leerHorariosDocentes() {
  return await window.electronAPI.invoke('leer-horarios-docentes')
}

// Corrección aquí: uso correcto del composable
async function cargarEstructuraBloques() {
  const { horarioEstructura, cargarHorarioCompleto } = useEstructuraHorarioDocente()
  await cargarHorarioCompleto()
  return horarioEstructura.value
}

function generarHojaDocente({ nombre, horario, bloques, periodo }) {
  const ws = {}

  ws['A1'] = celdaHead('INSTITUTO TAMAULIPECO DE CAPACITACIÓN PARA EL EMPLEO')
  ws['A2'] = celdaHead('PLANTEL REYNOSA')
  ws['A3'] = celdaHead(`HORARIO DE DOCENTE ${periodo}`)

  ws['A4'] = celdaHead('DOCENTE', { bg: 'BE735E' })
  ws['B4'] = celdaHead(nombre, { color: '000000' }) // rojo oscuro

  ws['!merges'] = [
    { s: { c: 0, r: 0 }, e: { c: 5, r: 0 } },
    { s: { c: 0, r: 1 }, e: { c: 5, r: 1 } },
    { s: { c: 0, r: 2 }, e: { c: 5, r: 2 } },
    { s: { c: 1, r: 3 }, e: { c: 5, r: 3 } },
  ]

  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']
  const header = [celdaHead('HORA', { bg: 'BE735E' })].concat(
    dias.map((d) => celdaHead(d, { bg: 'BE735E' })),
  )
  XLSX.utils.sheet_add_aoa(ws, [header], { origin: { r: 4, c: 0 } })

  let fila = 5
  for (const bloque of bloques) {
    const horaStr = bloque.horario || ''
    if (bloque.numero === 'R') {
      // Receso: hora en la columna de hora (A), y "RECESO" en las demás
      const row = [celdaHorario(horaStr, { center: true })]
      for (let i = 0; i < dias.length; i++) {
        row.push(celdaHorario('RECESO', { bg: 'D9D9D9', center: true }))
      }
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: { r: fila, c: 0 } })
      // Merge de columnas B a F (1 a 5) en esa fila
      ws['!merges'] = ws['!merges'] || []
      ws['!merges'].push({
        s: { r: fila, c: 1 }, // inicio: fila actual, columna 1 (B)
        e: { r: fila, c: 5 }, // fin: misma fila, columna 5 (F)
      })
    } else {
      const row = [celdaHorario(horaStr)]
      for (const dia of dias) {
        let contenido = ''
        let estilo = { center: true }

        const clase = horario?.[dia]?.[String(bloque.numero)]
        if (clase?.materia) {
          contenido = `${clase.materia}\nGrupo ${clase.grupo || ''}\nSemestre ${toRoman(clase.semestre)}`
        }
        row.push(celdaHorario(contenido, estilo))
      }
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: { r: fila, c: 0 } })
    }

    fila++
  }

  ws['!cols'] = [{ wch: 18 }, ...Array(dias.length).fill({ wch: 32 })]
  ws['!rows'] = [{ hpt: 30 }, { hpt: 22 }, { hpt: 20 }, { hpt: 22 }].concat(
    Array(fila - 4).fill({ hpt: 55 }),
  )

  ws['!ref'] = XLSX.utils.encode_range({
    s: { c: 0, r: 0 },
    e: { c: dias.length, r: fila },
  })

  return ws
}

export async function generarExcelDocente(periodo = 'FEBRERO - JULIO 2025') {
  const wb = XLSX.utils.book_new()
  const horariosDocentes = await leerHorariosDocentes()
  const bloques = await cargarEstructuraBloques()

  for (const nombreDocente of Object.keys(horariosDocentes)) {
    const horario = horariosDocentes[nombreDocente].horario
    const ws = generarHojaDocente({
      nombre: nombreDocente,
      horario,
      bloques,
      periodo,
    })
    XLSX.utils.book_append_sheet(wb, ws, nombreDocente.substring(0, 29))
  }
  console.log('Total de hojas:', wb.SheetNames.length)

  XLSX.writeFile(wb, 'horarios_docentes.xlsx')
}
