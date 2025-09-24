<script setup>
const props = defineProps({
  status: {
    type: Object,
    default: () => ({})
  },
  players: {
    type: Array,
    default: () => []
  },
  field: {
    type: Object,
    default: () => ({ drawPile: 0, discard: [] })
  }
});
</script>

<template>
  <div class="status-bar card-koikoi py-2 px-3">
    <div class="d-flex align-items-start justify-content-between gap-3">
      <div class="d-flex align-items-center gap-3">
        <span class="fw-semibold">{{ status.monthLabel }}</span>
        <span class="text-muted ms-2">{{ status.phase }}</span>
      </div>
      <div class="badge text-bg-dark" v-if="status.turnLabel">{{ status.turnLabel }}</div>
    </div>
    <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap mt-2">
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <span class="badge text-bg-secondary" v-if="status.timeRemaining">
          残り {{ status.timeRemaining }}
        </span>
        <div class="badge text-bg-warning text-dark" v-if="status.koikoiLevel">
          コイコイ {{ status.koikoiLevel }} 回目
        </div>
        <div class="badge text-bg-primary" v-if="Number.isFinite(field.drawPile)">
          山札 {{ field.drawPile ?? 0 }} 枚
        </div>
        <div class="badge text-bg-light text-dark" v-if="field.discard?.length">
          捨て札 {{ field.discard.length }} 枚
        </div>
      </div>
      <div class="d-flex align-items-center gap-3 score-stack">
        <div
          v-for="player in players"
          :key="player.id"
          class="score-item d-flex align-items-center gap-2"
        >
          <div class="score-label text-muted small">{{ player.roleLabel ?? 'プレイヤー' }}</div>
          <div class="score-value fw-bold">{{ player.totalScore ?? 0 }} 点</div>
          <small class="text-muted">本局 {{ player.roundScore ?? 0 }} 点</small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-bar {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.85);
}

.score-stack {
  flex-wrap: wrap;
}

.score-item {
  padding: 0.25rem 0.75rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.1);
}

.score-value {
  font-size: 1.35rem;
  color: #0d6efd;
}
</style>
