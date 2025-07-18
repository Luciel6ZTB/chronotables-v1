<script setup>
import { ref, onMounted } from 'vue'
import { fetchGrupos } from 'src/services/gruposService'
import ActionCards from 'components/ActionCards.vue'
import ConfigGroupCard from 'components/ConfigGroupCard.vue'
import ConfigFormGroup from 'components/forms/ConfigFormGroup.vue'
import DeleteWarning from 'components/DeleteWarning.vue'

const grupos = ref([])
const selectedGrupo = ref(null)
const showForm = ref(false)
const editingGrupo = ref(null)
const showDeleteWarning = ref(false)

onMounted(async () => {
  grupos.value = await fetchGrupos()
})

function onAgregar() {
  editingGrupo.value = null
  showForm.value = true
}
function onEditar() {
  if (selectedGrupo.value) {
    editingGrupo.value = { ...selectedGrupo.value }
    showForm.value = true
  }
}
function onEliminar() {
  if (selectedGrupo.value) {
    showDeleteWarning.value = true
  }
}
function onConfirmDelete() {
  grupos.value = grupos.value.filter((g) => g.id !== selectedGrupo.value.id)
  selectedGrupo.value = null
  showDeleteWarning.value = false
}
function onGuardar(grupo) {
  if (grupo.id) {
    const idx = grupos.value.findIndex((g) => g.id === grupo.id)
    if (idx >= 0) grupos.value[idx] = { ...grupo }
  } else {
    grupos.value.push({ ...grupo, id: Date.now() })
  }
  showForm.value = false
  selectedGrupo.value = null
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
          :editar-disable="!selectedGrupo"
          :eliminar-disable="!selectedGrupo"
        />
      </div>
      <!-- Main: ConfigSubjectCard, col-9 -->
      <div class="col-12 col-md-9">
        <ConfigGroupCard
          :grupos="grupos"
          :selected-grupo="selectedGrupo"
          @select-grupo="selectedGrupo = $event"
        />
      </div>
    </div>
    <ConfigFormGroup
      v-model="showForm"
      :titulo="editingGrupo ? 'Editar grupo' : 'Agregar grupo'"
      color="bg-accent"
      :grupo="editingGrupo"
      @guardar="onGuardar"
    />
    <DeleteWarning
      v-model="showDeleteWarning"
      :nombre="selectedGrupo?.nombre"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
