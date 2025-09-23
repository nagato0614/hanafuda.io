import { CardBase } from './CardBase.js';
import { CARD_BLUEPRINTS } from './definitions.js';

const buildDefinition = (raw) => {
  const tags = Array.isArray(raw.tags) ? [...raw.tags] : [];
  return Object.freeze({
    ...raw,
    tags: Object.freeze(tags)
  });
};

const registry = {};
const definitionsById = {};
const classesById = {};

for (const blueprint of CARD_BLUEPRINTS) {
  const definition = buildDefinition(blueprint);

  class GeneratedCard extends CardBase {
    constructor() {
      super(definition);
    }

    static get definition() {
      return definition;
    }
  }

  GeneratedCard.displayName = blueprint.className;

  registry[blueprint.className] = GeneratedCard;
  definitionsById[definition.id] = definition;
  classesById[definition.id] = GeneratedCard;
}

export const cardClassRegistry = Object.freeze({ ...registry });
export const cardDefinitionsById = Object.freeze({ ...definitionsById });
export const cardClassesById = Object.freeze({ ...classesById });

export const cardInstances = Object.freeze(
  Object.values(cardClassRegistry).map((CardClass) => new CardClass())
);

export function createCardById(cardId) {
  const CardClass = cardClassesById[cardId];

  if (!CardClass) {
    throw new ReferenceError(`Unknown card id: ${cardId}`);
  }

  return new CardClass();
}

export function listCardsByMonth(month) {
  return cardInstances.filter((card) => card.month === month);
}

export { CardBase } from './CardBase.js';
