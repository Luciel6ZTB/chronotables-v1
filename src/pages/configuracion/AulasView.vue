<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAulaStore } from 'src/stores/aulasStore'
import ActionCards from 'components/ActionCards.vue'
import ConfigRoomCard from 'components/ConfigRoomCard.vue'
import ConfigFormRoom from 'components/forms/ConfigFormRoom.vue'
import DeleteWarning from 'components/DeleteWarning.vue'

const selectedAula = ref(null)
const showForm = ref(false)
const editingAula = ref(null)
const showDeleteWarning = ref(false)

const storeAulas = useAulaStore()
const aulas = computed(() => storeAulas.aulas)

onMounted(() => {
  storeAulas.cargarAulas()
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
async function onConfirmDelete() {
  if (selectedAula.value?.id) {
    await storeAulas.eliminarAula(selectedAula.value.id)
    selectedAula.value = null
    showDeleteWarning.value = false
  }
}
async function onGuardar(aula) {
  if (aula.id) {
    await storeAulas.editarAula(aula.id, aula)
  } else {
    await storeAulas.agregarAula(aula)
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
