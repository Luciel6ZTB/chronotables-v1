<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ScheduleBuilderDialog from './scheduleBuilder/SchedulerBuilderDialog.vue'
import { useGeneradorHorarios } from 'src/composables/useGeneradorHorarios'
import { useUserStore } from 'src/stores/userStore'

const $q = useQuasar()
const router = useRouter()
const builderDialog = ref(false)
const mostrarBotonGenerar = ref(false)
const userStore = useUserStore()

const { generar, generando, exito } = useGeneradorHorarios()

const verificarConfig = async () => {
  try {
    mostrarBotonGenerar.value = await window.electronAPI.invoke('verificar-config-existe')
  } catch (err) {
    console.error('Error al verificar config.json:', err)
  }
}

const generarHorario = async () => {
  await generar()
  if (exito.value) {
    router.push('/visualizacion')
  } else {
    $q.notify({
      type: 'negative',
      message: 'Error al generar los horarios',
      icon: 'error',
    })
  }
}

const openBuilder = () => {
  try {
    builderDialog.value = true
  } catch (error) {
    console.error('Error al abrir constructor:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo abrir el constructor de horarios',
      icon: 'error',
    })
  }
}

onMounted(verificarConfig)
</script>
<template>
  <q-card class="chronotables-card q-pa-lg text-center full-height-card">
    <q-img class="logo-img" src="~assets/logos/logo1.png" style="height: 150px" />

    <h2 class="text-h4 text-weight-bold q-mt-md q-mb-lg">CHRONOTABLES</h2>

    <div class="chronotables-buttons">
      <q-btn
        v-if="mostrarBotonGenerar && userStore.isAdmin"
        class="chronotables-btn q-mb-sm"
        :loading="generando"
        color="primary"
        size="lg"
        label="Generar horario"
        no-caps
        @click="generarHorario"
      >
        <template v-slot:loading>
          <q-spinner color="white" />
        </template>
      </q-btn>
      <q-btn
        class="chronotables-btn q-mb-sm"
        color="secondary"
        size="lg"
        label="Construir horario"
        no-caps
        @click="openBuilder"
      />
    </div>
  </q-card>
  <ScheduleBuilderDialog v-model="builderDialog" />
</template>

<style scoped>
.full-height-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chronotables-card {
  justify-content: center;
  align-items: center;
  text-align: center;
  display: flex;
  border-radius: 0 !important;
  box-shadow: none !important;
  background-color: transparent;
}

.chronotables-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 300px;
}

.chronotables-btn {
  width: 100%;
  max-width: 280px;
  min-height: 48px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.logo-img {
  width: 100% !important;
  max-width: 230px;
  height: auto !important;
  object-fit: contain !important;
  overflow: visible !important;
  margin: 1.5rem auto 1rem auto;
  display: block;
}
</style>
