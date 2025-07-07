<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  titulo: String,
  color: String,
  materia: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'guardar'])

const nombre = ref('')
const clave = ref('')
const horas_semana = ref('')
const semestre = ref('')

// Cuando materia cambie, actualiza campos (para editar)
watch(
  () => props.materia,
  (nueva) => {
    if (nueva) {
      nombre.value = nueva.nombre || ''
      clave.value = nueva.clave || ''
      horas_semana.value = nueva.horas_semana || ''
      semestre.value = nueva.semestre || ''
    } else {
      nombre.value = ''
      clave.value = ''
      horas_semana.value = ''
      semestre.value = ''
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
    id: props.materia?.id, // Si es edición, pasa el id
    horas_semana: horas_semana.value,
    semestre: semestre.value,
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
        <q-input v-model="horas_semana" label="Horas a la semana" class="q-mt-md" />
        <q-input v-model="semestre" label="Semestre" class="q-mt-md" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="closeDialog" />
        <q-btn flat label="Guardar" color="primary" @click="guardar" :disable="!nombre || !clave" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
