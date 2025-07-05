<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  titulo: String,
  color: String,
  aula: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['update:modelValue', 'guardar'])

const nombre = ref('')
const abreviatura = ref('')

watch(
  () => props.aula,
  (nueva) => {
    if (nueva) {
      nombre.value = nueva.nombre || ''
      abreviatura.value = nueva.abreviatura || ''
    } else {
      nombre.value = ''
      abreviatura.value = ''
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
    abreviatura: abreviatura.value,
    id: props.aula?.id,
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
        <q-input v-model="nombre" label="Nombre del aula" />
        <q-input v-model="abreviatura" label="Abreviatura" class="q-mt-md" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="closeDialog" />
        <q-btn
          flat
          label="Guardar"
          color="primary"
          @click="guardar"
          :disable="!nombre || !abreviatura"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
