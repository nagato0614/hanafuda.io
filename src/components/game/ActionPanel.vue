<script setup>
const props = defineProps({
  actions: {
    type: Object,
    default: () => ({ primary: [], secondary: [], logs: [] })
  }
});

const emits = defineEmits(['action']);

const trigger = (action) => {
  emits('action', action);
};
</script>

<template>
  <div class="card-koikoi p-3 h-100 d-flex flex-column gap-3">
    <div class="d-flex flex-wrap align-items-center gap-2">
      <button
        v-for="action in actions.primary"
        :key="action.key"
        type="button"
        class="btn"
        :class="`btn-${action.variant ?? 'primary'} btn-lg`"
        :disabled="action.disabled"
        @click="trigger(action)"
      >
        {{ action.label }}
      </button>
      <button
        v-for="action in actions.secondary"
        :key="action.key"
        type="button"
        class="btn"
        :class="`btn-outline-${action.variant ?? 'secondary'}`"
        :disabled="action.disabled"
        @click="trigger(action)"
      >
        {{ action.label }}
      </button>
    </div>
    <div class="logs card-koikoi flex-grow-1 overflow-auto p-3">
      <h4 class="fs-6 mb-2">ログ</h4>
      <ul class="list-unstyled mb-0">
        <li v-for="log in actions.logs" :key="log.id" class="small text-muted">
          <span class="text-secondary">{{ log.time }}</span>
          <span class="ms-2">{{ log.message }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.logs {
  background-color: rgba(255, 255, 255, 0.8);
}
</style>
