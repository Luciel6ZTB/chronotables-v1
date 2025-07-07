<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  titulo: String,
  color: String,
  docente: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'guardar'])

const nombre_completo = ref('')
const nombre_corto = ref('')
const horas_semanales = ref('')

watch(
  () => props.docente,
  (nueva) => {
    if (nueva) {
      nombre_corto.value = nueva.nombre_corto || ''
      nombre_completo.value = nueva.nombre_completo || ''
      horas_semanales.value = nueva.horas_semanales || ''
    } else {
      nombre_corto.value = ''
      nombre_completo.value = ''
      horas_semanales.value = ''
    }
  },
  { immediate: true },
)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function closeDialog() {
  dialogVisible.value = false
}
function guardar() {
  emit('guardar', {
    nombre_completo: nombre_completo.value,
    nombre_corto: nombre_corto.value,
    id: props.docente?.id, // Si es edición, pasa el id
    horas_semanales: horas_semanales.value,
  })
  closeDialog()
}
</script>

<template>
  <q-dialog v-model="dialogVisible">
    <q-card style="min-width: 350px">
      <q-card-section :class="color">
        <div class="text-h6">{{ titulo }}</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="nombre_completo" label="Nombre completo" />
        <q-input v-model="nombre_corto" label="Abreviación" />
        <q-input v-model="horas_semanales" label="Horas a la semana" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="closeDialog" />
        <q-btn flat label="Guardar" color="primary" @click="guardar" :disable="!nombre_completo" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
