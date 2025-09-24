<script setup>
import CardToken from './CardToken.vue';

const props = defineProps({
  title: {
    type: String,
    default: '手札'
  },
  cards: {
    type: Array,
    default: () => []
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

const emits = defineEmits(['select-card']);

const isSelectable = (cardId) => {
  if (!props.selectableCardIds?.length) {
    return true;
  }
  return props.selectableCardIds.includes(cardId);
};

const handleSelect = (card) => {
  if (!isSelectable(card.id)) {
    return;
  }
  emits('select-card', card);
};
</script>

<template>
  <div class="card-koikoi p-3 d-flex flex-column">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h3 class="fs-5 mb-0">{{ title }}</h3>
      <span class="badge text-bg-secondary">{{ cards.length }} 枚</span>
    </div>
    <div class="hand-scroll flex-grow-1">
      <div class="d-flex gap-2 flex-wrap">
        <button
          v-for="card in cards"
          :key="card.id"
          type="button"
          class="btn btn-link p-0 border-0 hand-card-btn"
          :aria-pressed="card.id === selectedCardId"
          :disabled="!isSelectable(card.id)"
          @click="handleSelect(card)"
        >
          <CardToken
            :card="card"
            size="lg"
            :selectable="isSelectable(card.id)"
            :selected="card.id === selectedCardId"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hand-scroll {
  overflow-x: auto;
}

.hand-card-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
