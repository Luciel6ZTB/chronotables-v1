import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useEstructuraHorarioDocente } from './estructuraHorarioDocente'

export async function generarPdfDocentes() {
  try {
    const horariosProfesores = await window.electronAPI.invoke('leer-horarios-docentes')
    const { horarioEstructura, cargarHorarioCompleto } = useEstructuraHorarioDocente()
    await cargarHorarioCompleto()

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // Configuración de estilos
    const styles = {
      fontSize: 7,
      cellPadding: 1.5,
      lineWidth: 0.1,
      lineColor: [50, 50, 50],
      textColor: [0, 0, 0],
    }

    Object.entries(horariosProfesores).forEach(([nombreDocente, datos], index) => {
      if (index > 0) doc.addPage('a4', 'portrait')

      // Título mejorado
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0) // Negro para el título
      doc.text(`Horario: ${nombreDocente}`, 105, 15, { align: 'center' })

      const headers = ['Hora', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
      const body = []

      horarioEstructura.value.forEach((bloque) => {
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
                textColor: [0, 0, 0], // Texto negro para receso
              },
            },
          ])
          return
        }

        const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']
        diasSemana.forEach((dia) => {
          const bloqueKey = bloque.numero.toString()
          const clase = datos.horario[dia]?.[bloqueKey]

          if (clase?.abreviatura) {
            row.push({
              content: `${clase.abreviatura}\n${clase.grupo ? `(${clase.grupo})` : ''}`,
              styles: {
                fillColor: [220, 255, 220],
                valign: 'middle',
              },
            })
          } else {
            row.push('---')
          }
        })

        body.push(row)
      })

      // Tabla que ocupa todo el ancho disponible
      autoTable(doc, {
        head: [headers],
        body: body,
        startY: 20,
        margin: { left: 15, right: 15 }, // Márgenes laterales pequeños
        tableWidth: 'auto', // Ocupa todo el ancho disponible
        styles: styles,
        headStyles: {
          fillColor: [100, 100, 100], // Gris medio para encabezado
          textColor: [255, 255, 255], // Texto blanco
          fontStyle: 'bold',
          fontSize: 8, // Un poco más grande para encabezados
        },
        columnStyles: {
          0: {
            cellWidth: 22, // Ancho fijo para columna de horas
            fontStyle: 'bold',
          },
          // Las demás columnas se reparten el espacio restante
          ...Object.fromEntries(
            [1, 2, 3, 4, 5].map((i) => [
              i,
              {
                cellWidth: 'auto',
                minCellWidth: 25,
              },
            ]),
          ),
        },

        bodyStyles: {
          minCellHeight: 8, // Altura mínima para celdas
        },
        didParseCell: (data) => {
          // Centrar contenido verticalmente
          if (data.section === 'body') {
            data.cell.styles.valign = 'middle'
          }
        },
      })

      // Lista de materias optimizada
      const materias = obtenerMateriasUnicas(datos.horario)
      if (materias.length > 0) {
        const startY = Math.min(doc.lastAutoTable.finalY + 10, 250)
        doc.setFontSize(8)
        doc.setTextColor(0, 0, 0) // Negro
        doc.text('Materias asignadas:', 14, startY)

        autoTable(doc, {
          body: materias.map((m) => [m]),
          startY: startY + 5,
          margin: { left: 14, right: 14 },
          styles: {
            fontSize: 7,
            cellPadding: 2,
            lineColor: [200, 200, 200],
          },
          columnStyles: {
            0: { cellWidth: 'wrap' }, // Ancho según contenido
          },
        })
      }
    })

    doc.save('horarios_docentes.pdf')
  } catch (error) {
    console.error('Error al generar PDF:', error)
    throw error
  }
}

function obtenerMateriasUnicas(horarioDocente) {
  const materiasMap = new Map()
  const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']

  diasSemana.forEach((dia) => {
    const bloquesDia = horarioDocente[dia] || {}
    Object.values(bloquesDia).forEach((bloque) => {
      if (bloque?.materia && bloque?.abreviatura) {
        materiasMap.set(bloque.abreviatura, `${bloque.materia} (${bloque.abreviatura})`)
      }
    })
  })

  return Array.from(materiasMap.values())
}
