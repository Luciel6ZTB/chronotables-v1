export function useEditAulas() {
  const asignarAulaEnGrupo = async ({ grupo, materia, docente, aula }) => {
    const data = await window.electronAPI.invoke('leer-horarios-grupales')

    if (!data?.[grupo]) {
      console.warn(`Grupo ${grupo} no encontrado.`)
      return
    }

    const horario = data[grupo].horario

    for (const dia in horario) {
      for (const bloque in horario[dia]) {
        const celda = horario[dia][bloque]
        if (
          celda.materia &&
          celda.docente &&
          celda.materia === materia &&
          celda.docente === docente
        ) {
          celda.aula = aula
        }
      }
    }

    await window.electronAPI.invoke('guardar-horarios-grupales', data)
  }

  return {
    asignarAulaEnGrupo,
  }
}
