<script setup>
const emit = defineEmits(['close']);

// ルール本文は後続で差し替えるため、ここでは骨組みのみ提供する
</script>

<template>
  <div class="rule-modal-overlay d-flex align-items-center justify-content-center">
    <div class="rule-modal card-koikoi shadow-lg p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h4 mb-0">ルール</h2>
        <button type="button" class="btn btn-outline-secondary" @click="emit('close')">
          閉じる
        </button>
      </div>
      <div class="rule-body">
        <p class="text-muted">
          ここにルールの概要を表示します。サンプルとして、ルール本文を後から差し替え可能なように
          プレースホルダーを配置しています。
        </p>
        <ul class="mt-3">
          <li>手札を場札と組み合わせて獲得します。</li>
          <li>役を成立させると加点されます。</li>
          <li>詳細なルールは今後追記予定です。</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rule-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  z-index: 2000;
}

.rule-modal {
  max-width: 640px;
  width: calc(100% - 2rem);
  background-color: rgba(255, 255, 255, 0.98);
  border-radius: 1rem;
}

.rule-body {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
