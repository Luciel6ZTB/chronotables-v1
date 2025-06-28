<template>
  <div>
    <!-- Tabs para cambiar entre generales e individuales -->
    <div class="horarios-tabs-bar q-mb-md">
      <q-btn-toggle
        v-model="horarioTab"
        :options="[
          { label: 'Ver generales', value: 'generales', icon: 'favorite' },
          { label: 'Ver individuales', value: 'individuales', icon: 'favorite' },
        ]"
        color="yellow-8"
        unelevated
        toggle-color="yellow-8"
        text-color="black"
        spread
        class="q-mr-md"
        @update:model-value="goTab"
      />
      <q-space />
      <q-btn
        v-if="horarioTab === 'individuales'"
        label="Ver resumen"
        color="yellow-8"
        class="q-ml-md"
        @click="abrirResumen"
      />
    </div>

    <!-- Filtros dinámicos -->
    <div v-if="horarioTab === 'generales'" class="horarios-filtros q-mb-md">
      <q-select
        v-model="semestre"
        :options="semestres"
        label="Semestre"
        outlined
        dense
        class="q-mr-sm"
      />
      <q-select v-model="turno" :options="turnos" label="Turno" outlined dense />
    </div>
    <div v-else class="horarios-filtros q-mb-md">
      <q-input v-model="busquedaDocente" placeholder="Buscar docente" outlined dense clearable />
    </div>

    <router-view />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const horarioTab = ref(route.name?.includes('individuales') ? 'individuales' : 'generales')

const semestres = ['1°', '2°', '3°', '4°', '5°', '6°']
const turnos = ['Matutino', 'Vespertino']
const semestre = ref(semestres[0])
const turno = ref(turnos[0])
const busquedaDocente = ref('')

// Navega entre tabs
function goTab(tab) {
  router.push({ name: tab === 'generales' ? 'horarios-generales' : 'horarios-individuales' })
}

function abrirResumen() {
  // Abre modal o drawer con el resumen del docente actual
}
</script>

<style scoped>
.horarios-tabs-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 0 0 8px 8px;
  border: 1px solid #d0d0d0;
  padding: 8px 16px;
}
.horarios-filtros {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
