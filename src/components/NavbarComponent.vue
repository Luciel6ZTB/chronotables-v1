<template>
  <q-header elevated class="bg-primary">
    <q-toolbar>
      <q-tabs
        v-model="activeTab"
        class="text-white"
        @update:model-value="onTabChange"
        indicator-color="transparent"
        align="left"
        dense
      >
        <q-tab name="inicio" label="Inicio" />
        <q-tab name="configuracion" label="Configuración" />
        <q-tab name="visualizacion" label="Visualización" />
        <q-tab name="exportar" label="Exportar" />
      </q-tabs>
      <q-space />
    </q-toolbar>

    <!-- Sub-navbar solo en Configuración -->
    <div v-if="activeTab === 'configuracion'" class="navbar-container">
      <q-tabs
        v-model="activeConfigTab"
        align="left"
        class="navbar-tabs"
        dense
        indicator-color="transparent"
        @update:model-value="goConfigSubtab"
      >
        <q-tab name="materias" label="Materias" />
        <q-tab name="docentes" label="Docentes" />
        <q-tab name="grupos" label="Grupos" />
        <q-tab name="aulas" label="Aulas" />
      </q-tabs>
    </div>

    <!-- Sub-navbar solo en Visualización -->
    <div v-if="activeTab === 'visualizacion'" class="navbar-container">
      <q-tabs
        v-model="activeVisualTab"
        align="left"
        class="navbar-tabs"
        dense
        indicator-color="transparent"
        @update:model-value="goVisualSubtab"
      >
        <q-tab name="general" label="General" />
        <q-tab name="individual" label="Individual" />
      </q-tabs>
    </div>
  </q-header>
</template>

<script>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'NavBarComponent',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const activeTab = ref('inicio')
    const activeConfigTab = ref('materias')
    const activeVisualTab = ref('general')

    // Sincroniza tab principal y subtab con la ruta
    watch(
      () => route.fullPath,
      (newPath) => {
        if (newPath === '/') activeTab.value = 'inicio'
        else if (newPath.startsWith('/visualizacion')) {
          activeTab.value = 'visualizacion'
          // Detecta subtab de visualización
          if (newPath.includes('/general')) activeVisualTab.value = 'general'
          else if (newPath.includes('/individual')) activeVisualTab.value = 'individual'
        }
        //configuracion e hijos
        else if (newPath.startsWith('/config')) {
          activeTab.value = 'configuracion'
          if (newPath.includes('/materias')) activeConfigTab.value = 'materias'
          else if (newPath.includes('/docentes')) activeConfigTab.value = 'docentes'
          else if (newPath.includes('/grupos')) activeConfigTab.value = 'grupos'
          else if (newPath.includes('/aulas')) activeConfigTab.value = 'aulas'
        }
        //exportar activo
        else if (newPath.startsWith('/exportar')) {
          activeTab.value = 'exportar'
        }
      },
      { immediate: true },
    )

    const onTabChange = (tab) => {
      if (tab === 'inicio') router.push({ name: 'inicio' })
      else if (tab === 'configuracion') router.push({ name: 'config-materias' })
      else if (tab === 'visualizacion') router.push({ name: 'ver-general' })
      else if (tab === 'exportar') router.push({ name: 'exportar' })
    }

    const goConfigSubtab = (subtab) => {
      router.push({ name: `config-${subtab}` })
    }

    const goVisualSubtab = (subtab) => {
      router.push({ name: `ver-${subtab}` })
    }

    return {
      activeTab,
      activeConfigTab,
      activeVisualTab,
      onTabChange,
      goConfigSubtab,
      goVisualSubtab,
    }
  },
}
</script>

<style lang="scss" scoped>
.q-header {
  .q-tabs {
    .q-tab {
      font-weight: bold;
      &.q-tab--active {
        background: $negative;
        border-radius: 6px 6px 0 0;
        color: white !important;
      }
    }
  }
}

.navbar-container {
  background: white !important;
  margin-top: 0;
  padding: 0 8px;

  .navbar-tabs {
    background: white !important;

    .q-tab {
      text-transform: none !important;
      color: #888 !important;
      background: white !important;
      transition: color 0.2s;

      &.q-tab--active {
        color: $accent !important;
        background: white !important;
      }
    }
  }
}
</style>
