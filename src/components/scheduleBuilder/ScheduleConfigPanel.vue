<template>
  <q-card flat bordered class="q-ma-md">
    <q-card-section>
      <div class="text-h6 q-mb-md text-primary">
        <q-icon name="settings" class="q-mr-sm" />
        Configuración de Turnos
      </div>

      <!-- Selector de Turno -->
      <q-select
        v-model="currentTurn"
        :options="turnOptions"
        label="Turno actual"
        emit-value
        map-options
        class="q-mb-md"
        outlined
      >
        <template v-slot:prepend>
          <q-icon name="wb_sunny" v-if="currentTurn === 'matutino'" />
          <q-icon name="nights_stay" v-else />
        </template>
      </q-select>

      <!-- Input de Bloques -->
      <q-input
        :model-value="config[currentTurn].bloques"
        type="number"
        label="Cantidad de bloques de clase"
        min="1"
        max="12"
        class="q-mb-md"
        outlined
        @update:model-value="onBloquesChange"
      >
        <template v-slot:prepend>
          <q-icon name="view_module" />
        </template>
      </q-input>

      <!-- Configuración de Recesos -->
      <div class="q-mb-md">
        <div class="text-subtitle1 q-mb-sm text-secondary">
          <q-icon name="free_breakfast" class="q-mr-xs" />
          Configuración de Recesos
        </div>

        <!-- Cantidad de Recesos -->
        <q-input
          :model-value="config[currentTurn].recesos.cantidad"
          type="number"
          label="Cantidad de recesos"
          min="0"
          max="5"
          class="q-mb-sm"
          outlined
          dense
          @update:model-value="onRecesosCantidadChange"
        />

        <!-- Selectores de Posición de Recesos -->
        <div
          v-for="(receso, index) in config[currentTurn].recesos.posiciones"
          :key="index"
          class="q-mb-sm"
        >
          <q-select
            v-model.number="config[currentTurn].recesos.posiciones[index]"
            :options="recesoOptions"
            :label="`Receso ${index + 1} después del bloque:`"
            emit-value
            map-options
            outlined
            dense
            @update:model-value="onRecesoPosChange"
          />
        </div>
      </div>

      <!-- Info resumen -->
      <q-card flat class="bg-grey-1 q-pa-sm q-mb-md">
        <div class="text-caption text-grey-7">
          <strong>Configuración del Algoritmo:</strong>
        </div>
        <div class="text-caption">
          • Matutino: {{ config.matutino.bloques }} bloques<br />
          • Vespertino: {{ config.vespertino.bloques }} bloques<br />
          • Inicio vespertino: bloque {{ Number(config.matutino.bloques) + 1 }}<br />
          • Fin matutino: bloque {{ config.matutino.bloques }}
        </div>
      </q-card>

      <!-- Botón de Guardar -->
      <div class="q-gutter-sm">
        <q-btn
          color="primary"
          icon="save"
          label="Guardar Configuración"
          @click="saveConfig"
          class="full-width"
          :loading="saving"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useScheduleBuilder } from '../scheduleBuilder/useScheduleBuilder'

const emit = defineEmits(['configuration-saved'])
const saving = ref(false)

const {
  currentTurn,
  config,
  turnOptions,
  recesoOptions,
  updateBlocks,
  updateRecesos,
  updateScheduleDisplay,
  saveConfiguration,
  forceUpdate,
} = useScheduleBuilder(emit)

// Reacción a cambios de turno
watch(currentTurn, () => {
  updateScheduleDisplay()
})

const saveConfig = async () => {
  saving.value = true
  try {
    const success = await saveConfiguration()
    if (success) {
      console.log('Configuración guardada correctamente')
      forceUpdate()
    }
  } finally {
    saving.value = false
  }
}

// Handlers para forzar reactividad
const onBloquesChange = (val) => {
  config.value[currentTurn.value].bloques = val
  config.value = { ...config.value } // Forzar reactividad completa
  updateBlocks()
}

const onRecesosCantidadChange = (val) => {
  config.value[currentTurn.value].recesos.cantidad = val
  config.value = { ...config.value }
  updateRecesos()
}

const onRecesoPosChange = () => {
  config.value = { ...config.value }
  updateScheduleDisplay()
}
</script>
