<template>
  <q-card class="config-subjects-card q-pa-lg full-height-card">
    <h2 class="text-h4 text-weight-bold q-mb-sm q-ma-none">Lista de docentes</h2>
    <p class="text-body1 q-mb-lg">Maneja los docentes dentro de tu institución.</p>

    <div class="subjects-container q-mb-xl">
      <div class="subjects-toolbar-row q-pb-md">
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
        <!-- Filtro a la derecha-->
        <q-input
          v-model="search"
          outlined
          dense
          placeholder="Buscar docente…"
          class="subjects-filter-search q-mr-lg"
          rounded
        ></q-input>
      </div>
      <!--lista de entidad-->
      <div class="teachers-list-grid q-pa-md">
        <div v-for="n in 10" :key="n" class="teacher-card">
          {{ 'Mtro. Yves Ananías Flores Reyes' }}
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
}

.subjects-filter-select {
  min-width: 160px;
  font-style: italic;
}
.subjects-filter-search {
  min-width: 200px;
}

.teachers-list-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-height: 360px;
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
