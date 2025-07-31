<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMateriasStore } from 'src/stores/materiasStore'
import ActionCards from 'components/ActionCards.vue'
import ConfigSubjectCard from 'components/ConfigSubjectCard.vue'
import ConfigFormMateria from 'components/forms/ConfigFormSubject.vue'
import DeleteWarning from 'components/DeleteWarning.vue'

const store = useMateriasStore()
const { materias } = storeToRefs(store)

const selectedMateria = ref(null)
const showForm = ref(false)
const editingMateria = ref(null)
const showDeleteWarning = ref(false)

onMounted(() => {
  store.cargarMaterias()
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

async function onConfirmDelete() {
  try {
    await store.eliminarMateria(selectedMateria.value.id)
    selectedMateria.value = null
    showDeleteWarning.value = false
  } catch (err) {
    console.error('Error al eliminar materia:', err)
  }
}

async function onGuardar(materia) {
  try {
    if (materia.id) {
      await store.editarMateria(materia.id, materia)
    } else {
      await store.agregarMateria(materia)
    }
    showForm.value = false
    selectedMateria.value = null
  } catch (err) {
    console.error('Error al guardar materia:', err)
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
