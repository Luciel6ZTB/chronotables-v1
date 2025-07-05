<script setup>
defineProps({
  grupos: Array,
  selectedGrupo: Object,
})
const emit = defineEmits(['select-grupo'])
</script>
<template>
  <q-card class="config-subjects-card q-pa-lg full-height-card">
    <h2 class="text-h4 text-weight-bold q-mb-sm q-ma-none">Lista de grupos</h2>
    <p class="text-body1 q-mb-lg">Maneja las materias dentro de tu institución.</p>

    <div class="subjects-container q-mb-xl">
      <div class="subjects-toolbar-row">
        <!-- Paginación a la izquierda -->
        <q-pagination
          v-model="current"
          max="5"
          direction-links
          flat
          color="grey"
          active-color="primary"
          class="subjects-pagination"
        />
        <!-- Filtro a la derecha -->
        <div class="row">
          <q-select
            v-model="selectedGrade"
            :options="grades"
            outlined
            dense
            class="subjects-filter-select q-mr-sm"
            dropdown-icon="arrow_drop_down"
          />
          <q-select
            v-model="selectedGrade"
            :options="grades"
            outlined
            dense
            class="subjects-filter-select"
            dropdown-icon="arrow_drop_down"
          />
        </div>
      </div>
      <!--lista de entidad-->
      <div class="teachers-list-grid q-pa-md" @click="emit('select-grupo', null)">
        <div
          v-for="grupo in grupos"
          :key="grupo.id"
          class="teacher-card"
          :class="{ selected: selectedGrupo && selectedGrupo.id === grupo.id }"
          @click.stop="
            emit('select-grupo', selectedGrupo && selectedGrupo.id === grupo.id ? null : grupo)
          "
          style="cursor: pointer"
        >
          <div class="text-subtitle1">{{ grupo.nombre }}</div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
export default {
  name: 'ConfigSubjectCard',
  data() {
    return {
      selectedGrade: 'Segundo',
      grades: ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto'],
      current: 1,
    }
  },
}
</script>

<style scoped>
.full-height-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.config-subjects-card {
  justify-content: space-between;
  border-radius: 0 !important;
  box-shadow: none !important;
  border-left: 2px solid black;
  background-color: #fff;
  min-height: 590px;
}

.subjects-container {
  flex: 1;
}

.subjects-toolbar-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.subjects-filter-select {
  min-width: 160px;
  font-style: italic;
}

.teachers-list-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  overflow-y: auto;
}
.teacher-card {
  border: 2px dashed #888;
  border-radius: 8px;
  background: #f8f8f8;
  padding: 16px 24px;
  font-size: 1rem;
  text-align: left;
}
.selected {
  background: #e0e0e0;
  border: 2px solid #1976d2;
}
.teacher-card.selected {
  background: #f4eeb1;
  border-color: #f4e437;
}
</style>
