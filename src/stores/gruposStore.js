import { defineStore } from 'pinia'
import { fetchGrupos } from 'src/services/gruposService'

export const useGruposStore = defineStore('grupos', {
  state: () => ({
    grupos: [],
    cargando: false,
    error: null,
  }),

  actions: {
    async cargarGrupos() {
      this.cargando = true
      this.error = null
      try {
        const data = await fetchGrupos()
        this.grupos = data
      } catch (err) {
        this.error = err
        console.error('Error al cargar grupos:', err)
      } finally {
        this.cargando = false
      }
    },

    getGrupoPorId(id) {
      return this.grupos.find((g) => g.id === id)
    },

    limpiar() {
      this.grupos = []
    },
  },
})
