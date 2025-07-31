<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDocentesStore } from 'src/stores/docentesStore'
import ActionCards from 'components/ActionCards.vue'
import ConfigTeacherCard from 'components/ConfigTeacherCard.vue'
import ConfigFormTeacher from 'components/forms/ConfigFormTeacher.vue'
import DeleteWarning from 'components/DeleteWarning.vue'

const store = useDocentesStore()
const { docentes } = storeToRefs(store)

const selectedDocente = ref(null)
const showForm = ref(false)
const editingDocente = ref(null)
const showDeleteWarning = ref(false)

onMounted(() => {
  store.cargarDocentes()
})

function onAgregar() {
  editingDocente.value = null
  showForm.value = true
}

function onEditar() {
  if (selectedDocente.value) {
    editingDocente.value = { ...selectedDocente.value }
    showForm.value = true
  }
}

function onEliminar() {
  if (selectedDocente.value) {
    showDeleteWarning.value = true
  }
}

async function onConfirmDelete() {
  try {
    await store.eliminarDocente(selectedDocente.value.id)
    selectedDocente.value = null
    showDeleteWarning.value = false
  } catch (err) {
    console.error('Error al eliminar docente:', err)
  }
}

async function onGuardar(docente) {
  try {
    if (docente.id) {
      await store.editarDocente(docente.id, docente)
    } else {
      await store.agregarDocente(docente)
    }
    showForm.value = false
    selectedDocente.value = null
  } catch (err) {
    console.error('Error al guardar docente:', err)
  }
}
</script>

<template>
  <div>
    <div class="row">
      <div class="col-12 col-md-3">
        <ActionCards
          @agregar="onAgregar"
          @editar="onEditar"
          @eliminar="onEliminar"
          :editar-disable="!selectedDocente"
          :eliminar-disable="!selectedDocente"
        />
      </div>
      <div class="col-12 col-md-9">
        <ConfigTeacherCard
          :docentes="docentes"
          :selected-docente="selectedDocente"
          @select-docente="selectedDocente = $event"
        />
      </div>
    </div>
    <ConfigFormTeacher
      v-model="showForm"
      :titulo="editingDocente ? 'Editar docente' : 'Agregar docente'"
      color="bg-accent"
      :docente="editingDocente"
      @guardar="onGuardar"
    />
    <DeleteWarning
      v-model="showDeleteWarning"
      :nombre="selectedDocente?.nombre"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
