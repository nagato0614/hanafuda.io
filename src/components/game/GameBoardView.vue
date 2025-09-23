<script setup>
import { computed } from 'vue';
import ActionPanel from './ActionPanel.vue';
import CapturedArea from './CapturedArea.vue';
import FieldArea from './FieldArea.vue';
import HandArea from './HandArea.vue';
import StatusBar from './StatusBar.vue';
import PhaserGame from '../../PhaserGame.vue';
import MainMenuOverlay from '../menu/MainMenuOverlay.vue';

const props = defineProps({
  state: {
    type: Object,
    required: true
  },
  sceneKey: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['scene-ready', 'select-card', 'action', 'start-game']);

const handleSceneReady = (scene) => {
  emits('scene-ready', scene);
};

const handleSelectCard = (card) => {
  emits('select-card', card);
};

const handleAction = (action) => {
  emits('action', action);
};

const handleStartGame = () => {
  emits('start-game');
};

const isGameScene = computed(() => props.sceneKey === 'Game');
</script>

<template>
  <div class="game-board container-fluid py-4">
    <div class="game-stage mx-auto">
      <PhaserGame class="phaser-layer" @current-active-scene="handleSceneReady" />
      <div class="ui-layer p-3">
        <template v-if="isGameScene">
          <div class="game-ui d-flex flex-column gap-3 h-100">
            <StatusBar :status="state.status" :players="[state.opponent, state.player]" />

            <div class="board-center flex-grow-1">
              <CapturedArea
                class="captured-column"
                :owner="state.player.name"
                :categories="state.player.captured"
              />

              <FieldArea :field="state.field" class="board-field flex-grow-1" />

              <CapturedArea
                class="captured-column"
                :owner="state.opponent.name"
                :categories="state.opponent.captured"
              />
            </div>

            <div class="bottom-stack">
              <HandArea
                class="hand-panel"
                :cards="state.player.hand"
                :title="`${state.player.name} の手札`"
                :selected-card-id="state.player.selectedCardId"
                @select-card="handleSelectCard"
              />

              <ActionPanel
                class="action-panel"
                :actions="state.actions"
                @action="handleAction"
              />
            </div>
          </div>
        </template>
        <template v-else-if="sceneKey === 'MainMenu'">
          <MainMenuOverlay @start="handleStartGame" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-stage {
  width: 1332px;
  max-width: 100%;
  height: 999px;
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.25);
}

.phaser-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.ui-layer {
  position: relative;
  z-index: 1;
  height: 100%;
}

.game-ui {
  height: 100%;
}

.board-center {
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: 1.5rem;
  flex: 1 1 auto;
  min-height: 0;
}

.captured-column {
  height: 100%;
}

.board-field {
  min-height: 0;
}

.bottom-stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 0 0 auto;
}

.hand-panel {
  flex: 0 0 auto;
}

.action-panel {
  flex: 0 0 auto;
}

.menu-overlay {
  height: 100%;
}

.container-fluid {
  display: flex;
  justify-content: center;
}
</style>
