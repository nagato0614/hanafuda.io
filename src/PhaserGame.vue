<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { EventBus } from './game/EventBus';
import StartGame from './game/main';

const props = defineProps({
  state: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['current-active-scene', 'hand-card-selected', 'field-card-selected']);

const scene = ref();
const game = ref();
const busHandlers = [];

const registerBus = (event, handler) => {
  EventBus.on(event, handler);
  busHandlers.push({ event, handler });
};

const cleanupBus = () => {
  busHandlers.forEach(({ event, handler }) => EventBus.off(event, handler));
  busHandlers.length = 0;
};

const syncScene = (snapshot) => {
  if (scene.value && typeof scene.value.syncSnapshot === 'function') {
    scene.value.syncSnapshot(snapshot);
  }
};

onMounted(() => {
  game.value = StartGame('game-container');

  registerBus('current-scene-ready', (currentScene) => {
    scene.value = currentScene;
    syncScene(props.state);
    emit('current-active-scene', currentScene);
  });

  registerBus('phaser-hand-card-selected', (card) => {
  emit('hand-card-selected', card);
  });

  registerBus('phaser-field-card-selected', (card) => {
    emit('field-card-selected', card);
  });

  registerBus('phaser-action', (action) => {
    emit('action-selected', action);
  });
});

onUnmounted(() => {
  cleanupBus();
  if (game.value) {
    game.value.destroy(true);
    game.value = null;
  }
});

watch(
  () => props.state,
  (next) => {
    syncScene(next);
  },
  { deep: true }
);

defineExpose({ scene, game });
</script>

<template>
  <div id="game-container"></div>
</template>
