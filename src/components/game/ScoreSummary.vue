<script setup>
const props = defineProps({
  players: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <div class="card-koikoi p-3 h-100">
    <h3 class="fs-6 mb-3">スコアサマリー</h3>
    <div class="vstack gap-3">
      <div
        v-for="player in players"
        :key="player.id"
        class="d-flex justify-content-between align-items-center p-2 rounded-4 bg-white shadow-sm"
      >
        <div>
          <div class="fw-semibold">{{ player.name }}</div>
          <small class="text-muted">獲得札 {{ player.capturedTotal ?? 0 }}枚</small>
        </div>
        <div class="text-end">
          <div class="h5 mb-0 text-primary">{{ player.roundScore ?? 0 }} 点</div>
          <small class="text-muted">累計 {{ player.totalScore ?? 0 }} 点</small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-sm {
  box-shadow: 0 0.35rem 0.8rem rgba(15, 23, 42, 0.1) !important;
}
</style>
