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
  nombre_corto: '',
  horas_semanales_totales: 0,
  materias: [],
  horas_fortalecimiento_academico: [],
  horas_dual: [],
  bloques_recomendados_asignar: [],
})

const materiasOptions = computed(() =>
  materiasStore.materias.map((m) => ({ label: `${m.abreviatura}`, value: m.id })),
)
const gruposOptions = computed(() =>
  gruposStore.grupos.map((g) => ({ label: g.nomenclatura, value: g.nomenclatura })),
)

const fortalecimientoOptions = [
  'Concursos',
  'Tutorías',
  'Asesorías Académicas',
  'Asesorías de alumnos para concurso',
].map((f) => ({ label: f, value: f }))
const semestreOptions = [1, 2, 3, 4, 5, 6]

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.docente) {
        // Asegúrate que materias está definido y es array
        ;(localDocente.value = {
          ...JSON.parse(JSON.stringify(props.docente)),
          materias: props.docente.materias ?? [],
          horas_fortalecimiento_academico: props.docente.horas_fortalecimiento_academico ?? [],
          horas_dual: props.docente.horas_dual ?? [],
          bloques_recomendados_asignar: props.docente.bloques_recomendados_asignar ?? [],
          horas_extracurriculares: props.docente.horas_extracurriculares ?? [],
        }),
          console.log('extracurriculares:', props.docente.horas_extracurriculares)
      } else {
        localDocente.value = {
          nombre: '',
          nombre_corto: '',
          horas_semanales_totales: 0,
          materias: [],
          horas_fortalecimiento_academico: [],
          horas_dual: [],
          bloques_recomendados_asignar: [],
          horas_extracurriculares: [],
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
  localDocente.value.horas_fortalecimiento_academico.push({ nombre: '', horas: 1 })
}
function eliminarFortalecimiento(index) {
  localDocente.value.horas_fortalecimiento_academico.splice(index, 1)
}

function agregarDual() {
  localDocente.value.horas_dual.push({ nombre: '', semestre: null, horas_semanales: 1 })
}
function eliminarDual(index) {
  localDocente.value.horas_dual.splice(index, 1)
}

function cerrar() {
  emit('update:modelValue', false)
}

function guardar() {
  const payload = JSON.parse(JSON.stringify(localDocente.value))

  // Filtrar materias sin grupo asignado
  payload.materias = payload.materias?.filter((m) => m.grupos_preferidos_asignar.length > 0)

  // Si no hay fortalecimiento, eliminar el campo
  if (
    !payload.horas_fortalecimiento_academico ||
    payload.horas_fortalecimiento_academico.length === 0
  ) {
    delete payload.horas_fortalecimiento_academico
  }

  // Si no hay dual, eliminar el campo
  if (!payload.horas_dual || payload.horas_dual.length === 0) {
    delete payload.horas_dual
  }

  if (!payload.bloques_recomendados_asignar || payload.bloques_recomendados_asignar.length === 0) {
    delete payload.bloques_recomendados_asignar
  }

  if (!payload.horas_extracurriculares || payload.horas_extracurriculares.length === 0) {
    delete payload.horas_extracurriculares
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
          v-model="localDocente.nombre_corto"
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
          v-model="localDocente.bloques_recomendados_asignar"
          :options="[...Array(13).keys()].map((n) => n + 1)"
          label="Bloques preferidos para asignar"
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
            <!-- TODO: Cambiar por ID -->
            <q-select
              v-model="materia.id"
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
            <q-select
              v-model="dual.nombre"
              :options="materiasOptions"
              label="Materia"
              emit-value
              map-options
              outlined
              dense
            />
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
            <q-btn
              flat
              icon="delete"
              color="negative"
              @click="localDocente.horas_extracurriculares.splice(idx, 1)"
            />
          </div>
          <q-btn
            flat
            label="Agregar extracurricular"
            icon="add"
            @click="localDocente.horas_extracurriculares.push({ nombre: '', horas: 1 })"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="negative" @click="cerrar" />
        <q-btn flat label="Guardar" color="primary" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
