<!-- src/pages/VerHorarioIndividual.vue -->
<template>
  <div class="q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 q-mr-md">Docente: Yves Ananías Flores Reyes</div>
      <div class="row q-gutter-sm">
        <q-input
          v-model="docente"
          outlined
          dense
          class="q-mr-sm"
          label="Buscar docente"
          style="max-width: 260px"
        />
        <q-btn label="Ver resumen" color="yellow-8" class="q-ml-sm" />
      </div>
    </div>
    <TablaHorarioIndividual />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TablaHorarioIndividual from 'components/horarios/TablaHorarioIndividual.vue'
const docente = ref('')
</script>
