<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  grupos: Array,
  selectedGrupo: Object,
})
const emit = defineEmits(['select-grupo'])

const selectedShift = ref('Todos')
const selectedGrade = ref('Todos')

const currentPage = ref(1)
const itemsPerPage = 8

const grades = ['Todos', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto']
const gradeToNumber = {
  Primero: 1,
  Segundo: 2,
  Tercero: 3,
  Cuarto: 4,
  Quinto: 5,
  Sexto: 6,
}

const shifts = ['Todos', 'Matutino', 'Vespertino']

const filteredGrupos = computed(() => {
  return props.grupos.filter((grupo) => {
    const matchGrade =
      selectedGrade.value === 'Todos' || grupo.semestre === gradeToNumber[selectedGrade.value]

    const matchShift = selectedShift.value === 'Todos' || grupo.turno === selectedShift.value

    return matchGrade && matchShift
  })
})

const paginatedGrupos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredGrupos.value.slice(start, end)
})

// Total de páginas
const totalPages = computed(() => {
  return Math.ceil(filteredGrupos.value.length / itemsPerPage)
})
</script>
<template>
  <q-card class="config-subjects-card q-pa-lg full-height-card" @click="emit('select-grupo', null)">
    <h2 class="text-h4 text-weight-bold q-mb-sm q-ma-none">Lista de grupos</h2>
    <p class="text-body1 q-mb-lg">Maneja las materias dentro de tu institución.</p>

    <div class="subjects-container q-mb-xl">
      <div class="subjects-toolbar-row">
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
          :disable="filteredGrupos.length <= itemsPerPage"
          style="min-width: 160px"
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
            label="Filtrar por semestre"
            style="min-width: 160px"
          />
          <q-select
            v-model="selectedShift"
            :options="shifts"
            outlined
            dense
            class="subjects-filter-select q-mr-lg"
            dropdown-icon="arrow_drop_down"
            label="Filtrar por turno"
          />
        </div>
      </div>
      <!--lista de entidad-->
      <div class="teachers-list-grid q-pa-md" @click="emit('select-grupo', null)">
        <div
          v-for="grupo in paginatedGrupos"
          :key="grupo.id"
          class="teacher-card"
          :class="{ selected: selectedGrupo && selectedGrupo.id === grupo.id }"
          @click.stop="
            emit('select-grupo', selectedGrupo && selectedGrupo.id === grupo.id ? null : grupo)
          "
          style="cursor: pointer"
        >
          <div class="text-subtitle1">{{ grupo.nomenclatura }}</div>

          <!-- Mostrar "Dual" solo si la carrera lo es -->
          <div v-if="grupo.carrera === 'Dual'" class="text-subtitle1">Dual</div>
        </div>
        <div
          v-if="filteredGrupos.length === 0"
          class="text-center q-pa-md text-grey"
          style="min-width: 650px"
        >
          No se encontraron materias para este semestre
        </div>
      </div>
    </div>
  </q-card>
</template>

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
