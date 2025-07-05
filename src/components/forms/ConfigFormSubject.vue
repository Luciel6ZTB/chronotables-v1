<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  titulo: String,
  color: String,
  materia: {
    // Puede ser null o un objeto para editar
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'guardar'])

// Estado local del formulario
const nombre = ref('')
const clave = ref('')
const descripcion = ref('')

// Cuando materia cambie, actualiza campos (para editar)
watch(
  () => props.materia,
  (nueva) => {
    if (nueva) {
      nombre.value = nueva.nombre || ''
      clave.value = nueva.clave || ''
      descripcion.value = nueva.descripcion || ''
    } else {
      nombre.value = ''
      clave.value = ''
      descripcion.value = ''
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
    nombre: nombre.value,
    clave: clave.value,
    descripcion: descripcion.value,
    id: props.materia?.id, // Si es edición, pasa el id
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
        <q-input v-model="nombre" label="Nombre de la materia" />
        <q-input v-model="clave" label="Clave interna" class="q-mt-md" />
        <q-input v-model="descripcion" label="Descripción" type="textarea" class="q-mt-md" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="closeDialog" />
        <q-btn flat label="Guardar" color="primary" @click="guardar" :disable="!nombre || !clave" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
