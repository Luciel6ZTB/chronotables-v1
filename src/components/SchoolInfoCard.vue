<template>
  <q-card class="school-info-card q-pa-lg full-height-card">
    <h2 class="text-h4 text-weight-bold q-mb-md">Mi escuela</h2>

    <p class="text-body1 q-mb-lg">
      Y baila lento, flor morada, que me recuerdas a mi amada. Ella esta esperando en casa, y yo
      muriendo por volver.
    </p>

    <!-- School Details -->
    <div class="school-details q-mb-xl">
      <div class="row q-mb-md">
        <div class="col-4 text-weight-bold">Institución:</div>
        <div class="col-8">{{ schoolData.institution || 'N/A' }}</div>
      </div>
      <div class="row q-mb-md">
        <div class="col-4 text-weight-bold">Período escolar:</div>
        <div class="col-8">{{ schoolData.period || 'N/A' }}</div>
      </div>
      <div class="row q-mb-md">
        <div class="col-4 text-weight-bold">Plantel:</div>
        <div class="col-8">{{ schoolData.campus || 'N/A' }}</div>
      </div>
    </div>

    <!-- Bottom Action Buttons -->
    <div class="buttons-container">
      <div class="row q-gutter-md justify-end">
        <q-btn
          color="amber-7"
          size="lg"
          label="VISUALIZAR DETALLES (PDF)"
          no-caps
          @click="viewPDF"
        />
        <q-btn color="grey-7" size="lg" label="EDITAR DETALLES" no-caps @click="editDetails" />
      </div>
    </div>
  </q-card>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'SchoolInfoCard',
  setup() {
    const router = useRouter()

    const schoolData = ref({
      institution: '',
      period: '',
      campus: '',
    })

    const viewPDF = () => {
      console.log('Visualizar PDF')
      // Navigate to PDF view route
      router.push('/visualizar-pdf')
    }

    const editDetails = () => {
      console.log('Editar detalles')
      // Navigate to edit school details route
      router.push('/editar-escuela')
    }

    return {
      schoolData,
      viewPDF,
      editDetails,
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
