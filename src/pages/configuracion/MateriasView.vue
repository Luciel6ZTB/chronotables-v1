<template>
  <div>
    <div class="row">
      <!-- Sidebar: ActionCards, col-3 -->
      <div class="col-12 col-md-3">
        <ActionCards />
      </div>
      <!-- Main: ConfigSubjectCard, col-9 -->
      <div class="col-12 col-md-9">
        <ConfigSubjectCard />
      </div>
    </div>
  </div>
</template>

<script>
import ActionCards from 'components/ActionCards.vue'
import ConfigSubjectCard from 'components/ConfigSubjectCard.vue'

export default {
  name: 'MateriasView',
  components: { ActionCards, ConfigSubjectCard },
}
</script>
