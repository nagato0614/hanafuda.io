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
  },
  selectableCardIds: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select-card']);

const BASE_COLUMNS = 4;
const EXPANDED_COLUMNS = 5;
const ROWS = 2;

const isSelectable = (cardId) => {
  if (!props.selectableCardIds?.length) {
    return true;
  }
  return props.selectableCardIds.includes(cardId);
};

const gridCards = computed(() => {
  const cards = props.field.cards ?? [];
  const columns = cards.length > BASE_COLUMNS * ROWS ? EXPANDED_COLUMNS : BASE_COLUMNS;
  const minSlots = columns * ROWS;
  const requiredSlots = Math.max(
    minSlots,
    Math.ceil(cards.length / columns) * columns
  );

  const placeholders = Array.from({ length: requiredSlots - cards.length }, (_, index) => ({
    id: `empty-slot-${index}`,
    empty: true
  }));

  return [...cards, ...placeholders];
});

const handleSelect = (item) => {
  if (item.empty) {
    return;
  }

  if (props.selectableCardIds?.length && !props.selectableCardIds.includes(item.id)) {
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
    <div class="field-grid" :class="{ expanded: (field.cards?.length ?? 0) > BASE_COLUMNS * ROWS }">
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
          :disabled="!isSelectable(item.id)"
          @click="handleSelect(item)"
        >
          <CardToken
            :card="item"
            size="md"
            :selectable="isSelectable(item.id)"
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
  grid-auto-rows: minmax(104px, 1fr);
  gap: 0.75rem;
}

.field-grid.expanded {
  grid-template-columns: repeat(5, minmax(0, 1fr));
  grid-auto-rows: minmax(96px, 1fr);
  gap: 0.5rem;
}

.field-slot {
  min-height: 96px;
  padding: 0.15rem;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px dashed rgba(15, 23, 42, 0.12);
  border-radius: 0.85rem;
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

.field-card-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
