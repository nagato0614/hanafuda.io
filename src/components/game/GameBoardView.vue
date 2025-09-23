<script setup>
import ActionPanel from './ActionPanel.vue';
import CapturedArea from './CapturedArea.vue';
import FieldArea from './FieldArea.vue';
import HandArea from './HandArea.vue';
import StatusBar from './StatusBar.vue';
import PhaserGame from '../../PhaserGame.vue';

const props = defineProps({
  state: {
    type: Object,
    required: true
  }
});

const emits = defineEmits(['scene-ready', 'select-card', 'action']);

const handleSceneReady = (scene) => {
  emits('scene-ready', scene);
};

const handleSelectCard = (card) => {
  emits('select-card', card);
};

const handleAction = (action) => {
  emits('action', action);
};
</script>

<template>
  <div class="game-board container-fluid py-4">
    <div class="game-stage mx-auto">
      <PhaserGame class="phaser-layer" @current-active-scene="handleSceneReady" />
      <div class="ui-layer d-flex flex-column gap-3 p-3">
        <StatusBar :status="state.status" :players="[state.opponent, state.player]" />

        <div class="d-flex flex-grow-1 gap-3">
          <div class="side-panel">
            <CapturedArea
              :owner="state.opponent.name"
              :categories="state.opponent.captured"
            />
          </div>

          <div class="flex-grow-1 d-flex flex-column gap-3">
            <FieldArea :field="state.field" class="flex-grow-1" />
          </div>

          <div class="side-panel">
            <ActionPanel :actions="state.actions" @action="handleAction" />
          </div>
        </div>

        <div class="d-flex gap-3">
          <HandArea
            class="flex-grow-1"
            :cards="state.player.hand"
            :title="`${state.player.name} の手札`"
            :selected-card-id="state.player.selectedCardId"
            @select-card="handleSelectCard"
          />
        </div>

        <div>
          <CapturedArea
            :owner="state.player.name"
            :categories="state.player.captured"
          />
        </div>
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

.side-panel {
  flex: 0 0 240px;
  display: flex;
  flex-direction: column;
}

.container-fluid {
  display: flex;
  justify-content: center;
}
</style>
