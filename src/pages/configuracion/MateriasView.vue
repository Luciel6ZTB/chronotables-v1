<script setup>
import { ref } from 'vue'
import ActionCards from 'components/ActionCards.vue'
import ConfigSubjectCard from 'components/ConfigSubjectCard.vue'
import ConfigFormMateria from 'components/forms/ConfigFormSubject.vue'
import DeleteWarning from 'components/DeleteWarning.vue'

// Estado compartido
const materias = ref([
  { id: 1, nombre: 'Matemáticas', clave: 'MAT101', descripcion: 'Álgebra' },
  { id: 2, nombre: 'Español', clave: 'ESP102', descripcion: 'Lengua' },
  { id: 3, nombre: 'Conservación de la Energía', clave: 'FIS103', descripcion: 'Mecánica' },
  { id: 4, nombre: 'Física', clave: 'FIS103', descripcion: 'Mecánica' },
  { id: 5, nombre: 'Física', clave: 'FIS103', descripcion: 'Mecánica' },
  { id: 6, nombre: 'Física', clave: 'FIS103', descripcion: 'Mecánica' },
  { id: 7, nombre: 'Física', clave: 'FIS103', descripcion: 'Mecánica' },
])
const selectedMateria = ref(null)
const showForm = ref(false)
const editingMateria = ref(null)
const showDeleteWarning = ref(false)

// Botón agregar
function onAgregar() {
  editingMateria.value = null
  showForm.value = true
}

// Botón editar
function onEditar() {
  if (selectedMateria.value) {
    editingMateria.value = { ...selectedMateria.value }
    showForm.value = true
  }
}

// Botón eliminar
function onEliminar() {
  // Abre el modal de advertencia, no elimina aún
  if (selectedMateria.value) {
    showDeleteWarning.value = true
  }
}

function onConfirmDelete() {
  // Ahora sí elimina
  materias.value = materias.value.filter((m) => m.id !== selectedMateria.value.id)
  selectedMateria.value = null
  showDeleteWarning.value = false
}

// Guardar (crear o editar)
function onGuardar(materia) {
  if (materia.id) {
    // Editar existente
    const idx = materias.value.findIndex((m) => m.id === materia.id)
    if (idx >= 0) materias.value[idx] = { ...materia }
  } else {
    // Nueva
    materias.value.push({ ...materia, id: Date.now() })
  }
  selectedMateria.value = null
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
          :editar-disable="!selectedMateria"
          :eliminar-disable="!selectedMateria"
        />
      </div>
      <div class="col-12 col-md-9">
        <ConfigSubjectCard
          :materias="materias"
          :selected-materia="selectedMateria"
          @select-materia="selectedMateria = $event"
        />
      </div>
    </div>
    <ConfigFormMateria
      v-model="showForm"
      :titulo="editingMateria ? 'Editar materia' : 'Agregar materia'"
      color="bg-accent"
      :materia="editingMateria"
      @guardar="onGuardar"
    />
    <DeleteWarning
      v-model="showDeleteWarning"
      :nombre="selectedMateria?.nombre"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
