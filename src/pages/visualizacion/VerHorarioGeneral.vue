<script setup>
import { ref, onMounted, watch } from 'vue'
import { useHorariosGrupales } from 'src/composables/useHorariosClases'
import TablaHorarioGeneral from 'components/horarios/TablaHorarioGeneral.vue'

const grupoSeleccionado = ref(null)

const { gruposDisponibles, horarioGrupoSeleccionado, cargarGruposHorarios, cargarHorarioDeGrupo } =
  useHorariosGrupales()

onMounted(async () => {
  await cargarGruposHorarios()
})

watch(grupoSeleccionado, async (nuevoGrupoId) => {
  if (nuevoGrupoId) {
    await cargarHorarioDeGrupo(nuevoGrupoId)
  } else {
    horarioGrupoSeleccionado.value = null
  }
})
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
          emit-value
          map-options
          dense
          outlined
          class="q-mr-sm"
          label="Grupo"
          style="min-width: 120px"
        />
      </div>
    </div>

    <TablaHorarioGeneral
      v-if="grupoSeleccionado && horarioGrupoSeleccionado"
      :grupo="grupoSeleccionado"
      :horarioGrupal="horarioGrupoSeleccionado"
    />

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
