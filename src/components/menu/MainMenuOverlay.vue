<script setup>
const emits = defineEmits(['start']);

const handleStart = () => {
  emits('start');
};
</script>

<template>
  <div class="menu-overlay d-flex align-items-center justify-content-center h-100">
    <div class="card-koikoi p-5 text-center shadow-lg overlay-card">
      <h1 class="display-5 fw-bold mb-3">花札こいこい</h1>
      <p class="text-muted mb-4">スタートボタンを押して対局を開始してください</p>
      <div class="d-grid gap-3">
        <button type="button" class="btn btn-primary btn-lg" @click="handleStart">
          対局を開始する
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-overlay {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 1rem;
}

.overlay-card {
  max-width: 420px;
  background-color: rgba(255, 255, 255, 0.95);
}
</style>
