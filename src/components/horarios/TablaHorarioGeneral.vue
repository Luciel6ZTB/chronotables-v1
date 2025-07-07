<script setup>
import { ref, computed } from 'vue'
import { todosHorarios } from 'src/mockups/index'
const dias = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES']

const props = defineProps({
  grupo: String,
})

const drawer = ref(false)
const detalle = ref(null)

function abrirDetalle(celda) {
  if (!celda || !celda.materia) return
  detalle.value = celda
  drawer.value = true
}

const rows = computed(() => {
  const horarioGrupo = todosHorarios.find((h) => h.grupo === props.grupo)
  return horarioGrupo?.bloques || []
})
// Columnas base
const columns = [
  { name: 'bloque', label: 'TIEMPO', align: 'center', field: 'bloque' },
  { name: 'hora', label: 'Hora', align: 'center', field: 'hora' },
  ...dias.map((d) => ({ name: d.toLowerCase(), label: d, align: 'center' })),
]

// Obtener clase por día
function obtenerClasePorDia(clases, dia) {
  return clases?.find((c) => c.dia === dia)
}
</script>
<template>
  <div class="horario-table-outer">
    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      row-key="bloque"
      hide-bottom
      class="horario-table"
      :style="{ maxWidth: '1050px', margin: '0 auto' }"
      :pagination="{ rowsPerPage: 0 }"
    >
      <!-- Encabezado personalizado -->
      <template #header="props">
        <q-tr :props="props">
          <q-th class="bloque-header">TIEMPO</q-th>
          <q-th class="hora-header">HORA</q-th>
          <q-th v-for="dia in dias" :key="dia" class="dia-header">
            {{ dia }}
          </q-th>
        </q-tr>
      </template>
      <!-- Fila -->
      <template #body="props">
        <q-tr :props="props" :class="{ 'receso-row': props.row.receso }">
          <q-td class="bloque-cell">
            {{ props.row.bloque }}
          </q-td>
          <q-td
            class="hora-cell"
            :style="props.row.receso ? 'background:#6a4c2b;color:#fff' : ''"
            >{{ props.row.hora }}</q-td
          >
          <template v-if="!props.row.receso">
            <q-td
              v-for="dia in dias"
              :key="dia"
              class="clase-cell"
              @click.stop="abrirDetalle(obtenerClasePorDia(props.row.clases, dia))"
            >
              <template v-if="obtenerClasePorDia(props.row.clases, dia)">
                <div class="clase-titulo">
                  {{ obtenerClasePorDia(props.row.clases, dia).docente }}
                </div>
                <div class="clase-materia">
                  {{ obtenerClasePorDia(props.row.clases, dia).materia }}
                </div>
                <div class="clase-aula">{{ obtenerClasePorDia(props.row.clases, dia).aula }}</div>
              </template>
            </q-td>
          </template>
          <template v-else>
            <q-td class="receso-cell" colspan="5"> RECESO </q-td>
          </template>
        </q-tr>
      </template>
    </q-table>

    <!-- Dialog de detalles -->
    <q-dialog
      v-model="drawer"
      persistent
      transition-show="slide-right"
      transition-hide="slide-left"
    >
      <q-card class="drawer-card">
        <div class="row items-center justify-between" style="width: 100%">
          <div class="text-h6 q-mb-md">Detalles de la celda</div>
          <q-btn icon="close" flat round dense @click="drawer = false" />
        </div>
        <div v-if="detalle">
          <div><b>Materia:</b> {{ detalle.materia }}</div>
          <div><b>Aula:</b> {{ detalle.aula }}</div>
          <div><b>Docente:</b> {{ detalle.docente }}</div>
        </div>
        <q-btn icon="edit" color="primary" label="Editar" class="q-mt-lg" style="width: 100%" />
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.horario-table-outer {
  display: flex;
  justify-content: center;
  margin: 0 auto;
  border-radius: 40px;
  max-width: 1050px;
}

.horario-table {
  background: #222;
  border: 2px solid #222;
  min-width: 790px;
  max-width: 900px;
  width: 100%;
  box-shadow: 0 1px 6px #0001;
}
.bloque-header {
  background: #6d6663;
  color: #fff;
  width: 54px;
  font-weight: bold;
  font-size: 1.02em;
}
.hora-header {
  background: #d8b172;
  color: #333;
  width: 92px;
  font-weight: bold;
}
.dia-header {
  background: #c7a522;
  color: #222;
  font-weight: bold;
}
.bloque-cell {
  background-color: #858181;
  color: #fff;
  text-align: center;
  font-weight: bold;
  font-size: 1.1em;
}
.hora-cell {
  background: #f9f3e9;
  color: #333;
  text-align: center;
  font-weight: bold;
}
.clase-cell {
  background: #fff;
  text-align: center;
  cursor: pointer;
  min-width: 100px;
  max-width: 120px;
  border-left: 1px solid #e5e5e5;
  border-bottom: 1px solid #e5e5e5;
  padding: 7px 2px 4px 2px;
  transition: background 0.18s;
}
.clase-cell:hover {
  background: #f3f3bf;
}
.clase-titulo {
  font-weight: bold;
  font-size: 1.05em;
}
.clase-materia {
  font-size: 0.95em;
}
.clase-aula {
  font-size: 0.93em;
  color: #a08835;
}
.receso-row {
  background: #7c6c5b;
}
.receso-cell {
  background: #7c6c5b !important;
  color: #fff;
  font-weight: bold;
  text-align: center;
  font-size: 1.1em;
  border-left: 1px solid #7c6c5b !important;
}
.drawer-card {
  width: 340px;
  max-width: 92vw;
  min-height: 260px;
  margin-top: 80px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 3px 24px #0003;
  padding: 20px;
}
@media (max-width: 1050px) {
  .horario-table {
    min-width: 600px;
  }
}
</style>
