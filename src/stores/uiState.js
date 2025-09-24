import { defineStore } from 'pinia';
import { ref } from 'vue';

// ルールモーダルなど Vue 側の UI 状態を扱うストア
export const useUiStateStore = defineStore('uiState', () => {
  const isRuleModalOpen = ref(false);

  const showRuleModal = () => {
    isRuleModalOpen.value = true;
  };

  const hideRuleModal = () => {
    isRuleModalOpen.value = false;
  };

  return {
    isRuleModalOpen,
    showRuleModal,
    hideRuleModal
  };
});
