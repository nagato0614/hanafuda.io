<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: '読み込み中です…'
  }
});
</script>

<template>
  <div v-if="visible" class="preloader-overlay d-flex align-items-center justify-content-center">
    <div class="card-koikoi p-4 text-center shadow-lg">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mb-0 fw-semibold">{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
.preloader-overlay {
  position: fixed;
  inset: 0;
  background: rgba(11, 27, 68, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1050;
}
</style>
