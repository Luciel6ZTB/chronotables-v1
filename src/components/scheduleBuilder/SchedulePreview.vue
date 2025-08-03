<template>
  <q-card flat bordered class="full-height">
    <q-card-section>
      <div class="text-h6 q-mb-md text-primary">
        <q-icon name="preview" class="q-mr-sm" />
        Vista Previa - Turno {{ currentTurn === 'matutino' ? 'Matutino' : 'Vespertino' }}
      </div>

      <q-table
        :rows="schedulePreview"
        :columns="scheduleColumns"
        row-key="id"
        flat
        bordered
        hide-pagination
        :pagination="{ rowsPerPage: 0 }"
      >
        <!-- Número de bloque o R -->
        <template v-slot:body-cell-numero="props">
          <q-td :props="props">
            <q-badge
              :label="props.row.numero"
              :color="props.row.tipo === 'clase' ? 'primary' : 'orange'"
            />
          </q-td>
        </template>

        <!-- Campo editable de horario -->
        <template v-slot:body-cell-horario="props">
          <q-td :props="props">
            <q-input
              v-model="props.row.horario"
              dense
              outlined
              :placeholder="props.row.tipo === 'clase' ? '7:00 - 7:50' : '10:00 - 10:15'"
              @update:model-value="handleScheduleUpdate"
            >
              <template v-slot:prepend>
                <q-icon
                  :name="props.row.tipo === 'clase' ? 'schedule' : 'free_breakfast'"
                  size="xs"
                />
              </template>
            </q-input>
          </q-td>
        </template>

        <!-- Espacio de clase o receso -->
        <template v-slot:body-cell-espacio="props">
          <q-td :props="props">
            <div
              :class="
                props.row.tipo === 'clase' ? 'bg-blue-1 text-primary' : 'bg-orange-1 text-secondary'
              "
              class="q-pa-sm rounded-borders text-center"
            >
              <q-icon
                :name="props.row.tipo === 'clase' ? 'school' : 'free_breakfast'"
                class="q-mr-xs"
              />
              {{ props.row.tipo === 'clase' ? `Clase ${props.row.numero}` : props.row.nombre }}
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { watch } from 'vue'
import { useScheduleBuilder } from './useScheduleBuilder'

const $q = useQuasar()

const { currentTurn, schedulePreview, scheduleColumns, updateScheduleData, forceUpdate } =
  useScheduleBuilder()

watch(currentTurn, () => {
  forceUpdate()
})

const handleScheduleUpdate = () => {
  try {
    updateScheduleData()
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Error actualizando horarios',
      timeout: 2000,
    })
  }
}
</script>

<style scoped>
.full-height {
  height: calc(100vh - 180px);
}
</style>
