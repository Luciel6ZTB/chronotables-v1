<!-- src/pages/VerHorarioIndividual.vue -->
<template>
  <div class="q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 q-mr-md">Docente: Yves Ananías Flores Reyes</div>
      <div class="row q-gutter-sm">
        <q-input
          v-model="search"
          outlined
          dense
          placeholder="Buscar docente…"
          class="subjects-filter-search q-mr-lg"
          standout
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn label="Ver resumen" color="secondary" class="q-ml-sm" />
      </div>
    </div>
    <TablaHorarioIndividual />
  </div>
</template>

<script setup>
import TablaHorarioIndividual from 'components/horarios/TablaHorarioIndividual.vue'
</script>
