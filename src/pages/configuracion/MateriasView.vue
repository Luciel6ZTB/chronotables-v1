<script setup>
import { ref, onMounted } from 'vue'
import { materiasMock } from 'src/mockups/index'
import ActionCards from 'components/ActionCards.vue'
import ConfigSubjectCard from 'components/ConfigSubjectCard.vue'
import ConfigFormMateria from 'components/forms/ConfigFormSubject.vue'
import DeleteWarning from 'components/DeleteWarning.vue'

const materias = ref([])
const selectedMateria = ref(null)
const showForm = ref(false)
const editingMateria = ref(null)
const showDeleteWarning = ref(false)

//cargar mockups
onMounted(() => {
  materias.value = [...materiasMock]
})

function onAgregar() {
  editingMateria.value = null
  showForm.value = true
}

function onEditar() {
  if (selectedMateria.value) {
    editingMateria.value = { ...selectedMateria.value }
    showForm.value = true
  }
}

function onEliminar() {
  if (selectedMateria.value) {
    showDeleteWarning.value = true
  }
}

function onConfirmDelete() {
  materias.value = materias.value.filter((m) => m.id !== selectedMateria.value.id)
  selectedMateria.value = null
  showDeleteWarning.value = false
}

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
