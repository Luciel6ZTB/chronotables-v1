<!-- views/InicioView.vue -->
<template>
  <div class="inicio-container">
    <div class="row full-height-row">
      <!-- Left Column - Chronotables Component -->
      <div class="col-md-4 col-12 column-container">
        <ChronotablesCard />
      </div>

      <!-- Right Column - School Info Component -->
      <div class="col-md-8 col-12 column-container">
        <SchoolInfoCard />
      </div>
    </div>
  </div>
</template>

<script>
import ChronotablesCard from '../components/ChronotablesCard.vue'
import SchoolInfoCard from '../components/SchoolInfoCard.vue'

export default {
  name: 'InicioView',
  components: {
    ChronotablesCard,
    SchoolInfoCard,
  },
}
</script>

<style scoped>
.inicio-container {
  min-height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
}

.full-height-row {
  flex: 1;
  display: flex;
  align-items: stretch;
}

.column-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 0 !important;
}
</style>
