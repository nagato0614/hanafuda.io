<script setup>
import { computed } from 'vue';

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'md'
  },
  selectable: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Boolean,
    default: false
  }
});

const sizeClassMap = {
  sm: 'card-token-sm',
  md: 'card-token-md',
  lg: 'card-token-lg'
};

const sizeClass = computed(() => sizeClassMap[props.size] ?? sizeClassMap.md);
</script>

<template>
  <div
    class="card-token position-relative"
    :class="[
      sizeClass,
      selectable ? 'card-token-selectable' : '',
      selected ? 'card-token-selected shadow-lg' : ''
    ]"
  >
    <img
      :src="card.image"
      :alt="card.name"
      class="img-fluid rounded-4"
      loading="lazy"
    >
    <div class="card-token-label badge text-bg-dark">
      {{ card.shortLabel ?? card.name }}
    </div>
  </div>
</template>

<style scoped>
.card-token {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-token-selectable:hover {
  transform: translateY(-6px);
  cursor: pointer;
}

.card-token-selected {
  outline: 3px solid #0d6efd;
  outline-offset: 2px;
}

.card-token-sm {
  max-width: 48px;
}

.card-token-md {
  max-width: 72px;
}

.card-token-lg {
  max-width: 96px;
}

.card-token-label {
  font-size: 0.6rem;
  letter-spacing: 0.05em;
  position: absolute;
  bottom: 6px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: fit-content;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
