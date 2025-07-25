<script setup>
import { ref } from 'vue'
import TablaHorarioGeneral from 'components/horarios/TablaHorarioGeneral.vue'
import { gruposMock } from 'src/mockups/index'
const gruposDisponibles = gruposMock
const grupoSeleccionado = ref(null)
</script>
<template>
  <div class="q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Horario General</div>
      <div class="row q-gutter-sm">
        <q-select
          v-model="grupoSeleccionado"
          :options="gruposDisponibles"
          option-label="nombre"
          option-value="id"
          :emit-value="false"
          map-options
          dense
          outlined
          class="q-mr-sm"
          label="Grupo"
          style="min-width: 120px"
        />
      </div>
    </div>

    <TablaHorarioGeneral v-if="grupoSeleccionado" :grupo="grupoSeleccionado" />
    <div v-else class="q-mt-xl text-center text-subtitle1 text-grey-7">
      Elige un grupo para visualizar su horario.
    </div>
  </div>
</template>

<style>
.q-field__control {
  background-color: #fff !important;
  border-radius: inherit;
}
</style>
