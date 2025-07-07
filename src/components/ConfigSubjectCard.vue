<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  materias: Array,
  selectedMateria: Object,
})
const emit = defineEmits(['select-materia'])

const selectedGrade = ref('Todos')
const currentPage = ref(1)
const itemsPerPage = 8

// Opciones del filtro
const grades = ['Todos', 'Primer', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto']

// Materias filtradas por semestre
const filteredMaterias = computed(() => {
  if (selectedGrade.value === 'Todos') return props.materias
  return props.materias.filter((materia) => materia.semestre === selectedGrade.value)
})

// Materias paginadas
const paginatedMaterias = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredMaterias.value.slice(start, end)
})

// Total de páginas
const totalPages = computed(() => {
  return Math.ceil(filteredMaterias.value.length / itemsPerPage)
})
</script>

<template>
  <q-card
    class="config-subjects-card q-pa-lg full-height-card"
    @click="emit('select-materia', null)"
  >
    <h2 class="text-h4 text-weight-bold q-mb-sm q-ma-none">Lista de materias</h2>
    <p class="text-body1 q-mb-lg">Maneja las materias dentro de tu institución.</p>

    <div class="subjects-container q-mb-xl">
      <div class="subjects-toolbar-row q-pb-md">
        <!-- Paginación a la izquierda -->
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="6"
          direction-links
          flat
          color="grey"
          active-color="primary"
          class="subjects-pagination"
          :disable="filteredMaterias.length <= itemsPerPage"
        />
        <!-- Filtro por semestre -->
        <q-select
          v-model="selectedGrade"
          :options="grades"
          outlined
          dense
          class="subjects-filter-select"
          dropdown-icon="arrow_drop_down"
          label="Filtrar por semestre"
        />
      </div>
      <!--lista de entidad-->
      <div class="teachers-list-grid q-pa-md">
        <div
          v-for="materia in paginatedMaterias"
          :key="materia.id"
          class="teacher-card"
          :class="{ selected: selectedMateria && selectedMateria.id === materia.id }"
          @click.stop="
            emit(
              'select-materia',
              selectedMateria && selectedMateria.id === materia.id ? null : materia,
            )
          "
          style="cursor: pointer"
        >
          <div class="text-subtitle1">{{ materia.clave }}</div>
        </div>
        <div
          v-if="filteredMaterias.length === 0"
          class="text-center q-pa-md text-grey"
          style="min-width: 650px"
        >
          No se encontraron materias para este semestre
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
export default {
  name: 'ConfigSubjectCard',
}
</script>

<style scoped>
.full-height-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 590px;
  max-height: 600px !important;
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
  min-width: 200px;
  font-style: italic;
  margin-right: 20px;
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
.selected {
  background: #e0e0e0;
  border: 2px solid #1976d2;
}
.teacher-card.selected {
  background: #f4eeb1;
  border-color: #f4e437;
}
</style>
