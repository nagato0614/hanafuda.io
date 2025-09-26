import { describe, it, expect } from 'vitest';
import { RoundState } from '../src/domain/game/RoundState.js';
import { createCardById } from '../src/domain/cards/index.js';

describe('RoundState Koikoi handling', () => {
  const players = [
    { id: 'player', name: 'プレイヤー' },
    { id: 'opponent', name: 'CPU 花子' }
  ];

  it('finalizes round when player chooses to stop after forming a yaku', () => {
    const round = new RoundState({ players });
    const player = round.getPlayer('player');

    player.captureCards([
      createCardById('01-light-crane'),
      createCardById('03-light-curtain'),
      createCardById('08-light-moon')
    ]);

    const evaluation = round._updatePlayerAfterCapture('player');
    expect(evaluation.newYaku.length).toBeGreaterThan(0);

    round.pendingKoikoi = {
      playerId: 'player',
      newYaku: evaluation.newYaku,
      allYaku: evaluation.allYaku,
      score: evaluation.score
    };

    const outcome = round.handleKoikoiDecision('player', 'stop');
    expect(outcome.result).toBeTruthy();
    expect(round.roundResult).toBeTruthy();
    expect(round.roundResult?.winnerId).toBe('player');
  });
});
