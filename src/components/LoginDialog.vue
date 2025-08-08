<script setup>
import { ref } from 'vue'
import { useUserStore } from 'src/stores/userStore'

const open = ref(true)
const username = ref('')
const password = ref('')
const userStore = useUserStore()

function login() {
  const users = {
    admin: 'admin123',
    visitante: 'ver123',
  }

  if (users[username.value] && users[username.value] === password.value) {
    userStore.setUser(username.value)
    open.value = false
  } else {
    alert('Usuario o contraseña incorrectos')
  }
}
</script>
<template>
  <q-dialog v-model="open" persistent transition-show="scale" transition-hide="scale">
    <q-card style="min-width: 300px; max-width: 400px">
      <q-card-section class="text-center">
        <div class="text-h6">Inicio de Sesión</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="username" label="Usuario" dense outlined />
        <q-input
          v-model="password"
          label="Contraseña"
          type="password"
          dense
          outlined
          class="q-mt-md"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Ingresar" color="primary" @click="login" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
