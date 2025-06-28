<template>
  <div class="horario-table-outer">
    <q-table
      flat
      bordered
      :rows="tableRows"
      :columns="columns"
      row-key="rowId"
      hide-bottom
      :pagination="{ rowsPerPage: 0 }"
      class="horario-table"
      :style="{ maxWidth: '1050px', margin: '0 auto' }"
    >
      <template #header="props">
        <q-tr :props="props">
          <q-th class="bloque-header">BLOQUE</q-th>
          <q-th class="hora-header">HORA</q-th>
          <q-th class="grupo-header">GRUPO</q-th>
          <q-th v-for="dia in dias" :key="dia" class="dia-header">{{ dia }}</q-th>
        </q-tr>
      </template>
      <template #body="props">
        <template v-if="props.row.receso">
          <q-tr :props="props" class="receso-row">
            <q-td colspan="100" class="receso-cell">RECESO</q-td>
          </q-tr>
        </template>
        <template v-else>
          <q-tr :props="props">
            <!-- BLOQUE (rowspan solo en la primera fila del bloque) -->
            <q-td
              v-if="props.row.isFirstGrupo"
              class="bloque-cell"
              :rowspan="props.row.rowspan"
              style="vertical-align: middle; text-align: center"
            >
              {{ props.row.bloque }}
            </q-td>
            <!-- HORA (rowspan solo en la primera fila del bloque) -->
            <q-td
              v-if="props.row.isFirstGrupo"
              class="hora-cell"
              :rowspan="props.row.rowspan"
              style="vertical-align: middle; text-align: center"
            >
              {{ props.row.hora }}
            </q-td>
            <!-- GRUPO -->
            <q-td class="grupo-cell">
              {{ props.row.grupo }}
            </q-td>
            <!-- MATERIAS -->
            <q-td
              v-for="(materia, idx) in props.row.materias"
              :key="idx"
              class="materia-cell"
              @click.stop="abrirDetalle(props.row, idx)"
            >
              {{ materia.abreviatura }}
            </q-td>
          </q-tr>
        </template>
      </template>
    </q-table>

    <!-- Dialogo de detalles -->
    <q-dialog
      v-model="dialogoDetalle"
      persistent
      transition-show="slide-right"
      transition-hide="slide-left"
    >
      <q-card class="drawer-card">
        <div class="row items-center justify-between" style="width: 100%">
          <div class="text-h6 q-mb-md">Detalle de Materia</div>
          <q-btn icon="close" flat round dense @click="dialogoDetalle = false" />
        </div>
        <div v-if="detalle">
          <div><b>Día:</b> {{ detalle.dia }}</div>
          <div><b>Hora:</b> {{ detalle.hora }}</div>
          <div><b>Grupo:</b> {{ detalle.grupo }}</div>
          <div><b>Materia:</b> {{ detalle.materiaCompleta }}</div>
        </div>
        <q-btn icon="edit" color="primary" label="Editar" class="q-mt-lg" style="width: 100%" />
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Días de la semana (puedes adaptar los nombres)
const dias = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES']

const columns = [
  { name: 'bloque', label: 'BLOQUE', align: 'center', field: 'bloque' },
  { name: 'hora', label: 'HORA', align: 'center', field: 'hora' },
  { name: 'grupo', label: 'GRUPO', align: 'center', field: 'grupo' },
  ...dias.map((dia) => ({
    name: dia.toLowerCase(),
    label: dia,
    align: 'center',
    field: dia.toLowerCase(),
  })),
]

// Bloques del horario y recesos - esto se puede usar para cconstruccion de horario
const bloques = [
  { bloque: 1, hora: '7:00 a 7:50', grupos: ['201', '202', '203', '204', '205', '206'] },
  {
    bloque: 2,
    hora: '7:50 a 8:40',
    grupos: ['201', '202', '203', '204', '205', '206'],
  },
  { receso: true },
  { bloque: 3, hora: '9:10 a 10:00', grupos: ['201', '202', '203', '204', '205', '206'] },
  { bloque: 5, hora: '10:10 a 10:50', grupos: ['201', '202', '203', '204', '205', '206'] },
]

