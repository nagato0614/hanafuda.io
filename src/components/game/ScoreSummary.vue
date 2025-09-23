<script setup>
const props = defineProps({
  players: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <div class="score-strip card-koikoi px-3 py-2">
    <div class="d-flex align-items-center justify-content-between gap-3">
      <div
        v-for="player in players"
        :key="player.id"
        class="score-card flex-grow-1 d-flex align-items-center justify-content-between gap-3"
      >
        <div>
          <div class="fw-semibold small text-muted">{{ player.roleLabel ?? 'プレイヤー' }}</div>
          <div class="h5 mb-0">{{ player.name }}</div>
        </div>
        <div class="text-end">
          <div class="display-6 fw-bold text-primary mb-0">{{ player.totalScore ?? 0 }}</div>
          <small class="text-muted">本局 {{ player.roundScore ?? 0 }} 点</small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.score-strip {
  background-color: rgba(255, 255, 255, 0.85);
}

.score-card {
  padding: 0.75rem 1.25rem;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
}
</style>
