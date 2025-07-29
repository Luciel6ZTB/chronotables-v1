import { defineStore } from 'pinia'
import { fetchMaterias } from 'src/services/materiasService'

export const useMateriasStore = defineStore('materias', {
  state: () => ({
    materias: [],
    cargando: false,
    error: null,
  }),

  actions: {
    async cargarMaterias() {
      this.cargando = true
      this.error = null
      try {
        const data = await fetchMaterias()
        this.materias = data
      } catch (err) {
        this.error = err
        console.error('Error al cargar materias:', err)
      } finally {
        this.cargando = false
      }
    },
  },
})
