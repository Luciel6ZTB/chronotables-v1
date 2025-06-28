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
        <q-select
          v-model="selectedGrade"
          :options="grades"
          outlined
          dense
          class="subjects-filter-select"
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
      <!--lista de entidad-->
      <div class="teachers-list-grid q-pa-md">
        <div v-for="n in 10" :key="n" class="teacher-card">
          {{ 'Materia ' + n }}
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
  min-height: 360px;
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
</style>
