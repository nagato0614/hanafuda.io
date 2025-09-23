<script setup>
const props = defineProps({
  status: {
    type: Object,
    default: () => ({})
  }
});
</script>

<template>
  <div class="status-bar card-koikoi py-2 px-3 d-flex align-items-center justify-content-between">
    <div class="d-flex align-items-center gap-3">
      <div>
        <span class="fw-semibold">{{ status.monthLabel }}</span>
        <span class="text-muted ms-2">{{ status.phase }}</span>
      </div>
      <div class="badge text-bg-dark" v-if="status.turnLabel">{{ status.turnLabel }}</div>
    </div>
    <div class="d-flex align-items-center gap-3">
      <span class="badge text-bg-secondary" v-if="status.timeRemaining">
        残り {{ status.timeRemaining }}
      </span>
      <div class="badge text-bg-warning text-dark" v-if="status.koikoiLevel">
        コイコイ {{ status.koikoiLevel }} 回目
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-bar {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.85);
}
</style>
