import { defineStore } from 'pinia'
import { fetchGrupos, crearGrupo, editarGrupo, eliminarGrupo } from 'src/services/gruposService'

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

    async agregarGrupo(nuevoGrupoData) {
      this.cargando = true
      this.error = null
      try {
        const grupoCreado = await crearGrupo(nuevoGrupoData)
        this.grupos.push(grupoCreado)
        return grupoCreado
      } catch (err) {
        this.error = err
        console.error('Error al crear grupo:', err)
        throw err
      } finally {
        this.cargando = false
      }
    },

    async actualizarGrupo(id, datosActualizados) {
      this.cargando = true
      this.error = null
      try {
        const grupoEditado = await editarGrupo(id, datosActualizados)
        const index = this.grupos.findIndex((g) => g.id === id)
        if (index !== -1) this.grupos[index] = grupoEditado
        return grupoEditado
      } catch (err) {
        this.error = err
        console.error('Error al editar grupo:', err)
        throw err
      } finally {
        this.cargando = false
      }
    },

    async borrarGrupo(id) {
      this.cargando = true
      this.error = null
      try {
        await eliminarGrupo(id)
        this.grupos = this.grupos.filter((g) => g.id !== id)
      } catch (err) {
        this.error = err
        console.error('Error al eliminar grupo:', err)
        throw err
      } finally {
        this.cargando = false
      }
    },
  },
})
