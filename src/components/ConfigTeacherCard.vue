<script setup>
import { ref, computed, watch } from 'vue'
const props = defineProps({
  docentes: Array,
  selectedDocente: Object,
})
const emit = defineEmits(['select-docente'])

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 8

// Docentes filtrados por búsqueda
const filteredDocentes = computed(() => {
  if (!searchQuery.value) return props.docentes

  const query = searchQuery.value.toLowerCase()
  return props.docentes.filter(
    (docente) =>
      docente.nombre_completo.toLowerCase().includes(query) ||
      (docente.nombre_corto && docente.nombre_corto.toLowerCase().includes(query)),
  )
})

const paginatedDocentes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredDocentes.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredDocentes.value.length / itemsPerPage)
})

watch(searchQuery, () => {
  currentPage.value = 1
})
</script>
<template>
  <q-card
    class="config-subjects-card q-pa-lg full-height-card"
    @click="emit('select-docente', null)"
  >
    <h2 class="text-h4 text-weight-bold q-mb-sm q-ma-none">Lista de docentes</h2>
    <p class="text-body1 q-mb-lg">Maneja los docentes dentro de tu institución.</p>

    <div class="subjects-container q-mb-xl">
      <div class="subjects-toolbar-row q-pb-md">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="6"
          direction-links
          flat
          color="grey"
          active-color="primary"
          class="teachers-pagination"
          :disable="filteredDocentes.length <= itemsPerPage"
        />
        <!-- Filtro a la derecha-->
        <q-input
          v-model="searchQuery"
          outlined
          dense
          placeholder="Buscar docente…"
          class="subjects-filter-search q-mr-lg"
          style="min-width: 250px"
          standout
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <!--lista de entidad-->
      <div class="teachers-list-grid q-pa-md">
        <div
          v-for="docente in paginatedDocentes"
          :key="docente.id"
          class="teacher-card"
          :class="{ selected: selectedDocente && selectedDocente.id === docente.id }"
          @click.stop="
            emit(
              'select-docente',
              selectedDocente && selectedDocente.id === docente.id ? null : docente,
            )
          "
          style="cursor: pointer"
        >
          <div class="text-subtitle1">{{ docente.nombre_corto }}</div>
        </div>
        <div
          v-if="filteredDocentes.length === 0"
          style="min-width: 650px"
          class="text-center q-pa-md text-grey"
        >
          No se encontraron docentes
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
export default {
  name: 'ConfigTeacherCard',
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
.selected {
  background: #e4dfac;
  border: 2px solid #d5cb5c;
}
.teacher-card.selected {
  background: #f4eeb1;
  border-color: #f4e437;
}
</style>
