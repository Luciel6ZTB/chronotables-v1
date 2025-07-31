<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGruposStore } from 'src/stores/gruposStore'
import ActionCards from 'components/ActionCards.vue'
import ConfigGroupCard from 'components/ConfigGroupCard.vue'
import ConfigFormGroup from 'components/forms/ConfigFormGroup.vue'
import DeleteWarning from 'components/DeleteWarning.vue'

const selectedGrupo = ref(null)
const showForm = ref(false)
const editingGrupo = ref(null)
const showDeleteWarning = ref(false)

const gruposStore = useGruposStore()
const grupos = computed(() => gruposStore.grupos)

onMounted(() => {
  gruposStore.cargarGrupos()
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
async function onConfirmDelete() {
  try {
    await gruposStore.borrarGrupo(selectedGrupo.value.id)
    selectedGrupo.value = null
    showDeleteWarning.value = false
  } catch (err) {
    console.error('Error al eliminar grupo:', err)
  }
}

async function onGuardar(grupo) {
  try {
    if (grupo.id) {
      await gruposStore.actualizarGrupo(grupo.id, grupo)
    } else {
      await gruposStore.agregarGrupo(grupo)
    }
    showForm.value = false
    selectedGrupo.value = null
  } catch (err) {
    console.error('Error al guardar grupo:', err)
  }
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
