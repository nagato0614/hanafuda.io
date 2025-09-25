import { describe, it, expect } from 'vitest';
import { GameService } from '../src/domain/game/GameService.js';

describe('GameService basic round flow', () => {
  it('plays until the draw pile is depleted', () => {
    const service = new GameService({ seed: 42 });
    service.startMatch();

    let guard = 0;

    while (!service.isRoundFinished()) {
      const playerId = service.getCurrentPlayerId();
      expect(playerId).toBeTruthy();

      const moves = service.getAvailableMoves(playerId);
      expect(moves.length).toBeGreaterThan(0);

      const move = moves[0];
      service.playCard(move);

      guard += 1;
      if (guard > 200) {
        throw new Error('Guard exceeded while playing the round.');
      }
    }

    const snapshot = service.getSnapshot();
    expect(snapshot?.round.deckRemaining).toBe(0);
    snapshot?.round.players.forEach((player) => {
      expect(player.hand.length).toBe(0);
    });
    expect(service.isRoundFinished()).toBe(true);
  });
});
