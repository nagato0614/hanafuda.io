import { describe, it, expect } from 'vitest';
import { RoundState } from '../../src/domain/game/RoundState.js';

const players = [
  { id: 'player', name: 'プレイヤー' },
  { id: 'opponent', name: 'CPU 花子' }
];

describe('E2E: 花札 1ゲーム通しプレイ', () => {
  it('全手番を進行してラウンドを終了できる', () => {
    const round = new RoundState({ seed: 20240203, players });

    let turns = 0;

    while (!round.roundResult) {
      if (round.pendingKoikoi) {
        round.handleKoikoiDecision(round.pendingKoikoi.playerId, 'stop');
        continue;
      }

      const currentPlayerId = round.currentPlayerId;
      expect(currentPlayerId).toBeTruthy();

      const moves = round.availableMoves(currentPlayerId);
      expect(moves.length).toBeGreaterThan(0);

      const move = moves[0];
      round.applyMove(move);

      turns += 1;
      if (turns > 400) {
        throw new Error('ターン数が上限を超えました。');
      }
    }

    expect(round.roundResult).toBeTruthy();
    expect(round.roundResult?.points.length).toBe(players.length);
    expect(round.roundResult?.winnerId).toBeTruthy();
    expect(round.playerStatus.get(round.roundResult?.winnerId ?? '')?.totalPoints ?? 0).toBeGreaterThan(0);
  });
});
