<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const emit = defineEmits(['agregar', 'editar', 'eliminar'])
defineProps({
  editarDisable: Boolean,
  eliminarDisable: Boolean,
})

const route = useRoute()
const textos = {
  materias: { agregar: 'Agregar materia', editar: 'Editar materia', eliminar: 'Eliminar materia' },
  docentes: { agregar: 'Agregar docente', editar: 'Editar docente', eliminar: 'Eliminar docente' },
  grupos: { agregar: 'Agregar grupo', editar: 'Editar grupo', eliminar: 'Eliminar grupo' },
  aulas: { agregar: 'Agregar aula', editar: 'Editar aula', eliminar: 'Eliminar aula' },
}
const configuracion = computed(() => route.path.split('/').at(-1))
const labels = computed(() => textos[configuracion.value] || textos.materias)
</script>

<template>
  <q-card class="actions-card q-pa-lg text-center full-height-card">
    <h2 class="text-h4 text-weight-bold q-mt-none q-mb-md">Acciones</h2>
    <div class="actions-buttons">
      <q-btn
        class="actions-btn"
        color="accent"
        size="lg"
        :label="labels.agregar"
        @click="emit('agregar')"
        no-caps
      />
      <q-btn
        class="actions-btn"
        color="secondary"
        size="lg"
        :label="labels.editar"
        :disable="editarDisable"
        @click="emit('editar')"
        no-caps
      />
      <q-btn
        class="actions-btn"
        color="negative"
        size="lg"
        :label="labels.eliminar"
        :disable="eliminarDisable"
        @click="emit('eliminar')"
        no-caps
      />
    </div>
  </q-card>
</template>
<style scoped>
.full-height-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.actions-card {
  border-right: 2px solid black;
  background-color: #f2f2f2;
  border-radius: 0;
}

.actions-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 300px;
}

.actions-btn {
  width: 90%;
  max-width: 280px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px !important;
}
</style>
