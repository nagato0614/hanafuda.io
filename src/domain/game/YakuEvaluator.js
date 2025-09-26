import { CARD_CATEGORIES, RIBBON_COLORS } from '../cards/definitions.js';

const BASE_YAKU = Object.freeze({
  FIVE_LIGHTS: { key: 'five-lights', name: '五光', points: 10 },
  FOUR_LIGHTS: { key: 'four-lights', name: '四光', points: 8 },
  RAIN_FOUR_LIGHTS: { key: 'rain-four-lights', name: '雨四光', points: 7 },
  THREE_LIGHTS: { key: 'three-lights', name: '三光', points: 5 },
  HANAMI_SAKE: { key: 'hanami-sake', name: '花見で一杯', points: 5 },
  TSUKIMI_SAKE: { key: 'tsukimi-sake', name: '月見で一杯', points: 5 },
  INOSHIKACHO: { key: 'inoshikacho', name: '猪鹿蝶', points: 5 },
  RED_RIBBONS: { key: 'red-ribbons', name: '赤短', points: 5 },
  BLUE_RIBBONS: { key: 'blue-ribbons', name: '青短', points: 5 },
  TANE: { key: 'animal-set', name: 'タネ', points: 1 },
  TAN: { key: 'ribbon-set', name: '短冊', points: 1 },
  KASU: { key: 'chaff-set', name: 'カス', points: 1 },
  SAME_MONTH_QUAD: { key: 'month-quad', name: 'くっつき', points: 4 }
});

const REQUIRED_TAGS = Object.freeze({
  HANAMI: { include: ['sakura'], companion: ['sake'] },
  TSUKIMI: { include: ['moon'], companion: ['sake'] },
  INO: 'boar',
  SHIKA: 'deer',
  CHO: 'butterfly'
});

function cloneYaku(yaku, extra = {}) {
  return { ...yaku, ...extra };
}

export class YakuEvaluator {
  static evaluate(cards = []) {
    if (!Array.isArray(cards) || cards.length === 0) {
      return [];
    }

    const categoryBuckets = {
      [CARD_CATEGORIES.LIGHT]: [],
      [CARD_CATEGORIES.ANIMAL]: [],
      [CARD_CATEGORIES.RIBBON]: [],
      [CARD_CATEGORIES.CHAFF]: []
    };

    const monthCounts = new Map();
    const hasTag = new Set();
    const ribbonColorCounts = new Map();

    for (const card of cards) {
      const list = categoryBuckets[card.category];
      if (list) {
        list.push(card);
      }

      monthCounts.set(card.month, (monthCounts.get(card.month) ?? 0) + 1);

      if (card.tags) {
        for (const tag of card.tags) {
          hasTag.add(tag);
        }
      }

      if (card.category === CARD_CATEGORIES.RIBBON) {
        const color = card.ribbonColor ?? RIBBON_COLORS.PLAIN;
        ribbonColorCounts.set(color, (ribbonColorCounts.get(color) ?? 0) + 1);
      }
    }

    const yaku = [];

    // 光札コンボ
    const lights = categoryBuckets[CARD_CATEGORIES.LIGHT];
    if (lights.length >= 3) {
      const hasRain = lights.some((card) => card.tags?.includes('rain'));
      if (lights.length === 5) {
        yaku.push(cloneYaku(BASE_YAKU.FIVE_LIGHTS));
      } else if (lights.length === 4) {
        yaku.push(cloneYaku(hasRain ? BASE_YAKU.RAIN_FOUR_LIGHTS : BASE_YAKU.FOUR_LIGHTS));
      } else if (lights.length >= 3 && !hasRain) {
        yaku.push(cloneYaku(BASE_YAKU.THREE_LIGHTS));
      }
    }

    // 花見 / 月見
    if (hasTag.has(REQUIRED_TAGS.HANAMI.include[0]) && REQUIRED_TAGS.HANAMI.companion.some((tag) => hasTag.has(tag))) {
      yaku.push(cloneYaku(BASE_YAKU.HANAMI_SAKE));
    }

    if (hasTag.has(REQUIRED_TAGS.TSUKIMI.include[0]) && REQUIRED_TAGS.TSUKIMI.companion.some((tag) => hasTag.has(tag))) {
      yaku.push(cloneYaku(BASE_YAKU.TSUKIMI_SAKE));
    }

    // 猪鹿蝶
    if (hasTag.has(REQUIRED_TAGS.INO) && hasTag.has(REQUIRED_TAGS.SHIKA) && hasTag.has(REQUIRED_TAGS.CHO)) {
      yaku.push(cloneYaku(BASE_YAKU.INOSHIKACHO));
    }

    // 赤短/青短
    const redCount = ribbonColorCounts.get(RIBBON_COLORS.RED) ?? 0;
    if (redCount >= 3) {
      yaku.push(cloneYaku(BASE_YAKU.RED_RIBBONS, { points: BASE_YAKU.RED_RIBBONS.points + Math.max(0, redCount - 3) }));
    }

    const blueCount = ribbonColorCounts.get(RIBBON_COLORS.BLUE) ?? 0;
    if (blueCount >= 3) {
      yaku.push(cloneYaku(BASE_YAKU.BLUE_RIBBONS, { points: BASE_YAKU.BLUE_RIBBONS.points + Math.max(0, blueCount - 3) }));
    }

    // 役札セット
    const animalCount = categoryBuckets[CARD_CATEGORIES.ANIMAL].length;
    if (animalCount >= 5) {
      yaku.push(cloneYaku(BASE_YAKU.TANE, { points: BASE_YAKU.TANE.points + Math.max(0, animalCount - 5) }));
    }

    const ribbonCount = categoryBuckets[CARD_CATEGORIES.RIBBON].length;
    if (ribbonCount >= 5) {
      yaku.push(cloneYaku(BASE_YAKU.TAN, { points: BASE_YAKU.TAN.points + Math.max(0, ribbonCount - 5) }));
    }

    const chaffCount = categoryBuckets[CARD_CATEGORIES.CHAFF].length;
    if (chaffCount >= 10) {
      yaku.push(cloneYaku(BASE_YAKU.KASU, { points: BASE_YAKU.KASU.points + Math.max(0, chaffCount - 10) }));
    }

    // 同月4枚
    const hasSameMonth = Array.from(monthCounts.values()).some((value) => value >= 4);
    if (hasSameMonth) {
      yaku.push(cloneYaku(BASE_YAKU.SAME_MONTH_QUAD));
    }

    return yaku;
  }
}

export function sumYakuPoints(yakuList = []) {
  return yakuList.reduce((total, item) => total + (item.points ?? 0), 0);
}
