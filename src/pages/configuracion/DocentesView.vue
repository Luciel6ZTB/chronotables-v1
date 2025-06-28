<template>
  <div>
    <div class="row">
      <!-- Sidebar: ActionCards, col-3 -->
      <div class="col-12 col-md-3">
        <ActionCards />
      </div>
      <!-- Main: ConfigSubjectCard, col-9 -->
      <div class="col-12 col-md-9">
        <ConfigTeacherCard />
      </div>
    </div>
  </div>
</template>

<script>
import ActionCards from 'components/ActionCards.vue'
import ConfigTeacherCard from 'components/ConfigTeacherCard.vue'

export default {
  name: 'DocentesView',
  components: { ActionCards, ConfigTeacherCard },
}
</script>
