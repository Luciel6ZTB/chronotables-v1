<script setup>
import { ref } from 'vue'
import { schoolStore } from 'src/stores/useSchoolStore.js'
import { generateSchoolInfoPDF } from 'src/utils/pdfUtils.js'

const isEditing = ref(false)
const localData = ref({ ...schoolStore })

function startEdit() {
  localData.value = { ...schoolStore }
  isEditing.value = true
}

function saveEdit() {
  Object.assign(schoolStore, localData.value)
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

function viewPDF() {
  const dataToExport = isEditing.value ? localData.value : schoolStore
  generateSchoolInfoPDF(dataToExport)
}
</script>

<template>
  <q-card class="school-info-card q-pa-lg full-height-card">
    <h2 class="text-h4 text-weight-bold q-mb-md">Mi escuela</h2>
    <p class="text-body1 q-mb-xl">Maneja toda la información relacionada a tu institución.</p>

    <div class="school-details q-mb-xl">
      <div class="row q-mb-md items-center">
        <div class="col-4 text-weight-bold text-h6">Institución:</div>
        <div class="col-8">
          <q-input
            v-model="localData.institution"
            dense
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
            outlined
            placeholder="Plantel"
            :disable="!isEditing"
          />
        </div>
      </div>
    </div>

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
