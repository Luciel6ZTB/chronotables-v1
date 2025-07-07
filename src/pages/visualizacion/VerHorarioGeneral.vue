<!-- src/pages/VerHorarioGeneral.vue -->
<template>
  <div class="q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Horario General</div>
      <div class="row q-gutter-sm">
        <q-select
          v-model="semestre"
          :options="['1°', '2°', '3°', '4°', '5°', '6°']"
          dense
          outlined
          class="q-mr-sm filtro-select"
          label="Semestre"
          style="min-width: 120px"
        />
        <q-select
          v-model="turno"
          :options="['Matutino', 'Vespertino']"
          dense
          outlined
          class="q-mr-sm filtro-select"
          label="Turno"
          style="min-width: 140px"
        />
      </div>
    </div>
    <TablaHorarioGeneral />
  </div>
</template>

<style>
.q-field__control {
  background-color: #fff !important;
  border-radius: inherit;
}
</style>

<script setup>
import { ref } from 'vue'
import TablaHorarioGeneral from 'components/horarios/TablaHorarioGeneral.vue'
const semestre = ref('2°')
const turno = ref('Matutino')
</script>
