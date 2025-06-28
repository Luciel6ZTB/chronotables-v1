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
              v-for="(celda, colIdx) in props.row.clases"
              :key="colIdx"
              class="clase-cell"
              @click.stop="abrirDetalle(celda)"
            >
              <q-tooltip
                anchor="top middle"
                class="bg-negative text-white"
                transition-show="rotate"
                transition-hide="rotate"
              >
                Conservación de la energía y sus interacciones
              </q-tooltip>

              <div class="clase-grupo">{{ celda.grupo }}</div>
              <div class="clase-materia">{{ celda.materia }}</div>
              <div class="clase-aula">{{ celda.aula }}</div>
            </q-td>
          </template>
          <template v-else>
            <q-td class="receso-cell" colspan="5">
              RECESO
              <q-tooltip> meow </q-tooltip>
            </q-td>
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
          <div><b>Grupo:</b> {{ detalle.grupo }}</div>
          <div><b>Materia:</b> {{ detalle.materia }}</div>
          <div><b>Aula:</b> {{ detalle.aula }}</div>
          <div><b>Docente:</b> {{ detalle.docente }}</div>
        </div>
        <q-btn icon="edit" color="primary" label="Editar" class="q-mt-lg" style="width: 100%" />
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const dias = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES']

const columns = [
  { name: 'bloque', label: 'TIEMPO', align: 'center', field: 'bloque' },
  { name: 'hora', label: 'Hora', align: 'center', field: 'hora' },
  { name: 'lunes', label: 'Lunes', align: 'center', field: 'lunes' },
  { name: 'martes', label: 'Martes', align: 'center', field: 'martes' },
  { name: 'miercoles', label: 'Miércoles', align: 'center', field: 'miercoles' },
  { name: 'jueves', label: 'Jueves', align: 'center', field: 'jueves' },
  { name: 'viernes', label: 'Viernes', align: 'center', field: 'viernes' },
]