// Materias por bloque/grupo/día
// [bloqueIdx][grupoIdx][diaIdx] = { abreviatura, materiaCompleta }
const materiasPorBloque = [
  // BLOQUE 1 (6 grupos)
  [
    // grupo 201
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    // grupo 202
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    // ...otros grupos
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
  ],
  // BLOQUE 2
  [
    // grupo 201
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    // grupo 202
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    // ...otros grupos
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
  ],
  // BLOQUE 3 (receso, vacío)
  [
    // grupo 201
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    // grupo 202
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    // ...otros grupos
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
  ],
  // BLOQUE 4 (3 grupos)
  [
    // grupo 201
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    // grupo 202
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    // ...otros grupos
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
    [
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'LNGCOM', materiaCompleta: 'Lengua y Comunicación' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
      { abreviatura: 'MODPR', materiaCompleta: 'Modelado de Productos' },
    ],
  ],
]

const tableRows = computed(() => {
  const result = []
  let bloqueIdx = 0
  bloques.forEach((bloque, idx) => {
    if (bloque.receso) {
      result.push({ receso: true, rowId: `receso-${idx}` })
    } else {
      const numGrupos = bloque.grupos.length
      bloque.grupos.forEach((grupo, grupoIdx) => {
        result.push({
          bloque: bloque.bloque,
          hora: bloque.hora,
          grupo,
          materias:
            materiasPorBloque[bloqueIdx]?.[grupoIdx] ||
            dias.map(() => ({ abreviatura: '', materiaCompleta: '' })),
          isFirstGrupo: grupoIdx === 0,
          rowspan: numGrupos,
          rowId: `bloque${bloque.bloque}-grupo${grupo}`,
        })
      })
      bloqueIdx++
    }
  })
  return result
})

const dialogoDetalle = ref(false)
const detalle = ref(null)

function abrirDetalle(row, idxDia) {
  if (!row || !row.materias) return
  detalle.value = {
    dia: dias[idxDia],
    hora: row.hora,
    grupo: row.grupo,
    materiaCompleta: row.materias[idxDia]?.materiaCompleta ?? '',
  }
  dialogoDetalle.value = true
}
</script>

<style scoped>
.horario-table-outer {
  display: flex;
  justify-content: center;
  margin: 0 auto;
  max-width: 1050px;
}
.horario-table {
  background: #b96d3e;
  border: 2px solid #b96d3e;
  min-width: 750px;
  max-width: 950px;
  width: 100%;
  box-shadow: 0 1px 6px #0001;
}
.bloque-header {
  background: #d46b4b;
  color: #fff;
  width: 54px;
  font-weight: bold;
  font-size: 1.02em;
}
.hora-header {
  background: #e7c583;
  color: #333;
  width: 92px;
  font-weight: bold;
}
.grupo-header {
  background: #ffc98b;
  color: #333;
  font-weight: bold;
}
.dia-header {
  background: #ffeeb2;
  color: #222;
  font-weight: bold;
}
.bloque-cell {
  background: #e07b5d;
  color: #fff;
  text-align: center;
  font-weight: bold;
  font-size: 1.1em;
}
.hora-cell {
  background: #ffe6b2;
  color: #333;
  text-align: center;
  font-weight: bold;
}
.grupo-cell {
  background: #fff2cc;
  color: #222;
  text-align: center;
  font-weight: bold;
}
.materia-cell {
  background: #fff9e6;
  color: #a05d14;
  text-align: center;
  cursor: pointer;
  min-width: 80px;
  max-width: 110px;
  border-bottom: 1px solid #e7c583;
  padding: 6px 2px 4px 2px;
  transition: background 0.18s;
  font-weight: bold;
  letter-spacing: 1px;
  font-size: 0.96em;
}
.materia-cell:hover {
  background: #f7e8c2;
}
.receso-row {
  background: #e5e5e5;
}
.receso-cell {
  background: #91836d !important;
  color: #fff;
  font-weight: bold;
  text-align: center;
  font-size: 1.1em;
  border: none !important;
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
