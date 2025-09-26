import { describe, it, expect } from 'vitest';
import { GameService } from '../src/domain/game/GameService.js';

describe('GameService basic round flow', () => {
  it('plays until the draw pile is depleted', () => {
    const service = new GameService({ seed: 42, totalRounds: 1 });
    service.startMatch();

    let guard = 0;

    while (!service.isMatchFinished()) {
      const round = service.round;
      if (!round) {
        break;
      }

      if (round.pendingKoikoi) {
        const pending = round.pendingKoikoi;
        service.resolveKoikoi('stop', pending.playerId);
        guard += 1;
        if (guard > 200) {
          throw new Error('Guard exceeded while resolving Koikoi.');
        }
        continue;
      }

      const playerId = service.getCurrentPlayerId();
      if (playerId !== 'player') {
        service._autoPlayIfNeeded?.([]);
        guard += 1;
        if (guard > 200) {
          throw new Error('Guard exceeded while advancing CPU turn.');
        }
        continue;
      }

      const moves = service.getAvailableMoves(playerId);
      expect(moves.length).toBeGreaterThan(0);

      const move = moves[0];
      service.playCard(move);

      guard += 1;
      if (guard > 400) {
        throw new Error('Guard exceeded while playing the round.');
      }
    }

    const snapshot = service.getSnapshot();
    expect(service.isMatchFinished()).toBe(true);
    expect(snapshot?.match.history.length).toBeGreaterThan(0);
  });
});
