import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('userStore', () => {
  const user = ref(localStorage.getItem('current-user') || '')

  function setUser(nombre) {
    user.value = nombre
    localStorage.setItem('current-user', nombre)
  }

  function logout() {
    user.value = ''
    localStorage.removeItem('current-user')
  }

  const isAdmin = computed(() => user.value === 'admin')
  const isVisitante = computed(() => user.value === 'visitante')

  return { user, setUser, logout, isAdmin, isVisitante }
})
