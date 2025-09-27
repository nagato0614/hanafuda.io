import { describe, it, expect } from 'vitest';
import { GameService } from '../src/domain/game/GameService.js';

describe('GameService basic round flow', () => {
  it('plays until the draw pile is depleted', async () => {
    const service = new GameService({ seed: 42, totalRounds: 1, cpuThinkDelay: 0 });
    await service.startMatch();

    let guard = 0;

    while (!service.isMatchFinished()) {
      const round = service.round;
      if (!round) {
        break;
      }

      if (round.pendingKoikoi) {
        if (round.pendingKoikoi.playerId === 'player') {
          await service.resolveKoikoi('stop');
        } else {
          await service.advanceCpuTurn();
        }
      } else {
        const playerId = service.getCurrentPlayerId();
        if (playerId !== 'player') {
          await service.advanceCpuTurn();
        } else {
          const moves = service.getAvailableMoves(playerId);
          expect(moves.length).toBeGreaterThan(0);
          await service.playCard(moves[0]);
          await service.advanceCpuTurn();
        }
      }

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
