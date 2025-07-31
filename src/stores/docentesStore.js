import { defineStore } from 'pinia'
import { Docente } from 'src/models/Docente'
import {
  fetchDocentes,
  crearDocente,
  editarDocente,
  eliminarDocente,
} from 'src/services/docentesService'

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
        this.docentes = data.map((d) => new Docente(d))
      } catch (err) {
        this.error = err
        console.error('Error al cargar docentes:', err)
      } finally {
        this.cargando = false
      }
    },

    async agregarDocente(payloadPlano) {
      this.cargando = true
      this.error = null
      try {
        const docente = new Docente(payloadPlano)
        const id = await crearDocente(docente.toPayload())
        docente.id = id
        this.docentes.push(docente)
        return id
      } catch (err) {
        this.error = err
        console.error('Error al crear docente:', err)
        throw err
      } finally {
        this.cargando = false
      }
    },

    async editarDocente(id, payloadPlano) {
      this.cargando = true
      this.error = null
      try {
        const docente = new Docente(payloadPlano)
        const actualizadoPlano = await editarDocente(id, docente.toPayload())
        const actualizado = new Docente(actualizadoPlano)
        const index = this.docentes.findIndex((d) => d.id === id)
        if (index !== -1) this.docentes[index] = actualizado
        return actualizado
      } catch (err) {
        this.error = err
        console.error('Error al editar docente:', err)
        throw err
      } finally {
        this.cargando = false
      }
    },

    async eliminarDocente(id) {
      this.cargando = true
      this.error = null
      try {
        await eliminarDocente(id)
        this.docentes = this.docentes.filter((d) => d.id !== id)
      } catch (err) {
        this.error = err
        console.error('Error al eliminar docente:', err)
        throw err
      } finally {
        this.cargando = false
      }
    },
  },
})
