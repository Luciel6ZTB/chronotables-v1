<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  titulo: String,
  color: String,
  docente: {
    // Puede ser null o un objeto para editar
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['update:modelValue', 'guardar'])

// Estado local del formulario
const nombreCompleto = ref('')
const tituloPreferente = ref('')

// Cuando docente cambie, actualiza campos
watch(
  () => props.docente,
  (nuevo) => {
    if (nuevo) {
      nombreCompleto.value = nuevo.nombreCompleto || ''
      tituloPreferente.value = nuevo.tituloPreferente || ''
    } else {
      nombreCompleto.value = ''
      tituloPreferente.value = ''
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
    nombreCompleto: nombreCompleto.value,
    tituloPreferente: tituloPreferente.value,
    id: props.docente?.id, // Si es edición, pasa el id
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
        <q-input v-model="nombreCompleto" label="Nombre completo" />
        <q-input v-model="tituloPreferente" label="Título preferente" class="q-mt-md" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="closeDialog" />
        <q-btn flat label="Guardar" color="primary" @click="guardar" :disable="!nombreCompleto" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
