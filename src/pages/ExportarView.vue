<template>
  <div class="q-pa-md">
    <q-card class="export-card">
      <q-card-section>
        <div class="text-h5 text-bold">Exportar Horarios</div>
      </q-card-section>

      <q-separator color="grey-4" />

      <q-card-section class="q-gutter-md">
        <!-- Tipo de archivo -->
        <div>
          <div class="text-subtitle2 text-grey-8">Formato</div>
          <q-option-group v-model="formato" :options="formatoOptions" color="red-7" inline />
        </div>

        <!-- Tipo de horario -->
        <div>
          <div class="text-subtitle2 text-grey-8">Tipo de horario</div>
          <q-option-group
            v-model="tipoHorario"
            :options="tipoHorarioOptions"
            color="red-7"
            inline
          />
        </div>

        <!-- Selección de todos o algunos -->
        <div>
          <q-option-group
            v-model="modoSeleccion"
            :options="modoSeleccionOptions"
            color="red-7"
            inline
            :disable="!tipoHorario"
          />
        </div>

        <!-- Filtro dinámico -->
        <div v-if="modoSeleccion === 'algunos' && tipoHorario === 'individual'">
          <div class="text-subtitle2 text-grey-8">Seleccionar docente(s)</div>
          <q-select
            v-model="seleccion"
            :options="docentesOptions"
            label="Docente(s)"
            outlined
            dense
            color="red-7"
            use-chips
            multiple
            :hint="'Selecciona uno o varios docentes'"
            clearable
          />
        </div>

        <div v-if="modoSeleccion === 'algunos' && tipoHorario === 'general'">
          <div class="text-subtitle2 text-grey-8">Seleccionar grupo(s)</div>
          <q-select
            v-model="seleccion"
            :options="gruposOptions"
            label="Grupo(s)"
            outlined
            dense
            color="red-7"
            use-chips
            multiple
            :hint="'Selecciona uno o varios grupos'"
            clearable
          />
        </div>
      </q-card-section>

      <q-separator color="grey-4" />

      <q-card-actions align="right">
        <q-btn
          label="Exportar"
          icon="file_download"
          color="red-7"
          :disable="!formato || !tipoHorario || !seleccionValido"
          unelevated
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const formato = ref(null)
const tipoHorario = ref(null)
const modoSeleccion = ref('todos')
const seleccion = ref([])

const formatoOptions = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Excel', value: 'excel' },
]

const tipoHorarioOptions = [
  { label: 'Individual (docente)', value: 'individual' },
  { label: 'General (grupo)', value: 'general' },
]

const modoSeleccionOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Seleccionar algunos', value: 'algunos' },
]

const docentesOptions = ['Ana Gómez', 'Carlos Méndez', 'Laura Sánchez']

const gruposOptions = ['201A', '302B', '401C']

const seleccionValido = computed(() => {
  if (modoSeleccion.value === 'todos') return true
  return Array.isArray(seleccion.value) && seleccion.value.length > 0
})
</script>

<style scoped>
.export-card {
  max-width: 600px;
  margin: 0 auto;
  background-color: #f4f1ec; /* tono beige-gris */
  border: 1px solid #ccc;
  border-radius: 12px;
}
.text-h5 {
  color: #6c584c; /* tono café-gris */
}
</style>
