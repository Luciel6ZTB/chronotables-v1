<template>
  <div>
    <div class="row">
      <!-- Sidebar: ActionCards, col-3 -->
      <div class="col-12 col-md-3">
        <ActionCards />
      </div>
      <!-- Main: ConfigSubjectCard, col-9 -->
      <div class="col-12 col-md-9">
        <ConfigRoomCard />
      </div>
    </div>
  </div>
</template>

<script>
import ActionCards from 'components/ActionCards.vue'
import ConfigRoomCard from 'components/ConfigRoomCard.vue'

export default {
  name: 'MateriasView',
  components: { ActionCards, ConfigRoomCard },
}
</script>
