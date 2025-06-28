<template>
  <q-card class="actions-card q-pa-lg text-center full-height-card">
    <h2 class="text-h4 text-weight-bold q-mt-none q-mb-md">Acciones</h2>
    <!-- Action Buttons -->
    <div class="actions-buttons">
      <q-btn class="actions-btn" color="accent" size="lg" label="Agregar materia" no-caps />
      <q-btn class="actions-btn" color="secondary" size="lg" label="Editar materia" no-caps />
      <q-btn class="actions-btn" color="negative" size="lg" label="Eliminar materia" no-caps />
    </div>
  </q-card>
</template>

<script>
export default {
  name: 'ActionCards',
}
</script>

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
