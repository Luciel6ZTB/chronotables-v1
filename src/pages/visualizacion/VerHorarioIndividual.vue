<script setup>
import { ref } from 'vue'
import TablaHorarioIndividual from 'components/horarios/TablaHorarioIndividual.vue'

const docenteActivo = ref('')
const search = ref('')
</script>
<template>
  <div class="q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 q-mr-md">
        Horario<span v-if="docenteActivo">: {{ docenteActivo }}</span>
      </div>
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
      </div>
    </div>
    <TablaHorarioIndividual :search="search" @docenteDetectado="(val) => (docenteActivo = val)" />
  </div>
</template>
