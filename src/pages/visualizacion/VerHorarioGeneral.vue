<script setup>
import { ref } from 'vue'
import TablaHorarioGeneral from 'components/horarios/TablaHorarioGeneral.vue'
const grupoSeleccionado = ref('201A')

const gruposDisponibles = ['201A', '202B', '203C', '204D', '402B']
</script>
<template>
  <div class="q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Horario General</div>
      <div class="row q-gutter-sm">
        <q-select
          v-model="grupoSeleccionado"
          :options="gruposDisponibles"
          dense
          outlined
          class="q-mr-sm filtro-select"
          label="Grupo"
          style="min-width: 120px"
        />
      </div>
    </div>
    <TablaHorarioGeneral :grupo="grupoSeleccionado" />
  </div>
</template>

<style>
.q-field__control {
  background-color: #fff !important;
  border-radius: inherit;
}
</style>
