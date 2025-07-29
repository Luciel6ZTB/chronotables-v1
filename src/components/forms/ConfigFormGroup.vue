<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  titulo: String,
  color: String,
  grupo: Object,
})

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const emit = defineEmits(['update:modelValue', 'guardar'])

const localGrupo = ref({
  semestre: null,
  grupo: '',
  nomenclatura: '',
  especialidad: '',
  turno: '',
})

const turnoOptions = ['Matutino', 'Vespertino']
const semestreOptions = Array.from({ length: 6 }, (_, i) => i + 1)
const especialidades = [
  'Mantenimiento Automotriz',
  'Diseño Grafico Digital',
  'Inteligencia Artificial',
]

watch(
  () => props.grupo,
  (val) => {
    localGrupo.value = val
      ? { ...val }
      : {
          semestre: null,
          grupo: '',
          nomenclatura: '',
          especialidad: '',
          turno: '',
        }
  },
  { immediate: true },
)

function cerrar() {
  emit('update:modelValue', false)
}

function guardar() {
  if (validar()) {
    console.log('[Grupo creado]', localGrupo.value)
    emit('guardar', { ...localGrupo.value })
    cerrar()
  }
}

function validar() {
  const g = localGrupo.value
  return (
    g.semestre &&
    g.grupo.length === 1 &&
    g.nomenclatura.length <= 4 &&
    g.especialidad &&
    turnoOptions.includes(g.turno)
  )
}
</script>

<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 350px">
      <q-card-section :class="color">
        <div class="text-h6">{{ titulo }}</div>
      </q-card-section>
      <q-card-section class="q-gutter-sm">
        <q-select
          v-model="localGrupo.semestre"
          label="Semestre"
          :options="semestreOptions"
          outlined
          dense
          emit-value
          map-options
        />
        <q-input
          v-model="localGrupo.grupo"
          label="Grupo (una letra)"
          maxlength="1"
          outlined
          dense
        />
        <q-input
          v-model="localGrupo.nomenclatura"
          label="Nomenclatura (ej. 101A)"
          maxlength="4"
          outlined
          dense
        />
        <q-select
          v-model="localGrupo.especialidad"
          label="Especialidad"
          :options="especialidades"
          outlined
          dense
        />
        <q-select v-model="localGrupo.turno" label="Turno" :options="turnoOptions" outlined dense />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="negative" @click="cerrar" />
        <q-btn label="Guardar" color="primary" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
