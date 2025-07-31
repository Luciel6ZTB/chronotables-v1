import { defineStore } from 'pinia'
import {
  fetchMaterias,
  crearMateria,
  editarMateria,
  eliminarMateria,
} from 'src/services/materiasService'

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

    async agregarMateria(materia) {
      try {
        const nueva = await crearMateria(materia)
        this.materias.push(nueva)
      } catch (err) {
        console.error('Error al crear materia:', err)
        this.error = err
      }
    },

    async editarMateria(id, materia) {
      try {
        const actualizada = await editarMateria(id, materia)
        if (actualizada) {
          const index = this.materias.findIndex((m) => m.id === id)
          if (index !== -1) this.materias[index] = actualizada
        }
      } catch (err) {
        console.error('Error al actualizar materia:', err)
        this.error = err
      }
    },

    async eliminarMateria(id) {
      try {
        const success = await eliminarMateria(id)
        if (success) {
          this.materias = this.materias.filter((m) => m.id !== id)
        }
      } catch (err) {
        console.error('Error al eliminar materia:', err)
        this.error = err
      }
    },
  },
})
