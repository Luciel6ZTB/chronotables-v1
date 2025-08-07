<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  titulo: String,
  color: String,
  aula: Object,
})

const emit = defineEmits(['update:modelValue', 'guardar'])

const localAula = ref({
  nombre: '',
  clave: '',
  tipo: '',
})

const opcionesTipo = [
  { label: 'Aula', value: 'aula' },
  { label: 'Laboratorio', value: 'laboratorio' },
  { label: 'Taller', value: 'taller' },
]

watch(
  () => props.aula,
  (nueva) => {
    if (nueva) {
      localAula.value = {
        id: nueva.id || null,
        nombre: nueva.nombre || '',
        clave: nueva.clave || '',
        tipo: nueva.tipo || '',
      }
    } else {
      localAula.value = {
        nombre: '',
        clave: '',
        tipo: '',
      }
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
  emit('guardar', { ...localAula.value })
  console.log('Guardado:', localAula.value)
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
        <q-input v-model="localAula.nombre" label="Nombre del aula" />
        <q-input v-model="localAula.clave" label="Clave" class="q-mt-md" />
        <q-select
          v-model="localAula.tipo"
          :options="opcionesTipo"
          label="Tipo de aula"
          emit-value
          map-options
          class="q-mt-md"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="closeDialog" />
        <q-btn
          flat
          label="Guardar"
          color="primary"
          @click="guardar"
          :disable="!localAula.nombre || !localAula.clave || !localAula.tipo"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
