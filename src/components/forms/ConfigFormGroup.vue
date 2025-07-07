<script setup>
import { ref, watch, computed } from 'vue'
//nombre, semestre, turno
const props = defineProps({
  modelValue: Boolean,
  titulo: String,
  color: String,
  grupo: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['update:modelValue', 'guardar'])

const nombre = ref('')
const semestre = ref('')
const turno = ref('')

watch(
  () => props.grupo,
  (nuevo) => {
    if (nuevo) {
      nombre.value = nuevo.nombre || ''
      semestre.value = nuevo.semestre || ''
      turno.value = nuevo.turno || ''
    } else {
      nombre.value = ''
      semestre.value = ''
      turno.value = ''
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
    id: props.grupo?.id,
    semestre: semestre.value,
    turno: turno.value,
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
        <q-input v-model="nombre" label="Nombre del grupo (ej. 201A)" />
        <q-input v-model="semestre" label="Semestre" />
        <q-input v-model="turno" label="Matutino / Vespertino" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="closeDialog" />
        <q-btn flat label="Guardar" color="primary" @click="guardar" :disable="!nombre" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
