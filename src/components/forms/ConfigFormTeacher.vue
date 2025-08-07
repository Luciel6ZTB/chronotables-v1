<script setup>
import { ref, computed, watch } from 'vue'
import { useMateriasStore } from 'src/stores/materiasStore'
import { useGruposStore } from 'src/stores/gruposStore'

const props = defineProps({
  modelValue: Boolean,
  titulo: String,
  docente: Object,
})
const emit = defineEmits(['update:modelValue', 'guardar'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const materiasStore = useMateriasStore()
const gruposStore = useGruposStore()

const localDocente = ref({
  id: '',
  nombre: '',
  abreviatura: '',
  horas_semanales_totales: 0,
  materias: [],
  horas_fortalecimiento_academico: [],
  horas_dual: [],
  horas_extracurriculares: [],
  bloques_recomendados_no_asignar: [],
})

const materiasOptions = computed(() =>
  materiasStore.materias.map((m) => ({
    label: m.abreviatura,
    value: m.id?.toString?.() ?? m.id, // <- Asegura que es string
  })),
)

const gruposOptions = computed(() =>
  gruposStore.grupos.map((g) => ({ label: g.nomenclatura, value: g.nomenclatura })),
)

const fortalecimientoOptions = [
  'Concursos',
  'Tutorías',
  'Asesorías Académicas',
  'Asesorías de alumnos para concurso',
  'Multidisciplinarias',
].map((f) => ({ label: f, value: f }))
const semestreOptions = [1, 2, 3, 4, 5, 6]

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      // Esperar a que materias y grupos estén cargados si no lo están
      if (!materiasStore.materias.length) await materiasStore.fetchMaterias?.()
      if (!gruposStore.grupos.length) await gruposStore.cargarGrupos?.()

      if (props.docente) {
        const materiasNormalizadas = (props.docente.materias ?? []).map((m) => ({
          ...m,
          materia:
            typeof m.materia === 'object' && m.materia.$oid
              ? m.materia.$oid
              : (m.materia.toString?.() ?? m.materia),
        }))

        localDocente.value = {
          ...JSON.parse(JSON.stringify(props.docente)),
          materias: materiasNormalizadas,
          horas_fortalecimiento_academico: props.docente.horas_fortalecimiento_academico ?? [],
          horas_dual: props.docente.horas_dual ?? [],
          horas_extracurriculares: props.docente.horas_extracurriculares ?? [],
          bloques_recomendados_no_asignar: props.docente.bloques_recomendados_no_asignar ?? [],
        }
      } else {
        localDocente.value = {
          nombre: '',
          abreviatura: '',
          horas_semanales_totales: 0,
          materias: [],
          horas_fortalecimiento_academico: [],
          horas_dual: [],
          horas_extracurriculares: [],
          bloques_recomendados_no_asignar: [],
        }
      }
    }
  },
  { immediate: true },
)

function agregarMateria() {
  localDocente.value.materias.push({ id: '', grupos_preferidos_asignar: [] })
}
function eliminarMateria(index) {
  localDocente.value.materias.splice(index, 1)
}

function agregarFortalecimiento() {
  localDocente.value.horas_fortalecimiento_academico.push({
    nombre: '',
    abreviatura: '',
    horas: 1,
  })
}
function eliminarFortalecimiento(index) {
  localDocente.value.horas_fortalecimiento_academico.splice(index, 1)
}

function agregarDual() {
  localDocente.value.horas_dual.push({
    nombre: '',
    abreviatura: '',
    semestre: null,
    horas_semanales: 1,
  })
}
function eliminarDual(index) {
  localDocente.value.horas_dual.splice(index, 1)
}
function agregarExtracurricular() {
  localDocente.value.horas_extracurriculares.push({
    nombre: '',
    abreviatura: '',
    horas: 1,
  })
}
function eliminarExtracurricular(index) {
  localDocente.value.horas_extracurriculares.splice(index, 1)
}

function cerrar() {
  emit('update:modelValue', false)
}

