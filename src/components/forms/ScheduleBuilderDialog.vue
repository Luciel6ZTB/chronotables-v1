<template>
  <q-dialog v-model="isOpen" maximized persistent @hide="onClose">
    <q-card class="schedule-builder-dialog">
      <q-toolbar class="bg-primary text-white">
        <q-icon name="schedule" size="sm" class="q-mr-sm" />
        <q-toolbar-title>Constructor de Horarios</q-toolbar-title>
        <q-btn flat round dense icon="close" @click="closeDialog" />
      </q-toolbar>

      <q-card-section class="q-pa-md">
        <div class="row">
          <!-- Panel de Configuración -->
          <div class="col-12 col-md-4">
            <q-card flat bordered class="q-pa-md">
              <q-card-section>
                <div class="text-h6 q-mb-md text-primary">
                  <q-icon name="settings" class="q-mr-sm" />
                  Configuración de Turnos
                </div>

                <!-- Selector de Turno -->
                <q-select
                  v-model="currentTurn"
                  :options="turnOptions"
                  label="Turno actual"
                  emit-value
                  map-options
                  class="q-mb-md"
                  outlined
                  @update:model-value="switchTurn"
                >
                  <template v-slot:prepend>
                    <q-icon name="wb_sunny" v-if="currentTurn === 'matutino'" />
                    <q-icon name="nights_stay" v-else />
                  </template>
                </q-select>

                <!-- Configuración de Bloques -->
                <q-input
                  v-model.number="config[currentTurn].bloques"
                  type="number"
                  label="Cantidad de bloques de clase"
                  min="1"
                  max="12"
                  class="q-mb-md"
                  outlined
                  @update:model-value="updateBlocks"
                >
                  <template v-slot:prepend>
                    <q-icon name="view_module" />
                  </template>
                </q-input>

                <!-- Configuración de Recesos -->
                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm text-secondary">
                    <q-icon name="free_breakfast" class="q-mr-xs" />
                    Configuración de Recesos
                  </div>

                  <q-input
                    v-model.number="config[currentTurn].recesos.cantidad"
                    type="number"
                    label="Cantidad de recesos"
                    min="0"
                    max="5"
                    class="q-mb-sm"
                    outlined
                    dense
                    @update:model-value="updateRecesos"
                  />

                  <div
                    v-for="(receso, index) in config[currentTurn].recesos.posiciones"
                    :key="index"
                    class="q-mb-sm"
                  >
                    <q-select
                      v-model="config[currentTurn].recesos.posiciones[index]"
                      :options="recesoOptions"
                      :label="`Receso ${index + 1} después del bloque:`"
                      emit-value
                      map-options
                      outlined
                      dense
                      @update:model-value="updateScheduleDisplay"
                    />
                  </div>
                </div>

                <!-- Información del Algoritmo -->
                <q-card flat class="bg-grey-1 q-pa-sm q-mb-md">
                  <div class="text-caption text-grey-7">
                    <strong>Configuración del Algoritmo:</strong>
                  </div>
                  <div class="text-caption">
                    • Matutino: {{ config.matutino.bloques }} bloques<br />
                    • Vespertino: {{ config.vespertino.bloques }} bloques<br />
                    • Inicio vespertino: bloque {{ config.matutino.bloques + 1 }}<br />
                    • Fin matutino: bloque {{ config.matutino.bloques }}
                  </div>
                </q-card>

                <!-- Botones de Acción -->
                <div class="q-gutter-sm">
                  <q-btn
                    color="primary"
                    icon="save"
                    label="Guardar Configuración"
                    @click="saveConfiguration"
                    class="full-width"
                  />
                  <q-btn
                    color="secondary"
                    icon="download"
                    label="Exportar Plantilla"
                    @click="exportTemplate"
                    class="full-width"
                  />
                  <q-btn
                    color="info"
                    icon="upload"
                    label="Cargar Configuración"
                    @click="loadConfiguration"
                    class="full-width"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Vista Previa del Horario -->
          <div class="col-12 col-md-8">
            <q-card flat bordered class="q-pa-md full-height">
              <q-card-section>
                <div class="text-h6 q-mb-md text-primary">
                  <q-icon name="preview" class="q-mr-sm" />
                  Vista Previa - Turno {{ currentTurn === 'matutino' ? 'Matutino' : 'Vespertino' }}
                </div>

                <q-table
                  :rows="schedulePreview"
                  :columns="scheduleColumns"
                  row-key="id"
                  flat
                  bordered
                  hide-pagination
                  :pagination="{ rowsPerPage: 0 }"
                  class="schedule-table"
                >
                  <template v-slot:body-cell-numero="props">
                    <q-td :props="props">
                      <q-badge
                        v-if="props.row.tipo === 'clase'"
                        :label="props.row.numero"
                        color="primary"
                      />
                      <q-badge v-else :label="props.row.numero" color="orange" />
                    </q-td>
                  </template>

                  <template v-slot:body-cell-horario="props">
                    <q-td :props="props">
                      <q-input
                        v-if="props.row.tipo === 'clase'"
                        v-model="props.row.horario"
                        dense
                        outlined
                        placeholder="7:00 - 7:50"
                        class="schedule-input"
                        @update:model-value="updateScheduleData"
                      >
                        <template v-slot:prepend>
                          <q-icon name="schedule" size="xs" />
                        </template>
                      </q-input>
                      <q-input
                        v-else
                        v-model="props.row.horario"
                        dense
                        outlined
                        placeholder="10:00 - 10:15"
                        class="schedule-input"
                        @update:model-value="updateScheduleData"
                      >
                        <template v-slot:prepend>
                          <q-icon name="free_breakfast" size="xs" />
                        </template>
                      </q-input>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-espacio="props">
                    <q-td :props="props">
                      <div v-if="props.row.tipo === 'clase'" class="class-slot">
                        <q-icon name="school" class="q-mr-xs" />
                        Clase {{ props.row.numero }}
                      </div>
                      <div v-else class="break-slot">
                        <q-icon name="free_breakfast" class="q-mr-xs" />
                        {{ props.row.nombre }}
                      </div>
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ScheduleBuilderDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'configuration-saved'],
  data() {
    return {
      currentTurn: 'matutino',
      config: {
        matutino: {
          bloques: 8,
          recesos: {
            cantidad: 2,
            posiciones: [2, 5], // Después del bloque 2 y 5
          },
          horarios: [],
        },
        vespertino: {
          bloques: 7,
          recesos: {
            cantidad: 2,
            posiciones: [2, 4],
          },
          horarios: [],
        },
      },
      turnOptions: [
        { label: 'Matutino', value: 'matutino' },
        { label: 'Vespertino', value: 'vespertino' },
      ],
      scheduleColumns: [
        {
          name: 'numero',
          label: 'Bloque',
          align: 'center',
          field: 'numero',
          style: 'width: 100px',
        },
        {
          name: 'horario',
          label: 'Horario',
          align: 'center',
          field: 'horario',
          style: 'width: 250px',
        },
        {
          name: 'espacio',
          label: 'Espacio de Clase',
          align: 'center',
          field: 'espacio',
          style: 'min-width: 200px',
        },
      ],
      schedulePreview: [],
    }
  },
  computed: {
    isOpen: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
    recesoOptions() {
      const options = []
      for (let i = 1; i < this.config[this.currentTurn].bloques; i++) {
        options.push({ label: `Bloque ${i}`, value: i })
      }
      return options
    },
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.updateScheduleDisplay()
      }
    },
  },
  methods: {
    closeDialog() {
      this.isOpen = false
    },

    onClose() {
      this.$emit('update:modelValue', false)
    },

    switchTurn() {
      this.updateScheduleDisplay()
    },

    updateBlocks() {
      // Ajustar recesos si hay más recesos que bloques posibles
      const maxRecesos = Math.max(0, this.config[this.currentTurn].bloques - 1)
      if (this.config[this.currentTurn].recesos.cantidad > maxRecesos) {
        this.config[this.currentTurn].recesos.cantidad = maxRecesos
      }

      // Ajustar posiciones de recesos
      this.config[this.currentTurn].recesos.posiciones = this.config[
        this.currentTurn
      ].recesos.posiciones.filter((pos) => pos < this.config[this.currentTurn].bloques)

      this.updateRecesos()
    },

    updateRecesos() {
      const cantidad = this.config[this.currentTurn].recesos.cantidad
      const posiciones = this.config[this.currentTurn].recesos.posiciones

      // Ajustar array de posiciones
      if (posiciones.length > cantidad) {
        this.config[this.currentTurn].recesos.posiciones = posiciones.slice(0, cantidad)
      } else if (posiciones.length < cantidad) {
        for (let i = posiciones.length; i < cantidad; i++) {
          this.config[this.currentTurn].recesos.posiciones.push(1)
        }
      }

      this.updateScheduleDisplay()
    },

    updateScheduleDisplay() {
      const preview = []
      const currentConfig = this.config[this.currentTurn]
      const recesos = currentConfig.recesos.posiciones.sort((a, b) => a - b)

      let bloqueCount = 1
      let rowId = 1

      for (let i = 1; i <= currentConfig.bloques; i++) {
        // Agregar bloque de clase
        preview.push({
          id: rowId++,
          numero: bloqueCount,
          horario: this.getHorarioForBlock(bloqueCount, 'clase'),
          espacio: '',
          tipo: 'clase',
        })

        // Verificar si hay receso después de este bloque
        if (recesos.includes(i)) {
          preview.push({
            id: rowId++,
            numero: 'R',
            horario: this.getHorarioForBlock(i, 'receso'),
            espacio: '',
            tipo: 'receso',
            nombre: 'Receso',
          })
        }

        bloqueCount++
      }

      this.schedulePreview = preview
    },

    getHorarioForBlock(blockNum, tipo) {
      const currentConfig = this.config[this.currentTurn]
      const existingHorario = currentConfig.horarios.find(
        (h) => h.bloque === blockNum && h.tipo === tipo,
      )
      return existingHorario ? existingHorario.horario : ''
    },

    updateScheduleData() {
      // Actualizar datos de horarios en la configuración
      const currentConfig = this.config[this.currentTurn]
      currentConfig.horarios = []

      this.schedulePreview.forEach((row) => {
        if (row.horario) {
          currentConfig.horarios.push({
            bloque: row.numero,
            tipo: row.tipo,
            horario: row.horario,
          })
        }
      })
    },

    saveConfiguration() {
      const algorithmConfig = this.generateAlgorithmConfig()
      const templateConfig = this.generateTemplateConfig()

      // Guardar en localStorage para persistencia
      localStorage.setItem('schedule-algorithm-config', JSON.stringify(algorithmConfig))
      localStorage.setItem('schedule-template-config', JSON.stringify(templateConfig))

      this.$emit('configuration-saved', { algorithmConfig, templateConfig })

      this.$q.notify({
        type: 'positive',
        message: 'Configuración guardada exitosamente',
        icon: 'save',
      })
    },

    loadConfiguration() {
      try {
        const algorithmConfig = localStorage.getItem('schedule-algorithm-config')
        const templateConfig = localStorage.getItem('schedule-template-config')

        if (algorithmConfig && templateConfig) {
          const algorithm = JSON.parse(algorithmConfig)
          const template = JSON.parse(templateConfig)

          // Restaurar configuración
          this.config.matutino.bloques = algorithm.bloques_matutino
          this.config.vespertino.bloques = algorithm.bloques_vespertino

          if (template.matutino) {
            this.config.matutino.recesos = template.matutino.recesos
            this.config.matutino.horarios = template.matutino.horarios || []
          }

          if (template.vespertino) {
            this.config.vespertino.recesos = template.vespertino.recesos
            this.config.vespertino.horarios = template.vespertino.horarios || []
          }

          this.updateScheduleDisplay()
        } else {
          this.$q.notify({
            type: 'warning',
            message: 'No se encontró configuración guardada',
            icon: 'warning',
          })
        }
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'Error al cargar la configuración',
          icon: 'error',
        })
      }
    },

    generateAlgorithmConfig() {
      const matutino = this.config.matutino
      const vespertino = this.config.vespertino

      return {
        bloques_matutino: matutino.bloques,
        bloques_vespertino: vespertino.bloques,
        bloque_inicio_vespertino: matutino.bloques + 1,
        bloque_fin_matutino: matutino.bloques,
      }
    },

    generateTemplateConfig() {
      return {
        matutino: {
          bloques: this.config.matutino.bloques,
          recesos: this.config.matutino.recesos,
          horarios: this.config.matutino.horarios,
          estructura: this.generateEstructura('matutino'),
        },
        vespertino: {
          bloques: this.config.vespertino.bloques,
          recesos: this.config.vespertino.recesos,
          horarios: this.config.vespertino.horarios,
          estructura: this.generateEstructura('vespertino'),
        },
      }
    },

    generateEstructura(turno) {
      const estructura = []
      const config = this.config[turno]
      const recesos = config.recesos.posiciones.sort((a, b) => a - b)

      for (let i = 1; i <= config.bloques; i++) {
        estructura.push({
          tipo: 'clase',
          numero: i,
          horario: this.getHorarioForBlock(i, 'clase'),
        })

        if (recesos.includes(i)) {
          estructura.push({
            tipo: 'receso',
            numero: `R${recesos.indexOf(i) + 1}`,
            horario: this.getHorarioForBlock(i, 'receso'),
          })
        }
      }

      return estructura
    },

    exportTemplate() {
      const algorithmConfig = this.generateAlgorithmConfig()
      const templateConfig = this.generateTemplateConfig()

      const exportData = {
        algorithm: algorithmConfig,
        template: templateConfig,
        exportDate: new Date().toISOString(),
        version: '1.0',
      }

      // Crear y descargar archivo JSON
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

      const exportFileDefaultName = `configuracion-horarios-${new Date().toISOString().split('T')[0]}.json`

      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()

      this.$q.notify({
        type: 'positive',
        message: 'Configuración exportada exitosamente',
        icon: 'download',
      })
    },
  },
}
</script>

<style scoped>
.schedule-builder-dialog {
  height: 100vh;
  max-height: 100vh;
}

.schedule-table {
  font-size: 14px;
  border-radius: 8px;
  overflow: hidden;
}

.schedule-input {
  min-width: 180px;
}

.class-slot {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  color: #1976d2;
  border: 1px solid #2196f3;
}

.break-slot {
  background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%);
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  color: #f57c00;
  border: 1px solid #ff9800;
}

.q-table tbody td {
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 12px;
}

.q-table thead th {
  background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
  font-weight: 600;
  color: #424242;
}

.full-height {
  height: 100%;
}

@media (max-width: 768px) {
  .schedule-input {
    min-width: 150px;
  }

  .class-slot,
  .break-slot {
    padding: 8px;
    font-size: 12px;
  }
}
</style>
