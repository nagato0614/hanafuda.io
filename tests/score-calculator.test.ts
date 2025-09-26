import { describe, it, expect } from 'vitest';
import { computePlayerScore } from '../src/domain/game/ScoreCalculator.js';

describe('ScoreCalculator', () => {
  it('applies koikoi multiplier for self declarations', () => {
    const result = computePlayerScore({
      yakuList: [
        { key: 'inoshikacho', name: '猪鹿蝶', points: 5 },
        { key: 'kasu', name: 'カス', points: 1 }
      ],
      selfStatus: { koikoiLevel: 1, koikoiDeclared: true },
      opponentStatus: { koikoiDeclared: false, koikoiLevel: 0 }
    });

    expect(result.base).toBe(6);
    expect(result.multiplier).toBe(2);
    expect(result.total).toBe(12);
  });

  it('applies opponent koikoi penalty', () => {
    const result = computePlayerScore({
      yakuList: [{ key: 'three-lights', name: '三光', points: 5 }],
      selfStatus: { koikoiLevel: 0, koikoiDeclared: false },
      opponentStatus: { koikoiDeclared: true, koikoiLevel: 1 }
    });

    expect(result.multiplier).toBe(2);
    expect(result.total).toBe(10);
  });
});
