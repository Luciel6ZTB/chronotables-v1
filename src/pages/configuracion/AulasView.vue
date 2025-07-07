<script setup>
import { ref, onMounted } from 'vue'
import { aulasMock } from 'src/mockups/index'
import ActionCards from 'components/ActionCards.vue'
import ConfigRoomCard from 'components/ConfigRoomCard.vue'
import ConfigFormRoom from 'components/forms/ConfigFormRoom.vue'
import DeleteWarning from 'components/DeleteWarning.vue'

const aulas = ref([])
const selectedAula = ref(null)
const showForm = ref(false)
const editingAula = ref(null)
const showDeleteWarning = ref(false)

onMounted(() => {
  aulas.value = [...aulasMock]
})

function onAgregar() {
  editingAula.value = null
  showForm.value = true
}
function onEditar() {
  if (selectedAula.value) {
    editingAula.value = { ...selectedAula.value }
    showForm.value = true
  }
}
function onEliminar() {
  if (selectedAula.value) {
    showDeleteWarning.value = true
  }
}
function onConfirmDelete() {
  aulas.value = aulas.value.filter((a) => a.id !== selectedAula.value.id)
  selectedAula.value = null
  showDeleteWarning.value = false
}
function onGuardar(aula) {
  if (aula.id) {
    const idx = aulas.value.findIndex((a) => a.id === aula.id)
    if (idx >= 0) aulas.value[idx] = { ...aula }
  } else {
    aulas.value.push({ ...aula, id: Date.now() })
  }
  showForm.value = false
  selectedAula.value = null
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
          :editar-disable="!selectedAula"
          :eliminar-disable="!selectedAula"
        />
      </div>
      <!-- Main: ConfigSubjectCard, col-9 -->
      <div class="col-12 col-md-9">
        <ConfigRoomCard
          :aulas="aulas"
          :selected-aula="selectedAula"
          @select-aula="selectedAula = $event"
        />
      </div>
    </div>
    <ConfigFormRoom
      v-model="showForm"
      :titulo="editingAula ? 'Editar aula' : 'Agregar aula'"
      color="bg-accent"
      :aula="editingAula"
      @guardar="onGuardar"
    />
    <DeleteWarning
      v-model="showDeleteWarning"
      :nombre="selectedAula?.nombre"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
