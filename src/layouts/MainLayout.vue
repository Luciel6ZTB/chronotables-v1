<!-- MainLayout.vue -->
<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header Component -->
    <NavbarComponent @tab-changed="handleTabChange" />

    <!-- Main Content -->
    <q-page-container>
      <q-page class="q-pa-md page-container">
        <!-- Router View for different sections -->
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import NavbarComponent from 'components/NavbarComponent.vue'

export default {
  name: 'MainLayout',
  components: {
    NavbarComponent,
  },
  methods: {
    handleTabChange(tab) {
      // Navigate based on tab selection
      if (tab === 'inicio') {
        this.$router.push('/')
      } else if (tab === 'configuracion') {
        this.$router.push('/config')
      } else if (tab === 'visualizacion') {
        this.$router.push('/visualizacion')
      }
    },
  },
}
</script>

<style>
@font-face {
  font-family: 'Encode Sans';
  src: url(/src/assets/fonts/EncodeSans.ttf);
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'Open Sans';
  src: url(/src/assets/fonts/OpenSans.ttf);
  font-weight: normal;
  font-style: normal;
}
</style>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #c0c2b2;
}
</style>
