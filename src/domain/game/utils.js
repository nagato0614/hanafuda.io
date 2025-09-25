import { cardDefinitionsById } from '../cards/index.js';

export function createCardById(cardId) {
  const definition = cardDefinitionsById[cardId];
  if (!definition) {
    throw new ReferenceError(`Unknown card id: ${cardId}`);
  }
  return {
    id: definition.id,
    month: definition.month,
    name: definition.name,
    category: definition.category,
    ribbonColor: definition.ribbonColor ?? null,
    rarity: definition.rarity ?? null,
    isSpecial: Boolean(definition.isSpecial),
    points: Number.isFinite(definition.points) ? definition.points : 0,
    tags: Array.isArray(definition.tags) ? [...definition.tags] : []
  };
}

export function cloneCard(card) {
  return {
    id: card.id,
    month: card.month,
    name: card.name,
    category: card.category,
    ribbonColor: card.ribbonColor ?? null,
    rarity: card.rarity ?? null,
    isSpecial: Boolean(card.isSpecial),
    points: Number.isFinite(card.points) ? card.points : 0,
    tags: Array.isArray(card.tags) ? [...card.tags] : []
  };
}

export function cloneCardCollection(cards) {
  return cards.map((card) => cloneCard(card));
}
