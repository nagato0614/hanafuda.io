<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import GameBoardView from './components/game/GameBoardView.vue';
import RuleModal from './components/modals/RuleModal.vue';
import { useUiStateStore } from './stores/uiState';
import { useMatchStore } from './stores/matchStore';

const uiState = useUiStateStore();
const matchStore = useMatchStore();

const { isRuleModalOpen } = storeToRefs(uiState);
const activeScene = ref(null);

const { match, selectableFieldIds, selectableHandIds, sceneKey } = storeToRefs(matchStore);

const gameState = computed(() => match.value);

onMounted(() => {
  matchStore.loadInitialState();
});

const handleSceneReady = (scene) => {
  activeScene.value = scene;
  matchStore.setScene(scene);
};

const handleSelectCard = (card) => {
  matchStore.selectHandCard(card);
};

const handleSelectFieldCard = (card) => {
  matchStore.selectFieldCard(card);
};

const handleAction = async (action) => {
  const result = await matchStore.handleAction(action);
  if (result === 'view-rules') {
    uiState.showRuleModal();
  }
};

</script>

<template>
  <GameBoardView
    v-if="gameState"
    :state="gameState"
    :scene-key="sceneKey"
    :selectable-field-ids="selectableFieldIds"
    :selectable-hand-ids="selectableHandIds"
    @scene-ready="handleSceneReady"
    @select-card="handleSelectCard"
    @select-field-card="handleSelectFieldCard"
    @action="handleAction"
  />

  <RuleModal v-if="isRuleModalOpen" @close="uiState.hideRuleModal()" />
</template>
