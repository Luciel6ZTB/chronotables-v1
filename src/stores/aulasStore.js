import { defineStore } from 'pinia'
import { fetchAulas, crearAula, editarAula, eliminarAula } from 'src/services/aulasServices'

export const useAulaStore = defineStore('aulas', {
  state: () => ({
    aulas: [],
    cargando: false,
    error: null,
  }),

  actions: {
    async cargarAulas() {
      this.cargando = true
      this.error = null
      try {
        const data = await fetchAulas()
        this.aulas = data
      } catch (err) {
        this.error = err
        console.error('Error al cargar aulas:', err)
      } finally {
        this.cargando = false
      }
    },

    async agregarAula(payloadPlano) {
      this.cargando = true
      this.error = null
      try {
        const nueva = await crearAula(payloadPlano)
        this.aulas.push(nueva)
        return nueva
      } catch (err) {
        this.error = err
        console.error('Error al crear aula:', err)
        throw err
      } finally {
        this.cargando = false
      }
    },

    async editarAula(id, payloadPlano) {
      this.cargando = true
      this.error = null
      try {
        const actualizada = await editarAula(id, payloadPlano)
        const index = this.aulas.findIndex((a) => a.id === id)
        if (index !== -1) this.aulas[index] = actualizada
        return actualizada
      } catch (err) {
        this.error = err
        console.error('Error al editar aula:', err)
        throw err
      } finally {
        this.cargando = false
      }
    },

    async eliminarAula(id) {
      this.cargando = true
      this.error = null
      try {
        await eliminarAula(id)
        this.aulas = this.aulas.filter((a) => a.id !== id)
      } catch (err) {
        this.error = err
        console.error('Error al eliminar aula:', err)
        throw err
      } finally {
        this.cargando = false
      }
    },
  },
})
