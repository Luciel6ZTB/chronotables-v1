<script setup>
import { ref } from 'vue'
import ActionCards from 'components/ActionCards.vue'
import ConfigTeacherCard from 'components/ConfigTeacherCard.vue'
import ConfigFormTeacher from 'components/forms/ConfigFormTeacher.vue'
import DeleteWarning from 'components/DeleteWarning.vue'

const docentes = ref([
  { id: 1, nombreCompleto: 'Yves Ananías Flores Reyes', tituloPreferente: 'Mtro.' },
  { id: 2, nombreCompleto: 'María López Pérez', tituloPreferente: 'Dra.' },
  { id: 3, nombreCompleto: 'Daniel Ernesto Ruíz Anzaldua', tituloPreferente: 'Ing.' },
  { id: 4, nombreCompleto: 'Lorena Paz Lule', tituloPreferente: 'Mtra.' },
])

const selectedDocente = ref(null)
const showForm = ref(false)
const editingDocente = ref(null)
const showDeleteWarning = ref(false)

//agregar
function onAgregar() {
  editingDocente.value = null
  showForm.value = true
}

// Botón editar
function onEditar() {
  if (selectedDocente.value) {
    editingDocente.value = { ...selectedDocente.value }
    showForm.value = true
  }
}

// Botón eliminar
function onEliminar() {
  if (selectedDocente.value) {
    showDeleteWarning.value = true
  }
}

function onGuardar(docente) {
  if (docente.id) {
    // Editar existente
    const idx = docentes.value.findIndex((d) => d.id === docente.id)
    if (idx >= 0) docentes.value[idx] = { ...docente }
  } else {
    // Nuevo
    docentes.value.push({ ...docente, id: Date.now() })
  }
  showForm.value = false
  selectedDocente.value = null
}

// Confirmar eliminar
function onConfirmDelete() {
  docentes.value = docentes.value.filter((d) => d.id !== selectedDocente.value.id)
  selectedDocente.value = null
  showDeleteWarning.value = false
}
</script>

<template>
  <div>
    <div class="row">
      <!-- Sidebar: ActionCards, col-3 -->
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
      @guardar="onGuardar"
    >
      <q-input v-model="nombre" label="Nombre del docente" />
    </ConfigFormTeacher>
    <DeleteWarning
      v-model="showDeleteWarning"
      :nombre="selectedDocente?.nombre"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
