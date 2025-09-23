<script setup>
const props = defineProps({
  result: {
    type: Object,
    required: true
  }
});

const emits = defineEmits(['retry', 'back-to-menu']);
</script>

<template>
  <div class="result-wrapper d-flex align-items-center justify-content-center py-5">
    <div class="card-koikoi p-5 w-100" style="max-width: 720px;">
      <div class="text-center mb-4">
        <h1 class="fw-bold mb-1">局終了</h1>
        <p class="text-muted">{{ result.message }}</p>
      </div>
      <div class="row g-3 mb-4">
        <div
          v-for="player in result.players"
          :key="player.id"
          class="col-6"
        >
          <div class="p-3 bg-white rounded-4 shadow-sm h-100">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h2 class="h5 mb-0">{{ player.name }}</h2>
              <span class="badge" :class="player.isWinner ? 'text-bg-success' : 'text-bg-secondary'">
                {{ player.isWinner ? '勝利' : '敗北' }}
              </span>
            </div>
            <div class="display-6 fw-bold text-primary">{{ player.totalScore }} 点</div>
            <p class="mb-0 text-muted">今回: {{ player.roundScore }} 点 / 役 {{ player.yakuCount }} 種</p>
          </div>
        </div>
      </div>
      <div class="border rounded-4 p-3 bg-white shadow-sm mb-4">
        <h2 class="h6">ハイライト</h2>
        <ul class="mb-0 small text-muted">
          <li v-for="highlight in result.highlights" :key="highlight">{{ highlight }}</li>
        </ul>
      </div>
      <div class="d-flex justify-content-center gap-3">
        <button type="button" class="btn btn-lg btn-primary" @click="$emit('retry')">もう一局</button>
        <button type="button" class="btn btn-lg btn-outline-secondary" @click="$emit('back-to-menu')">タイトルへ戻る</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-wrapper {
  min-height: 100vh;
  background: linear-gradient(160deg, rgba(203, 233, 255, 0.95), rgba(103, 140, 255, 0.35));
}
</style>
