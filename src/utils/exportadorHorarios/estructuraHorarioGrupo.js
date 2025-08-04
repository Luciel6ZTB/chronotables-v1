import { ref } from 'vue'

export function useEstructuraHorarioGrupo() {
  const horarioEstructura = ref([])

  const cargarHorarioDesdeConfig = async (turno = 'matutino') => {
    try {
      const config = await window.electronAPI.readConfigFile()
      const recesos = config.recesos?.[turno] || []
      const horarios = config.horarios?.[turno] || []
      const bloquesFinales = []
      const bloques = config[`bloques_${turno}`]
      const bloqueInicio = config[`bloque_inicio_${turno}`] || 1
      const bloqueFin = bloqueInicio + bloques - 1

      for (let i = bloqueInicio; i <= bloqueFin; i++) {
        bloquesFinales.push({
          id: `${turno}-${i}-clase`,
          numero: i,
          horario: getHorarioTexto(horarios, i, 'clase'),
          tipo: 'clase',
        })

        if (recesos.includes(i)) {
          bloquesFinales.push({
            id: `${turno}-${i}-receso`,
            numero: 'R',
            horario: getHorarioTexto(horarios, 'R', 'receso', i),
            tipo: 'receso',
          })
        }
      }

      horarioEstructura.value = bloquesFinales
    } catch (e) {
      console.error('Error al cargar horario:', e)
    }
  }

  const cargarHorarioCompleto = async () => {
    await cargarHorarioDesdeConfig('matutino')
    const matutino = [...horarioEstructura.value]

    await cargarHorarioDesdeConfig('vespertino')
    const vespertino = [...horarioEstructura.value]

    const vespertinoSinEmpalme = vespertino.slice(1)
    horarioEstructura.value = [...matutino, ...vespertinoSinEmpalme]
  }

  const getHorarioTexto = (horarios, bloque, tipo) => {
    return horarios.find((h) => h.bloque === bloque && h.tipo === tipo)?.horario || '---'
  }

  return {
    horarioEstructura,
    cargarHorarioDesdeConfig,
    cargarHorarioCompleto,
  }
}
