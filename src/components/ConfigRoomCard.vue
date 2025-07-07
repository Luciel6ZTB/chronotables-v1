<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  aulas: Array,
  selectedAula: Object,
})
const emit = defineEmits(['select-aula'])
const currentPage = ref(1)
const itemsPerPage = 8

const paginatedAulas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return props.aulas.slice(start, end)
})
const totalPages = computed(() => {
  return Math.ceil(props.aulas.length / itemsPerPage)
})
</script>
<template>
  <q-card class="config-subjects-card q-pa-lg full-height-card">
    <h2 class="text-h4 text-weight-bold q-mb-sm q-ma-none">Lista de Aulas</h2>
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
        />
      </div>
      <!--lista de entidad-->
      <div class="teachers-list-grid q-pa-md" @click="emit('select-aula', null)">
        <div
          v-for="aula in paginatedAulas"
          :key="aula.id"
          class="teacher-card"
          :class="{ selected: selectedAula && selectedAula.id === aula.id }"
          @click.stop="
            emit('select-aula', selectedAula && selectedAula.id === aula.id ? null : aula)
          "
          style="cursor: pointer"
        >
          <div class="text-subtitle1">{{ aula.clave }}</div>
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
