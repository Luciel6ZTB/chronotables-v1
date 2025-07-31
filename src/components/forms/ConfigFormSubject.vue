<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  titulo: String,
  color: String,
  materia: Object,
})

const emit = defineEmits(['update:modelValue', 'guardar'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const tipoOptions = [
  { label: 'Tronco común', value: 'tronco_comun' },
  { label: 'Módulo profesional', value: 'modulo_profesional' },
]
const semestreOptions = Array.from({ length: 6 }, (_, i) => i + 1)
const especialidades = [
  'Mantenimiento Automotriz',
  'Mantenimiento Industrial',
  'Mantenimiento a Instalaciones Petroleras',
  'Diseño Grafico Digital',
  'Electrónica',
  'Inteligencia Artificial',
  'Ciberseguridad',
  'Semiconductores y Microelectrónica',
  'Logística',
  'Programación',
]
const localMateria = ref({
  abreviatura: '',
  nombre: '',
  semestre: null,
  tipo: '',
  horas_semanales: 0,
  submodulos: [],
  especialidad: '',
})
const cantidadSubmodulos = ref(0)

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.materia) {
        localMateria.value = { ...props.materia }
        cantidadSubmodulos.value = props.materia.submodulos?.length || 0
      } else {
        localMateria.value = {
          abreviatura: '',
          nombre: '',
          semestre: null,
          tipo: '',
          horas_semanales: 0,
          submodulos: [],
          especialidad: '',
        }
        cantidadSubmodulos.value = 0
      }
    }
  },
  { immediate: true },
)

watch(cantidadSubmodulos, (newVal) => {
  if (localMateria.value.tipo === 'modulo_profesional') {
    const current = localMateria.value.submodulos.length
    if (newVal > current) {
      for (let i = current; i < newVal; i++) {
        localMateria.value.submodulos.push({ nombre: '', horas: 0 })
      }
    } else if (newVal < current) {
      localMateria.value.submodulos.splice(newVal)
    }
  }
})

function cerrar() {
  emit('update:modelValue', false)
}
function guardar() {
  const payload = { ...localMateria.value }

  if (payload.tipo === 'tronco_comun') {
    delete payload.submodulos
    delete payload.especialidad
  } else if (payload.tipo === 'modulo_profesional') {
    // Asegura que submodulos es un arreglo plano
    payload.submodulos = (payload.submodulos || []).map((sub) => ({
      nombre: sub.nombre,
      horas: Number(sub.horas),
    }))
  }

  console.log('[Materia creada]', payload)
  emit('guardar', payload)
  cerrar()
}
</script>
<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="q-pa-md" style="min-width: 500px; max-width: 700px">
      <q-card-section class="text-h6 text-beige">{{ titulo }}</q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input
          v-model="localMateria.abreviatura"
          label="Abreviatura / Código"
          maxlength="5"
          outlined
          dense
          required
        />

        <q-input
          v-model="localMateria.nombre"
          label="Nombre de la materia"
          maxlength="50"
          outlined
          dense
          required
        />

        <q-select
          v-model="localMateria.semestre"
          :options="semestreOptions"
          label="Semestre"
          outlined
          dense
          emit-value
          map-options
        />

        <q-select
          v-model="localMateria.tipo"
          :options="tipoOptions"
          label="Tipo"
          outlined
          dense
          emit-value
          map-options
        />

        <q-input
          v-model.number="localMateria.horas_semanales"
          type="number"
          label="Horas semanales"
          outlined
          dense
          min="0"
          required
        />

        <q-select
          v-if="localMateria.tipo === 'modulo_profesional'"
          v-model="localMateria.especialidad"
          :options="especialidades"
          label="Especialidad"
          outlined
          dense
          emit-value
          map-options
        />

        <template v-if="localMateria.tipo === 'modulo_profesional'">
          <q-input
            v-model.number="cantidadSubmodulos"
            type="number"
            label="Cantidad de submódulos"
            min="1"
            outlined
            dense
          />

          <div
            v-for="(sub, index) in localMateria.submodulos"
            :key="index"
            class="q-gutter-sm q-mt-sm"
          >
            <q-input
              v-model="sub.nombre"
              :label="`Submódulo ${index + 1} - Nombre`"
              maxlength="60"
              outlined
              dense
              required
            />
            <q-input
              v-model.number="sub.horas"
              type="number"
              :label="`Submódulo ${index + 1} - Horas`"
              min="1"
              outlined
              dense
              required
            />
          </div>
        </template>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="negative" @click="cerrar" />
        <q-btn flat label="Guardar" color="primary" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.text-beige {
  color: #bfa97a;
}
</style>