// 9 bloques, 1 receso (bloque 3)
const rows = [
  {
    bloque: 1,
    hora: '7:00 a 7:50',
    clases: [
      { grupo: '201A', materia: 'TEMS DE FLS', aula: 'Aula 1', docente: 'A. Martínez' },
      { grupo: '201B', materia: 'MATEMÁTICAS', aula: 'Aula 2', docente: 'C. Torres' },
      { grupo: '201C', materia: 'QUÍMICA', aula: 'Lab 1', docente: 'D. Pérez' },
      { grupo: '201D', materia: 'BIOLOGÍA', aula: 'Lab 2', docente: 'B. López' },
      { grupo: '201E', materia: 'HISTORIA', aula: 'Aula 3', docente: 'E. Ruiz' },
    ],
  },
  {
    bloque: 2,
    hora: '7:50 a 8:40',
    clases: [
      { grupo: '202A', materia: 'INGLÉS', aula: 'Aula 4', docente: 'F. Smith' },
      { grupo: '202B', materia: 'BIOLOGÍA', aula: 'Lab 2', docente: 'B. López' },
      { grupo: '202C', materia: 'FÍSICA', aula: 'Lab 3', docente: 'G. Díaz' },
      { grupo: '202D', materia: 'ÉTICA', aula: 'Aula 5', docente: 'H. Soto' },
      { grupo: '202E', materia: 'TECNOLOGÍA', aula: 'Aula 6', docente: 'I. Lara' },
    ],
  },
  {
    receso: true,
    bloque: 3,
    hora: '8:40 a 9:10',
  },
  {
    bloque: 4,
    hora: '9:10 a 10:00',
    clases: [
      { grupo: '203A', materia: 'TEMS DE FLS', aula: 'Aula 1', docente: 'A. Martínez' },
      { grupo: '203B', materia: 'MATEMÁTICAS', aula: 'Aula 2', docente: 'C. Torres' },
      { grupo: '203C', materia: 'QUÍMICA', aula: 'Lab 1', docente: 'D. Pérez' },
      { grupo: '203D', materia: 'BIOLOGÍA', aula: 'Lab 2', docente: 'B. López' },
      { grupo: '203E', materia: 'HISTORIA', aula: 'Aula 3', docente: 'E. Ruiz' },
    ],
  },
  {
    bloque: 5,
    hora: '10:00 a 10:50',
    clases: [
      { grupo: '204A', materia: 'INGLÉS', aula: 'Aula 4', docente: 'F. Smith' },
      { grupo: '204B', materia: 'BIOLOGÍA', aula: 'Lab 2', docente: 'B. López' },
      { grupo: '204C', materia: 'FÍSICA', aula: 'Lab 3', docente: 'G. Díaz' },
      { grupo: '204D', materia: 'ÉTICA', aula: 'Aula 5', docente: 'H. Soto' },
      { grupo: '204E', materia: 'TECNOLOGÍA', aula: 'Aula 6', docente: 'I. Lara' },
    ],
  },
  {
    bloque: 6,
    hora: '10:50 a 11:40',
    clases: [
      { grupo: '205A', materia: 'TEMS DE FLS', aula: 'Aula 1', docente: 'A. Martínez' },
      { grupo: '205B', materia: 'MATEMÁTICAS', aula: 'Aula 2', docente: 'C. Torres' },
      { grupo: '205C', materia: 'QUÍMICA', aula: 'Lab 1', docente: 'D. Pérez' },
      { grupo: '205D', materia: 'BIOLOGÍA', aula: 'Lab 2', docente: 'B. López' },
      { grupo: '205E', materia: 'HISTORIA', aula: 'Aula 3', docente: 'E. Ruiz' },
    ],
  },
  {
    bloque: 7,
    hora: '11:40 a 12:30',
    clases: [
      { grupo: '206A', materia: 'INGLÉS', aula: 'Aula 4', docente: 'F. Smith' },
      { grupo: '206B', materia: 'BIOLOGÍA', aula: 'Lab 2', docente: 'B. López' },
      { grupo: '206C', materia: 'FÍSICA', aula: 'Lab 3', docente: 'G. Díaz' },
      { grupo: '206D', materia: 'ÉTICA', aula: 'Aula 5', docente: 'H. Soto' },
      { grupo: '206E', materia: 'TECNOLOGÍA', aula: 'Aula 6', docente: 'I. Lara' },
    ],
  },
  {
    bloque: 8,
    hora: '12:30 a 13:20',
    clases: [
      { grupo: '207A', materia: 'TEMS DE FLS', aula: 'Aula 1', docente: 'A. Martínez' },
      { grupo: '207B', materia: 'MATEMÁTICAS', aula: 'Aula 2', docente: 'C. Torres' },
      { grupo: '207C', materia: 'QUÍMICA', aula: 'Lab 1', docente: 'D. Pérez' },
      { grupo: '207D', materia: 'BIOLOGÍA', aula: 'Lab 2', docente: 'B. López' },
      { grupo: '207E', materia: 'HISTORIA', aula: 'Aula 3', docente: 'E. Ruiz' },
    ],
  },
  {
    bloque: 9,
    hora: '13:20 a 14:10',
    clases: [
      { grupo: '208A', materia: 'TEMS DE FLS', aula: 'Aula 1', docente: 'A. Martínez' },
      { grupo: '208B', materia: 'MATEMÁTICAS', aula: 'Aula 2', docente: 'C. Torres' },
      { grupo: '208C', materia: 'QUÍMICA', aula: 'Lab 1', docente: 'D. Pérez' },
      { grupo: '208D', materia: 'BIOLOGÍA', aula: 'Lab 2', docente: 'B. López' },
      { grupo: '208E', materia: 'HISTORIA', aula: 'Aula 3', docente: 'E. Ruiz' },
    ],
  },
]

const drawer = ref(false)
const detalle = ref(null)

function abrirDetalle(celda) {
  if (!celda || !celda.materia) return
  detalle.value = celda
  drawer.value = true
}
</script>

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
  background: #a04419;
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
.clase-grupo {
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
