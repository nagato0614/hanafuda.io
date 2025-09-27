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
  <div class="action-panel-root card-koikoi p-3 d-flex flex-column gap-2">
    <div class="action-buttons d-flex align-items-center gap-2">
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
        class="btn btn-lg"
        :class="`btn-outline-${action.variant ?? 'secondary'}`"
        :disabled="action.disabled"
        @click="trigger(action)"
      >
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.action-buttons {
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  min-height: 60px;
}

.action-buttons > .btn {
  flex: 0 0 auto;
  white-space: nowrap;
  min-width: 180px;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-panel-root {
  flex: 0 0 auto;
}
</style>