function guardar() {
  const payload = JSON.parse(JSON.stringify(localDocente.value))

  payload.materias = payload.materias
    ?.filter((m) => m.grupos_preferidos_asignar.length > 0)
    .map(({ id, ...rest }) => ({
      materia: id,
      ...rest,
    }))

  if (!payload.materias || payload.materias.length === 0) {
    delete payload.materias
  }

  // Fortalecimiento: quitar si vacío
  if (!payload.horas_fortalecimiento_academico?.length) {
    delete payload.horas_fortalecimiento_academico
  }

  // Dual: quitar si vacío
  if (!payload.horas_dual?.length) {
    delete payload.horas_dual
  }

  // Extracurriculares: quitar si vacío
  if (!payload.horas_extracurriculares?.length) {
    delete payload.horas_extracurriculares
  }

  // Bloques no asignar: quitar si vacío
  if (!payload.bloques_recomendados_no_asignar?.length) {
    delete payload.bloques_recomendados_no_asignar
  }

  console.log('[Docente creado]', payload)
  emit('guardar', payload)
  cerrar()
}
</script>
<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 600px; max-width: 800px">
      <q-card-section class="text-h6 bg-accent">{{ titulo }}</q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="localDocente.nombre" label="Nombre completo" outlined dense required />

        <q-input
          v-model="localDocente.abreviatura"
          label="Abreviatura"
          maxlength="20"
          outlined
          dense
          required
        />

        <q-input
          v-model.number="localDocente.horas_semanales_totales"
          type="number"
          label="Horas semanales totales"
          min="0"
          outlined
          dense
          required
        />

        <q-select
          v-model="localDocente.bloques_recomendados_no_asignar"
          :options="[...Array(13).keys()].map((n) => n + 1)"
          label="Bloques preferidos no asignar"
          multiple
          emit-value
          map-options
          outlined
          dense
        />

        <div>
          <div class="text-subtitle2">Materias asignadas</div>
          <div
            v-for="(materia, idx) in localDocente.materias"
            :key="idx"
            class="q-mb-md q-gutter-sm"
          >
            <q-select
              v-model="materia.materia"
              :options="materiasOptions"
              label="Materia"
              emit-value
              map-options
              outlined
              dense
            />

            <q-select
              v-model="materia.grupos_preferidos_asignar"
              :options="gruposOptions"
              label="Grupos preferidos"
              multiple
              emit-value
              map-options
              outlined
              dense
            />

            <q-btn flat icon="delete" color="negative" @click="eliminarMateria(idx)" />
          </div>
          <q-btn flat label="Agregar materia" icon="add" @click="agregarMateria" />
        </div>

        <div>
          <div class="text-subtitle2">Fortalecimiento académico</div>
          <div
            v-for="(fort, idx) in localDocente.horas_fortalecimiento_academico"
            :key="idx"
            class="q-mb-md q-gutter-sm"
          >
            <q-select
              v-model="fort.nombre"
              :options="fortalecimientoOptions"
              label="Tipo"
              emit-value
              map-options
              outlined
              dense
            />
            <q-input v-model="fort.abreviatura" label="Abreviatura" outlined dense maxlength="10" />

            <q-input
              class="q-pb-sm"
              v-model.number="fort.horas"
              type="number"
              label="Horas"
              min="1"
              outlined
              dense
            />
            <q-btn flat icon="delete" color="negative" @click="eliminarFortalecimiento(idx)" />
          </div>
          <q-btn flat label="Agregar fortalecimiento" icon="add" @click="agregarFortalecimiento" />
        </div>

        <div>
          <div class="text-subtitle2">Horas de Dual</div>
          <div
            v-for="(dual, idx) in localDocente.horas_dual"
            :key="idx"
            class="q-mb-md q-gutter-sm"
          >
            <q-input v-model="dual.nombre" label="Nombre de materia dual" outlined dense />
            <q-input v-model="dual.abreviatura" label="Abreviatura" outlined dense maxlength="10" />
            <q-select
              v-model.number="dual.semestre"
              :options="semestreOptions"
              label="Semestre"
              emit-value
              map-options
              outlined
              dense
            />
            <q-input
              v-model.number="dual.horas_semanales"
              type="number"
              label="Horas"
              min="1"
              outlined
              dense
            />
            <q-btn flat icon="delete" color="negative" @click="eliminarDual(idx)" />
          </div>
          <q-btn flat label="Agregar dual" icon="add" @click="agregarDual" />
        </div>

        <div>
          <div class="text-subtitle2">Actividades Extracurriculares</div>
          <div
            v-for="(extra, idx) in localDocente.horas_extracurriculares"
            :key="idx"
            class="q-mb-md q-gutter-sm"
          >
            <q-input v-model="extra.nombre" label="Nombre" outlined dense />
            <q-input
              v-model.number="extra.horas"
              type="number"
              label="Horas"
              min="1"
              outlined
              dense
            />
            <q-input v-model="extra.abreviatura" label="Abreviatura" outlined dense />

            <q-btn flat icon="delete" color="negative" @click="eliminarExtracurricular(idx)" />
          </div>
          <q-btn flat label="Agregar extracurricular" icon="add" @click="agregarExtracurricular" />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="negative" @click="cerrar" />
        <q-btn flat label="Guardar" color="primary" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
