import { GameState } from '../application/GameState.js';

let gameState = new GameState();

export async function fetchGameState() {
  return gameState.snapshot();
}

export async function fetchSelectableFieldCards(handCardId) {
  return gameState.getSelectableFieldCards(handCardId);
}

export async function fetchSelectableHandCards(fieldCardId) {
  return gameState.getSelectableHandCards(fieldCardId);
}

export async function playCards(handCardId, fieldCardId) {
  return gameState.playCards(handCardId, fieldCardId);
}

export function resetBackendState(options = {}) {
  gameState.reset(options);
}

export function setGameConfig(options = {}) {
  gameState.reset(options);
}
