<template>
  <q-dialog v-model="dialogVisible">
    <q-card :style="{ minWidth: '350px' }">
      <q-card-section :class="color">
        <div class="text-h6">{{ titulo }}</div>
      </q-card-section>
      <q-card-section>
        <slot></slot>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="closeDialog" />
        <q-btn flat label="Guardar" color="primary" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  titulo: String,
  color: String,
})

const emit = defineEmits(['update:modelValue', 'guardar'])

// Usar un computed getter/setter para v-model
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function closeDialog() {
  dialogVisible.value = false
}

function guardar() {
  emit('guardar')
  closeDialog()
}
</script>
