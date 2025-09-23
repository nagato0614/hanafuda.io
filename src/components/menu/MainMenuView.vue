<script setup>
const emits = defineEmits(['start-game', 'open-settings', 'show-rules']);

const handleStart = () => {
  emits('start-game');
};
</script>

<template>
  <div class="menu-wrapper d-flex align-items-center justify-content-center py-5">
    <div class="card-koikoi p-5 w-100" style="max-width: 720px;">
      <div class="text-center mb-4">
        <img src="/assets/logo.png" alt="Hanafuda" class="img-fluid" style="max-height: 120px;">
        <h1 class="fw-bold mt-3">花札こいこい</h1>
        <p class="text-muted">Vue + Phaser で遊ぶデジタル花札</p>
      </div>
      <div class="d-grid gap-3">
        <button type="button" class="btn btn-lg btn-primary" @click="handleStart">
          対局を開始する
        </button>
        <button type="button" class="btn btn-lg btn-outline-secondary" @click="$emit('open-settings')">
          設定
        </button>
        <button type="button" class="btn btn-lg btn-outline-secondary" @click="$emit('show-rules')">
          ルールを表示
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(203, 233, 255, 0.9), rgba(114, 189, 255, 0.6));
}
</style>
