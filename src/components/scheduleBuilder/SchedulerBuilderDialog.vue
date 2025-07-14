<template>
  <q-dialog v-model="isOpen" maximized persistent @hide="onClose">
    <q-card class="bg-white">
      <q-toolbar class="bg-primary text-white">
        <q-icon name="schedule" size="sm" class="q-mr-sm" />
        <q-toolbar-title>Constructor de Horarios</q-toolbar-title>
        <q-btn flat round dense icon="close" @click="closeDialog" />
      </q-toolbar>

      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <ScheduleConfigPanel />
          </div>

          <div class="col-12 col-md-8">
            <SchedulePreview />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import ScheduleConfigPanel from './ScheduleConfigPanel.vue'
import SchedulePreview from './SchedulePreview.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const closeDialog = () => {
  isOpen.value = false
}

const onClose = () => {
  emit('update:modelValue', false)
}
</script>
