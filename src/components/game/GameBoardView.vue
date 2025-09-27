<script setup>
import { computed } from 'vue';
import PhaserGame from '../../PhaserGame.vue';

const props = defineProps({
  state: {
    type: Object,
    required: true
  },
  sceneKey: {
    type: String,
    default: ''
  },
  selectableFieldIds: {
    type: Array,
    default: () => []
  },
  selectableHandIds: {
    type: Array,
    default: () => []
  }
});

const emits = defineEmits(['scene-ready', 'select-card', 'select-field-card', 'action']);

const handleSceneReady = (scene) => {
  emits('scene-ready', scene);
};

const handlePhaserHandSelect = (card) => {
  if (!card) {
    return;
  }
  const matchCard = props.state.player?.hand?.find((item) => item.id === card.id) ?? card;
  emits('select-card', matchCard);
};

const handlePhaserFieldSelect = (card) => {
  if (!card) {
    return;
  }
  const matchCard = props.state.field?.cards?.find((item) => item.id === card.id) ?? card;
  emits('select-field-card', matchCard);
};

const handlePhaserAction = (action) => {
  emits('action', action);
};

const isGameScene = computed(() => props.sceneKey === 'Game');
</script>

<template>
  <div class="game-board container-fluid py-4">
    <div class="game-stage mx-auto">
      <PhaserGame
        class="phaser-layer"
        :state="state"
        @current-active-scene="handleSceneReady"
        @hand-card-selected="handlePhaserHandSelect"
        @field-card-selected="handlePhaserFieldSelect"
        @action-selected="handlePhaserAction"
      />
      <div class="ui-layer p-3">
        <div v-if="isGameScene" class="game-ui d-flex flex-column gap-3 h-100 justify-content-end" />
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
