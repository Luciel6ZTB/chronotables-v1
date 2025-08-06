import { ref } from 'vue'

export function useGeneradorHorarios() {
  const generando = ref(false)
  const exito = ref(false)

  async function generar() {
    generando.value = true
    exito.value = false

    try {
      const resultado = await window.electronAPI.generarHorarios()
      exito.value = resultado
    } catch (error) {
      console.error('Error al generar horarios:', error)
    } finally {
      generando.value = false
    }
  }

  return {
    generar,
    generando,
    exito,
  }
}
