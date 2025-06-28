<template>
  <div>
    <div class="row">
      <!-- Sidebar: ActionCards, col-3 -->
      <div class="col-12 col-md-3">
        <ActionCards />
      </div>
      <!-- Main: ConfigSubjectCard, col-9 -->
      <div class="col-12 col-md-9">
        <ConfigGroupCard />
      </div>
    </div>
  </div>
</template>

<script>
import ActionCards from 'components/ActionCards.vue'
import ConfigGroupCard from 'components/ConfigGroupCard.vue'

export default {
  name: 'GruposView',
  components: { ActionCards, ConfigGroupCard },
}
</script>
