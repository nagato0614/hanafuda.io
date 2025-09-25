import { RoundState } from './RoundState.js';

export class GameService {
  constructor({ seed, players } = {}) {
    this.seed = seed;
    this.players = players ?? [
      { id: 'player', name: 'プレイヤー' },
      { id: 'opponent', name: 'CPU 花子' }
    ];
    this.round = null;
  }

  startMatch(config = {}) {
    const seed = config.seed ?? this.seed;
    const playerConfigs = config.players ?? this.players;
    this.round = new RoundState({ seed, players: playerConfigs });
    return this.getSnapshot();
  }

  getSnapshot() {
    if (!this.round) {
      return null;
    }
    return {
      round: this.round.snapshot()
    };
  }

  getCurrentPlayerId() {
    return this.round?.currentPlayerId ?? null;
  }

  getAvailableMoves(playerId) {
    if (!this.round || !playerId) {
      return [];
    }
    return this.round.availableMoves(playerId);
  }

  playCard(move) {
    if (!this.round) {
      throw new Error('Round has not started.');
    }
    this.round.applyMove(move);
    return this.getSnapshot();
  }

  isRoundFinished() {
    return Boolean(this.round?.isComplete());
  }
}
