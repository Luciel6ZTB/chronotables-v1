// simplificación del otro composable,
import { ref } from 'vue'

export function readHorarioBuilder() {
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
          espacio: '',
          tipo: 'clase',
        })

        if (recesos.includes(i)) {
          bloquesFinales.push({
            id: `${turno}-${i}-receso`,
            numero: 'R',
            horario: getHorarioTexto(horarios, 'R', 'receso', i),
            espacio: 'Receso',
            tipo: 'receso',
          })
        }
      }

      horarioEstructura.value = bloquesFinales
    } catch (e) {
      console.error('Error al cargar horario:', e)
    }
  }

  //para juntar ambos turnos
  const cargarHorarioCompleto = async () => {
    await cargarHorarioDesdeConfig('matutino')
    const matutino = [...horarioEstructura.value]

    await cargarHorarioDesdeConfig('vespertino')
    const vespertino = [...horarioEstructura.value]

    // Eliminar duplicado: matutino termina con bloque 8, vespertino empieza con 1
    const vespertinoSinEmpalme = vespertino.slice(1)

    horarioEstructura.value = [...matutino, ...vespertinoSinEmpalme]
  }

  const getHorarioTexto = (horarios, bloque, tipo) => {
    return (
      horarios.find((h) => h.bloque === bloque && h.tipo === tipo)?.horario || `---` // puedes cambiar a `${fallbackNumero}:00` si quieres mostrar algo más útil
    )
  }

  return {
    horarioEstructura,
    cargarHorarioDesdeConfig,
    cargarHorarioCompleto,
  }
}
