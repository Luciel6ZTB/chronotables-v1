<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { generateSchoolInfoPDF } from 'src/utils/pdfUtils.js'

const schoolStore = (() => {
  let initial = {
    institution: '',
    period: '',
    campus: '',
    semestre: 'Cuarto',
    grupo: '402B',
    turno: 'matutino',
  }
  try {
    const fromStorage = window.localStorage.getItem('school-info')
    if (fromStorage) initial = JSON.parse(fromStorage)
  } catch (e) {
    console.error('Error al cargar school-info de localStorage:', e)
  }
  const data = reactive({ ...initial })
  watch(
    data,
    (val) => {
      window.localStorage.setItem('school-info', JSON.stringify(val))
    },
    { deep: true },
  )
  return data
})()

// Usamos computed para asegurar que siempre tengamos todos los campos
const allSchoolData = computed(() => ({
  institution: schoolStore.institution,
  period: schoolStore.period,
  campus: schoolStore.campus,
  semestre: schoolStore.semestre,
  grupo: schoolStore.grupo,
  turno: schoolStore.turno,
}))

const isEditing = ref(false)
const localData = ref({ ...allSchoolData.value })

function startEdit() {
  localData.value = { ...allSchoolData.value }
  isEditing.value = true
}

function saveEdit() {
  Object.assign(schoolStore, localData.value)
  isEditing.value = false
}

function viewPDF() {
  // Pasamos los datos actuales (editados o no)
  const dataToExport = isEditing.value ? localData.value : allSchoolData.value
  console.log('Datos enviados a PDF:', dataToExport) // Para depuración
  generateSchoolInfoPDF(dataToExport)
}
</script>
<template>
  <q-card class="school-info-card q-pa-lg full-height-card">
    <h2 class="text-h4 text-weight-bold q-mb-md">Mi escuela</h2>

    <p class="text-body1 q-mb-lg">Maneja toda la información relacionada a tu institución.</p>

    <!-- School Details -->
    <div class="school-details q-mb-xl">
      <div class="row q-mb-md items-center">
        <div class="col-4 text-weight-bold text-h6">Institución:</div>
        <div class="col-8">
          <q-input
            v-model="localData.institution"
            dense
            autofocus
            :input-class="'text-h6'"
            outlined
            placeholder="Nombre de la institución"
            :disable="!isEditing"
          />
        </div>
      </div>
      <div class="row q-mb-md items-center">
        <div class="col-4 text-weight-bold text-h6">Período escolar:</div>
        <div class="col-8">
          <q-input
            v-model="localData.period"
            dense
            autofocus
            :input-class="'text-h6'"
            outlined
            placeholder="Período escolar"
            :disable="!isEditing"
          />
        </div>
      </div>
      <div class="row q-mb-md items-center">
        <div class="col-4 text-weight-bold text-h6">Plantel:</div>
        <div class="col-8">
          <q-input
            v-model="localData.campus"
            dense
            autofocus
            :input-class="'text-h6'"
            outlined
            placeholder="Plantel"
            :disable="!isEditing"
          />
        </div>
      </div>
    </div>

    <!-- Bottom Action Buttons -->
    <div class="buttons-container">
      <div class="row q-gutter-md justify-end">
        <q-btn
          color="amber-14"
          size="lg"
          label="VISUALIZAR DETALLES (PDF)"
          no-caps
          @click="viewPDF"
          :disable="isEditing"
        />
        <q-btn
          v-if="!isEditing"
          color="grey-7"
          size="lg"
          label="EDITAR DETALLES"
          no-caps
          @click="startEdit"
        />
        <q-btn v-else color="secondary" size="lg" label="GUARDAR" no-caps @click="saveEdit" />
        <q-btn
          v-if="isEditing"
          color="negative"
          size="lg"
          flat
          label="CANCELAR"
          no-caps
          @click="cancelEdit"
        />
      </div>
    </div>
  </q-card>
</template>

<style scoped>
.full-height-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.school-info-card {
  justify-content: space-between;
  border-radius: 0 !important;
  box-shadow: none !important;
  border: 2px solid black;
}

.school-details {
  flex: 1;
}

.buttons-container {
  margin-top: auto;
}
</style>
