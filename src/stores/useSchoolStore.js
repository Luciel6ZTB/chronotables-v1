// src/stores/useSchoolStore.js
import { reactive, watch } from 'vue'

const defaultData = {
  institution: '',
  period: '',
  campus: '',
  semestre: 'Cuarto',
  grupo: '402B',
  turno: 'matutino',
}

const savedData = (() => {
  try {
    const fromStorage = window.localStorage.getItem('school-info')
    return fromStorage ? JSON.parse(fromStorage) : defaultData
  } catch {
    return defaultData
  }
})()

export const schoolStore = reactive({ ...savedData })

watch(
  schoolStore,
  (newVal) => {
    window.localStorage.setItem('school-info', JSON.stringify(newVal))
  },
  { deep: true },
)
