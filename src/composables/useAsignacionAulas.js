export function useAulasGrupales() {
  const editarAulaHorario = async ({ grupo, materia, docente, aula }) => {
    try {
      const respuesta = await window.electronAPI.invoke('editar-aula-horario', {
        grupo,
        materia,
        docente,
        aula,
      })

      return respuesta
    } catch (error) {
      console.error('Error desde composable:', error)
      return { ok: false, error: error.message }
    }
  }

  return {
    editarAulaHorario,
  }
}
