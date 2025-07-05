<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  nombre: String,
})
const emit = defineEmits(['update:modelValue', 'confirm'])

// 1. Crea un estado local para el dialog
const dialogVisible = ref(props.modelValue)

// 2. Sincroniza el estado local con la prop
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
  },
)

// 3. Cuando cambie el local, emite el cambio al padre
watch(dialogVisible, (val) => {
  if (val !== props.modelValue) {
    emit('update:modelValue', val)
  }
})

function closeDialog() {
  dialogVisible.value = false
}
function confirmDelete() {
  emit('confirm')
  closeDialog()
}
</script>

<template>
  <q-dialog v-model="dialogVisible">
    <q-card style="min-width: 350px">
      <q-card-section class="bg-negative text-white">
        <div class="text-h6">¿Estás seguro?</div>
      </q-card-section>
      <q-card-section>
        <div>
          Vas a eliminar <b>{{ nombre }}</b
          >. Esta acción <span class="text-negative">no se puede deshacer</span>.
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="closeDialog" />
        <q-btn flat label="Eliminar" color="negative" @click="confirmDelete" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
