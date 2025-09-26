import { describe, it, expect } from 'vitest';
import { YakuEvaluator, sumYakuPoints } from '../src/domain/game/YakuEvaluator.js';
import { createCardById, cardDefinitionsById } from '../src/domain/cards/index.js';

const lightCards = ['01-light-crane', '03-light-curtain', '08-light-moon', '11-light-rainman', '12-light-phoenix'];

describe('YakuEvaluator', () => {
  it('detects light yaku sets', () => {
    const captured = lightCards.slice(0, 3).map((id) => createCardById(id));
    const yaku = YakuEvaluator.evaluate(captured);

    const keys = yaku.map((item) => item.key);
    expect(keys).toContain('three-lights');
    expect(sumYakuPoints(yaku)).toBeGreaterThan(0);
  });

  it('distinguishes rain four lights', () => {
    const captured = lightCards.slice(0, 4).map((id) => createCardById(id));
    const yaku = YakuEvaluator.evaluate(captured);

    const keys = yaku.map((item) => item.key);
    expect(keys).toContain('rain-four-lights');
  });

  it('awards chaff bonuses for extra cards', () => {
    const chaffIds = Object.keys(cardDefinitionsById)
      .filter((key) => cardDefinitionsById[key].category === 'chaff')
      .slice(0, 11);

    const cards = chaffIds.map((id) => createCardById(id));

    const yaku = YakuEvaluator.evaluate(cards);
    const target = yaku.find((item) => item.key === 'chaff-set');
    expect(target).toBeTruthy();
    expect(target?.points).toBe(2);
  });

  it('detects boar deer butterfly set', () => {
    const cards = ['07-animal-boar', '10-animal-deer', '06-animal-butterfly'].map((id) => createCardById(id));
    const yaku = YakuEvaluator.evaluate(cards);
    expect(yaku.some((item) => item.key === 'inoshikacho')).toBe(true);
  });
});
