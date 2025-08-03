<script setup>
import { ref, onMounted } from 'vue'
import TablaHorarioIndividual from 'components/horarios/TablaHorarioIndividual.vue'
import { useHorariosDocentes } from 'src/composables/useHorariosClases'

const { docentesDisponibles, cargarDocentesHorarios } = useHorariosDocentes()

const docenteSeleccionado = ref(null)

onMounted(() => {
  cargarDocentesHorarios()
})
</script>

<template>
  <div class="q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 q-mr-md">
        Horario
        <span v-if="docenteSeleccionado">: {{ docenteSeleccionado.nombre }}</span>
      </div>
      <div class="row q-gutter-lg">
        <q-select
          v-model="docenteSeleccionado"
          :options="docentesDisponibles"
          option-label="nombre"
          option-value="id"
          outlined
          dense
          label="Docente"
          class="q-mr-md"
          style="min-width: 150px"
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
