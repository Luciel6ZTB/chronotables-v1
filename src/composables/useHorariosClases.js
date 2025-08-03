import { ref } from 'vue'

export function useHorariosGrupales() {
  const gruposDisponibles = ref([])
  const horarioGrupoSeleccionado = ref(null)

  const cargarGruposHorarios = async () => {
    try {
      const grupos = await window.electronAPI.invoke('obtener-grupos-horarios')
      gruposDisponibles.value = grupos.map((g) => ({
        id: g, // Ej: "508H"
        nombre: g,
      }))
    } catch (error) {
      console.error('Error al cargar grupos de horarios:', error)
    }
  }

  const cargarHorarioDeGrupo = async (grupoId) => {
    try {
      horarioGrupoSeleccionado.value = await window.electronAPI.invoke(
        'obtener-horario-de-grupo',
        grupoId,
      )
    } catch (error) {
      console.error(`Error al obtener horario de grupo ${grupoId}:`, error)
      horarioGrupoSeleccionado.value = null
    }
  }

  return {
    gruposDisponibles,
    horarioGrupoSeleccionado,
    cargarGruposHorarios,
    cargarHorarioDeGrupo,
  }
}

export function useHorariosDocentes() {
  const docentesDisponibles = ref([])
  const horarioDocenteSeleccionado = ref(null)

  const cargarDocentesHorarios = async () => {
    try {
      const docentes = await window.electronAPI.invoke('obtener-docentes-horarios')
      docentesDisponibles.value = docentes.map((nombre) => ({
        id: nombre,
        nombre,
      }))
    } catch (error) {
      console.error('Error al cargar docentes de horarios: ', error)
    }
  }

  const cargarHorarioDocente = async (nombreDocente) => {
    try {
      horarioDocenteSeleccionado.value = await window.electronAPI.invoke(
        'obtener-horario-de-docente',
        nombreDocente,
      )
    } catch (error) {
      console.error(`Error al obtener horario de docente ${nombreDocente}`, error)
      horarioDocenteSeleccionado.value = null
    }
  }

  return {
    docentesDisponibles,
    horarioDocenteSeleccionado,
    cargarDocentesHorarios,
    cargarHorarioDocente,
  }
}
