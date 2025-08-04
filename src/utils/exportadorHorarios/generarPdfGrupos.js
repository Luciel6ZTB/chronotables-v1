import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function generarPdfGrupos() {
  try {
    // 1. Obtener datos necesarios
    const [gruposData, config] = await Promise.all([
      window.electronAPI.invoke('leer-horarios-grupales'),
      window.electronAPI.readConfigFile(),
    ])

    // 2. Crear PDF sin página inicial (solución al error)
    let doc = null
    let isFirstPage = true

    // 3. Procesar cada grupo
    for (const grupo of Object.values(gruposData)) {
      // A. Crear documento solo cuando sea necesario
      if (!doc) {
        doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        })
      } else {
        doc.addPage('a4', 'portrait')
        isFirstPage = false
        console.log(isFirstPage)
      }

      // B. Determinar turno y bloques correspondientes
      const turno = grupo.turno.toLowerCase()
      const bloquesTurno = config.horarios?.[turno] || []
      const recesos = config.recesos?.[turno] || []

      // C. Crear estructura de bloques para este turno
      const bloquesConHorarios = []
      const bloquesNumericos = [
        ...new Set(bloquesTurno.filter((b) => typeof b.bloque === 'number').map((b) => b.bloque)),
      ].sort((a, b) => a - b)

      for (const bloqueNum of bloquesNumericos) {
        // Agregar bloque normal
        const horarioClase =
          bloquesTurno.find((b) => b.bloque === bloqueNum && b.tipo === 'clase')?.horario || '---'
        bloquesConHorarios.push({
          numero: bloqueNum,
          horario: horarioClase,
          tipo: 'clase',
        })

        // Agregar receso si corresponde
        if (recesos.includes(bloqueNum)) {
          const horarioReceso =
            bloquesTurno.find((b) => b.bloque === 'R' && b.tipo === 'receso')?.horario || 'RECESO'
          bloquesConHorarios.push({
            numero: 'R',
            horario: horarioReceso,
            tipo: 'receso',
          })
        }
      }

      // D. Encabezado del grupo
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`Horario del Grupo ${grupo.grupo}`, 105, 15, { align: 'center' })

      const infoLinea = [
        `${getOrdinalNumber(grupo.semestre)} Semestre`,
        `Turno: ${grupo.turno}`,
        `Carrera: ${grupo.carrera.trim()}`,
      ].join(' | ')

      doc.setFontSize(9)
      doc.text(infoLinea, 105, 22, { align: 'center' })

      // E. Preparar datos de la tabla (solución definitiva al [object Object])
      const headers = ['Hora', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']
      const body = []

      for (const bloque of bloquesConHorarios) {
        const row = [bloque.horario]

        if (bloque.tipo === 'receso') {
          body.push([
            bloque.horario,
            {
              content: 'RECESO',
              colSpan: 5,
              styles: {
                fillColor: [255, 200, 200],
                fontStyle: 'bold',
                halign: 'center',
                textColor: [0, 0, 0],
                valign: 'middle',
              },
            },
          ])
          continue
        }

        // F. Llenar datos de cada día correctamente
        const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']
        for (const dia of diasSemana) {
          const bloqueKey = bloque.numero.toString()
          const clase = grupo.horario[dia]?.[bloqueKey]

          if (clase?.abreviatura) {
            // Formato de 3 líneas como texto plano
            const contenidoCelda = `${clase.abreviatura}\n${clase.docente || '---'}\n${clase.aula ? `Aula: ${clase.aula}` : '---'}`

            row.push({
              content: contenidoCelda,
              styles: {
                fillColor: [220, 255, 220],
                valign: 'middle',
                fontSize: 6.5,
              },
            })
          } else {
            row.push('---')
          }
        }
        body.push(row)
      }

      // G. Generar tabla principal
      autoTable(doc, {
        head: [headers],
        body: body,
        startY: 28,
        margin: { left: 10, right: 10 },
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [80, 80, 80],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 22, fontStyle: 'bold' },
          ...Object.fromEntries([1, 2, 3, 4, 5].map((i) => [i, { cellWidth: 'auto' }])),
        },
        bodyStyles: {
          minCellHeight: 12,
        },
      })

      // H. Lista resumen de materias
      const materiasDocentes = obtenerMateriasDocentes(grupo.horario)
      if (materiasDocentes.length > 0) {
        const startY = doc.lastAutoTable.finalY + 15
        doc.setFontSize(8)
        doc.text('Materias y docentes:', 14, startY)

        autoTable(doc, {
          body: materiasDocentes,
          startY: startY + 3,
          styles: {
            fontSize: 7,
            cellPadding: 2,
          },
          columnStyles: {
            0: { cellWidth: 25, fontStyle: 'bold', valign: 'middle' },
            1: { cellWidth: 80 },
            2: { cellWidth: 60 },
          },
        })
      }
    }

    // 4. Guardar PDF solo si se creó documento
    if (doc) {
      doc.save('horarios_grupales.pdf')
    }
  } catch (error) {
    console.error('Error al generar PDF:', error)
    throw error
  }
}

// Función auxiliar para número ordinal (1ro, 2do, etc.)
function getOrdinalNumber(num) {
  const suffixes = ['ero', 'do', 'ro', 'to', 'to', 'to', 'mo', 'vo', 'vo', 'no']
  return num === 1 ? '1er' : `${num}${suffixes[num - 1] || 'to'}`
}

// Obtener lista única de materias y docentes
function obtenerMateriasDocentes(horarioGrupo) {
  const materiasMap = new Map()
  const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']

  diasSemana.forEach((dia) => {
    const bloquesDia = horarioGrupo[dia] || {}
    Object.values(bloquesDia).forEach((bloque) => {
      if (bloque?.abreviatura && bloque?.materia) {
        const key = `${bloque.abreviatura}-${bloque.docente || 'sin-docente'}`
        if (!materiasMap.has(key)) {
          materiasMap.set(key, [
            bloque.abreviatura,
            bloque.materia.length > 30 ? `${bloque.materia.substring(0, 27)}...` : bloque.materia,
            bloque.docente || '---',
          ])
        }
      }
    })
  })

  return Array.from(materiasMap.values())
}
