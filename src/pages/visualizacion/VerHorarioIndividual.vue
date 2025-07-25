<script setup>
import { ref } from 'vue'
import TablaHorarioIndividual from 'components/horarios/TablaHorarioIndividual.vue'
import { docentesMock } from 'src/mockups/index'

const docentesDisponibles = docentesMock
const docenteSeleccionado = ref(null)
</script>

<template>
  <div class="q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 q-mr-md">
        Horario
        <span v-if="docenteSeleccionado">: {{ docenteSeleccionado.nombre_completo }}</span>
      </div>
      <div class="row q-gutter-lg">
        <q-select
          v-model="docenteSeleccionado"
          :options="docentesDisponibles"
          option-label="nombre_completo"
          outlined
          dense
          label="Docente"
          class="q-mr-md"
          style="min-width: 120px"
        />
      </div>
    </div>

    <TablaHorarioIndividual v-if="docenteSeleccionado" :docente="docenteSeleccionado" />
    <div v-else>
      <q-banner class="bg-grey-3 text-grey-9 q-mb-md">
        Selecciona un docente para ver su horario.
      </q-banner>
    </div>
  </div>
</template>
