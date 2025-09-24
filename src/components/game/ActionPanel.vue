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
  <div class="action-panel-root card-koikoi p-3 d-flex flex-column gap-1">
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
    <div class="logs card-koikoi p-3">
      <h4 class="fs-6 mb-1 log-title">ログ</h4>
      <div class="log-scroll">
        <ul class="list-unstyled mb-0">
          <li v-for="log in actions.logs" :key="log.id" class="log-entry small text-start">
            <span class="log-time text-secondary">{{ log.time }}</span>
            <span
              :class="[
                'log-message ms-2',
                log.variant === 'error'
                  ? 'text-danger fw-semibold'
                  : log.variant === 'success'
                    ? 'text-success'
                    : 'text-muted'
              ]"
            >
              {{ log.message }}
            </span>
          </li>
        </ul>
      </div>
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
  height: 240px;
  flex: 0 0 240px;
}

.logs {
  flex: 0 0 150px;
  height: 150px;
  background-color: rgba(255, 255, 255, 0.8);
}

.log-scroll {
  height: 108px;
  overflow-y: auto;
  overflow-x: hidden;
}

.log-entry {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.log-time {
  min-width: 3.2rem;
}
</style>
