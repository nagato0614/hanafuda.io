<script setup>
import { computed, ref, watch } from 'vue';
import CardToken from './CardToken.vue';

const props = defineProps({
  owner: {
    type: String,
    default: ''
  },
  categories: {
    type: Array,
    default: () => []
  },
  align: {
    type: String,
    default: 'horizontal'
  }
});

const activeKey = ref(null);

watch(
  () => props.categories,
  (categories) => {
    if (!categories?.length) {
      activeKey.value = null;
      return;
    }

    if (!categories.some((category) => category.key === activeKey.value)) {
      activeKey.value = categories[0].key;
    }
  },
  { immediate: true }
);

const activeCategory = computed(() =>
  props.categories.find((category) => category.key === activeKey.value)
);
</script>

<template>
  <div class="card-koikoi p-3 h-100 d-flex flex-column">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h3 class="fs-6 mb-0">{{ owner }} の獲得札</h3>
      <span class="badge text-bg-info" v-if="activeCategory">
        {{ activeCategory.cards.length }} 枚
      </span>
    </div>
    <ul class="nav nav-pills gap-2 mb-3">
      <li
        v-for="category in categories"
        :key="category.key"
        class="nav-item"
      >
        <button
          class="nav-link"
          :class="{ active: category.key === activeKey }"
          type="button"
          @click="activeKey = category.key"
        >
          {{ category.label }}
          <span class="badge text-bg-light ms-2">{{ category.cards.length }}</span>
        </button>
      </li>
    </ul>
    <div class="captured-grid flex-grow-1">
      <div class="row row-cols-auto g-2" v-if="activeCategory">
        <div
          v-for="card in activeCategory.cards"
          :key="card.id"
          class="col"
        >
          <CardToken :card="card" size="md" />
        </div>
      </div>
      <div v-else class="text-muted small">表示する札がありません。</div>
    </div>
  </div>
</template>

<style scoped>
.captured-grid {
  overflow-y: auto;
}
</style>
