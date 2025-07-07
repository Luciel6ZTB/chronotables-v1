<script setup>
import { ref, onMounted } from 'vue'
import { docentesMock } from 'src/mockups/index'
import ActionCards from 'components/ActionCards.vue'
import ConfigTeacherCard from 'components/ConfigTeacherCard.vue'
import ConfigFormTeacher from 'components/forms/ConfigFormTeacher.vue'
import DeleteWarning from 'components/DeleteWarning.vue'

const docentes = ref([])
const selectedDocente = ref(null)
const showForm = ref(false)
const editingDocente = ref(null)
const showDeleteWarning = ref(false)

onMounted(() => {
  docentes.value = [...docentesMock]
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
function onConfirmDelete() {
  docentes.value = docentes.value.filter((d) => d.id !== selectedDocente.value.id)
  selectedDocente.value = null
  showDeleteWarning.value = false
}

function onGuardar(docente) {
  if (docente.id) {
    // Editar existente
    const idx = docentes.value.findIndex((d) => d.id === docente.id)
    if (idx >= 0) {
      docentes.value[idx] = { ...docente }
    }
  } else {
    // Nuevo docente
    docentes.value.push({
      ...docente,
      id: Date.now(), // ID temporal
    })
  }
  showForm.value = false
  selectedDocente.value = null
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
