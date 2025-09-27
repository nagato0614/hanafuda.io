import { cardDefinitionsById } from '../../domain/cards/index.js';

const MONTH_ASSET_SLUG = Object.freeze({
  1: 'pine',
  2: 'plum',
  3: 'cherry',
  4: 'wisteria',
  5: 'iris',
  6: 'peony',
  7: 'bushclover',
  8: 'pampas',
  9: 'chrysanthemum',
  10: 'maple',
  11: 'willow',
  12: 'paulownia'
});

function buildFilename(def) {
  const monthSlug = MONTH_ASSET_SLUG[def.month];
  if (!monthSlug) {
    return null;
  }

  const prefix = `${String(def.month).padStart(2, '0')}-${monthSlug}`;

  switch (def.category) {
    case 'light':
      return `${prefix}-bright.png`;
    case 'animal':
      return `${prefix}-animal.png`;
    case 'ribbon':
      return `${prefix}-ribbon.png`;
    case 'chaff': {
      const suffix = def.id.split('-').at(-1);
      if (suffix === 'a' || suffix === 'b' || suffix === 'c') {
        const variant = suffix === 'b' ? '2' : suffix === 'c' ? '3' : '1';
        return `${prefix}-chaff-${variant}.png`;
      }
      return `${prefix}-chaff.png`;
    }
    default:
      return `${prefix}.png`;
  }
}

export function getCardTextureKey(cardId) {
  return `card-${cardId}`;
}

export function getCardTextureInfo(cardId) {
  const def = cardDefinitionsById[cardId];
  if (!def) {
    return null;
  }
  const filename = buildFilename(def);
  if (!filename) {
    return null;
  }
  return {
    key: getCardTextureKey(cardId),
    filename
  };
}

export const CARD_TEXTURE_INFOS = Object.keys(cardDefinitionsById)
  .map((cardId) => getCardTextureInfo(cardId))
  .filter(Boolean);

export const CARD_BACK_KEY = 'card-back';
