import { describe, it, expect } from 'vitest';
import { GameState } from '../../src/application/GameState.js';

function autoPlayTurn(state, move) {
  const fieldTarget = move.fieldCardIds?.[0];
  if (move.playerId === 'player') {
    const result = state.playCards(move.handCardId, fieldTarget);
    expect(result.state).toBeTruthy();
    return result.log;
  }

  state._service.playCard(move);
  return null;
}

describe('E2E: 花札 1ゲーム通しプレイ', () => {
  it('全手番を進行してラウンドを終了できる', () => {
    const state = new GameState({ seed: 20240203 });

    let turns = 0;
    const encounteredLogs = [];

    while (true) {
      const snapshot = state.snapshot();
      expect(snapshot).toBeTruthy();

      const round = state._service.round;
      expect(round).toBeTruthy();

      if (round.isComplete()) {
        break;
      }

      const currentPlayerId = state._service.getCurrentPlayerId();
      expect(currentPlayerId).toBeTruthy();

      const moves = state._service.getAvailableMoves(currentPlayerId);
      expect(moves.length).toBeGreaterThan(0);

      const move = moves[0];
      const log = autoPlayTurn(state, move);
      if (log) {
        encounteredLogs.push(log);
      }

      turns += 1;
      if (turns > 200) {
        throw new Error('ターン数が上限を超えました。');
      }
    }

    const finalSnapshot = state.snapshot();
    expect(finalSnapshot.field.drawPile).toBe(0);
    expect(finalSnapshot.player.hand.length).toBe(0);
    expect(finalSnapshot.player.capturedTotal + finalSnapshot.opponent.capturedTotal).toBeGreaterThan(0);
    expect(turns).toBeGreaterThan(0);

    // TODO: CPUの自動手番処理とログ整備が実装され次第、ログ内容を検証する。
    expect(encounteredLogs.length).toBeGreaterThan(0);
  });
});
