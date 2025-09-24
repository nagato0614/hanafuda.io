<script setup>
import { computed } from 'vue';
import CardToken from './CardToken.vue';

const props = defineProps({
  field: {
    type: Object,
    default: () => ({ cards: [], drawPile: 0, discard: [] })
  },
  selectedCardId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['select-card']);

const TOTAL_SLOTS = 8;

const gridCards = computed(() => {
  const cards = props.field.cards ?? [];

  if (cards.length >= TOTAL_SLOTS) {
    return cards.slice(0, TOTAL_SLOTS);
  }

  const placeholders = Array.from({ length: TOTAL_SLOTS - cards.length }, (_, index) => ({
    id: `empty-slot-${index}`,
    empty: true
  }));

  return [...cards, ...placeholders];
});

const handleSelect = (item) => {
  if (item.empty) {
    return;
  }

  // 選択した場札を上位へ通知（手札との組み合わせ判定は App 側）
  emit('select-card', item);
};
</script>

<template>
  <div class="card-koikoi p-3 h-100 field-area">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="fs-5 mb-0">場札</h3>
        <small class="text-muted">同月札ごとにカードを整列</small>
      </div>
      <div class="text-end">
        <div class="badge text-bg-primary d-block mb-1">山札 {{ field.drawPile }} 枚</div>
        <div class="badge text-bg-secondary" v-if="field.discard?.length">捨て札 {{ field.discard.length }} 枚</div>
      </div>
    </div>
    <div class="field-grid">
      <div
        v-for="(item, index) in gridCards"
        :key="item.id ?? `slot-${index}`"
        class="field-slot d-flex align-items-center justify-content-center"
      >
        <button
          v-if="!item.empty"
          type="button"
          class="field-card-btn"
          :class="{ selected: item.id === selectedCardId }"
          @click="handleSelect(item)"
        >
          <CardToken
            :card="item"
            size="md"
            selectable
            :selected="item.id === selectedCardId"
          />
        </button>
        <div v-else class="field-empty">&nbsp;</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.field-area {
  backdrop-filter: blur(6px);
  background-color: rgba(255, 255, 255, 0.95);
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.field-slot {
  min-height: 112px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px dashed rgba(15, 23, 42, 0.15);
  border-radius: 1rem;
}

.field-card-btn {
  width: 100%;
  height: 100%;
  background: none;
  border: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.field-card-btn.selected {
  outline: 3px solid #0d6efd;
  border-radius: 1rem;
}

.field-card-btn:focus-visible {
  outline: 3px solid #0d6efd;
  border-radius: 1rem;
}

.field-empty {
  width: 100%;
  height: 100%;
}
</style>
