import { defineStore } from 'pinia'
import { fetchDocentes } from 'src/services/docentesService'

export const useDocentesStore = defineStore('docentes', {
  state: () => ({
    docentes: [],
    cargando: false,
    error: null,
  }),

  actions: {
    async cargarDocentes() {
      this.cargando = true
      this.error = null
      try {
        const data = await fetchDocentes()
        this.docentes = data
      } catch (err) {
        this.error = err
        console.error('Error al cargar docentes:', err)
      } finally {
        this.cargando = false
      }
    },
  },
})
