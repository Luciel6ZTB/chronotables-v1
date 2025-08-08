<template>
  <q-layout view="lHh Lpr lFf">
    <login-dialog v-if="!userStore.user" />

    <!-- App -->
    <router-view v-else />
  </q-layout>
</template>

<script setup>
import { useUserStore } from 'src/stores/userStore'
import LoginDialog from 'components/LoginDialog.vue'

const userStore = useUserStore()
</script>
