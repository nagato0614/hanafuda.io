<script setup>
import { computed } from 'vue';
import CardToken from './CardToken.vue';

const props = defineProps({
  field: {
    type: Object,
    default: () => ({ slots: [], drawPile: 0, discard: [] })
  }
});

const slots = computed(() => props.field.slots ?? []);
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
    <div class="row row-cols-3 g-3">
      <div class="col" v-for="slot in slots" :key="slot.month">
        <div class="bg-white rounded-4 p-2 shadow-sm h-100">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-semibold">{{ slot.label }}</span>
            <span class="badge text-bg-light text-dark">{{ slot.cards.length }} 枚</span>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <CardToken
              v-for="card in slot.cards"
              :key="card.id"
              :card="card"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.field-area {
  backdrop-filter: blur(6px);
  background-color: rgba(255, 255, 255, 0.95);
}
</style>
