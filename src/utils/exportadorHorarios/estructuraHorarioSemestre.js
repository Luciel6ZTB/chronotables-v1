export async function obtenerEstructuraDeBloques(turno = 'matutino') {
  try {
    const config = await window.electronAPI.readConfigFile()

    const recesos = config.recesos?.[turno] || []
    const horarios = config.horarios?.[turno] || []
    const bloques = config[`bloques_${turno}`]
    const bloqueInicio = config[`bloque_inicio_${turno}`] || 1
    const bloqueFin = bloqueInicio + bloques - 1

    const estructura = []

    for (let i = bloqueInicio; i <= bloqueFin; i++) {
      estructura.push({
        numero: i,
        hora: getHorarioTexto(horarios, i, 'clase'),
        tipo: 'clase',
      })

      if (recesos.includes(i)) {
        estructura.push({
          numero: 'R',
          hora: getHorarioTexto(horarios, 'R', 'receso', i),
          tipo: 'receso',
        })
      }
    }

    return estructura
  } catch (error) {
    console.error('Error al obtener bloques:', error)
    return []
  }
}

function getHorarioTexto(horarios, bloque, tipo) {
  return horarios.find((h) => h.bloque === bloque && h.tipo === tipo)?.horario || `---`
}

export async function obtenerGruposPorSeccionYSemestreYTurno() {
  try {
    const horariosGrupales = await window.electronAPI.invoke('leer-horarios-grupales')

    const estructura = {
      seccion_1: { 1: { matutino: [], vespertino: [] }, 2: { matutino: [], vespertino: [] } },
      seccion_2: { 3: { matutino: [], vespertino: [] }, 4: { matutino: [], vespertino: [] } },
      seccion_3: { 5: { matutino: [], vespertino: [] }, 6: { matutino: [], vespertino: [] } },
    }

    for (const key in horariosGrupales) {
      const grupo = horariosGrupales[key]
      const turno = grupo.turno?.toLowerCase()
      const semestre = grupo.semestre

      if (![1, 2, 3, 4, 5, 6].includes(semestre)) continue
      if (!['matutino', 'vespertino'].includes(turno)) continue

      const seccion = semestre <= 2 ? 'seccion_1' : semestre <= 4 ? 'seccion_2' : 'seccion_3'

      estructura[seccion][semestre][turno].push(grupo)
    }

    return estructura
  } catch (error) {
    console.error('Error al obtener grupos:', error)
    return {}
  }
}

export function getNombreSemestre(numero) {
  const nombres = ['Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto', 'Sexto']
  return `${nombres[numero - 1]} semestre`
}
