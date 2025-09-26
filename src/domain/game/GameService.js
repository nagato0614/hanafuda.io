import { RoundState } from './RoundState.js';

const DEFAULT_TOTAL_ROUNDS = 12;

function normalizeSeed(value, offset = 0) {
  if (value === undefined || value === null) {
    return undefined;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return undefined;
  }
  return (numeric + offset) >>> 0;
}

export class GameService {
  constructor({ seed, players, totalRounds, humanPlayerId } = {}) {
    this.seed = seed;
    this.players = players ?? [
      { id: 'player', name: 'プレイヤー' },
      { id: 'opponent', name: 'CPU 花子' }
    ];
    this.totalRounds = totalRounds ?? DEFAULT_TOTAL_ROUNDS;
    this.humanPlayerId = humanPlayerId ?? 'player';

    this.round = null;
    this._lastRoundSnapshot = null;
    this.matchState = null;
    this._roundSeedOffset = 0;
  }

  startMatch(config = {}) {
    this.seed = config.seed ?? this.seed;
    this.players = config.players ?? this.players;
    this.totalRounds = config.totalRounds ?? this.totalRounds ?? DEFAULT_TOTAL_ROUNDS;
    this.humanPlayerId = config.humanPlayerId ?? this.humanPlayerId ?? (this.players[0]?.id ?? 'player');

    this.matchState = {
      totalRounds: this.totalRounds,
      completedRounds: 0,
      currentRound: 1,
      currentFirstPlayerId: this.players[0]?.id ?? null,
      nextFirstPlayerId: this.players[0]?.id ?? null,
      totals: new Map(this.players.map((player) => [player.id, 0])),
      history: []
    };
    this._roundSeedOffset = 0;
    this._lastRoundSnapshot = null;

    const events = this._startRound({ firstPlayerId: this.matchState.currentFirstPlayerId });
    return {
      snapshot: this.getSnapshot(),
      events
    };
  }

  getSnapshot() {
    if (!this.matchState) {
      return null;
    }
    const roundSnapshot = this.round ? this.round.snapshot() : this._lastRoundSnapshot;
    return {
      match: this._buildMatchSnapshot(),
      round: roundSnapshot
    };
  }

  getCurrentPlayerId() {
    if (!this.round) {
      return null;
    }
    return this.round.currentPlayerId;
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
    if (!move || move.playerId !== this.humanPlayerId) {
      throw new Error('Invalid move: player mismatch.');
    }

    const events = [];
    const result = this.round.applyMove(move);
    events.push({
      type: 'turn',
      playerId: move.playerId,
      actor: 'human',
      move,
      result
    });

    if (result.koikoiPrompt && result.pendingKoikoi) {
      events.push({
        type: 'koikoi-prompt',
        playerId: move.playerId,
        pending: result.pendingKoikoi
      });
    }

    if (result.roundEnded) {
      this._handleRoundCompletion(events);
    } else {
      this._autoPlayIfNeeded(events);
    }

    return {
      events,
      snapshot: this.getSnapshot()
    };
  }

  resolveKoikoi(decision, playerId = this.humanPlayerId) {
    if (!this.round) {
      throw new Error('Round has not started.');
    }
    const pending = this.round.pendingKoikoi;
    if (!pending || pending.playerId !== playerId) {
      throw new Error('No Koikoi decision pending for this player.');
    }

    const events = [];
    const outcome = this.round.handleKoikoiDecision(playerId, decision);
    events.push({
      type: 'koikoi-decision',
      playerId,
      decision,
      result: outcome.result ?? null,
      level: outcome.level
    });

    if (outcome.result) {
      this._handleRoundCompletion(events);
    } else {
      this._autoPlayIfNeeded(events);
    }

    return {
      events,
      snapshot: this.getSnapshot()
    };
  }

  startNextRound() {
    if (!this.matchState) {
      throw new Error('Match has not started.');
    }
    if (this.round && !this.round.roundResult) {
      throw new Error('Current round is still in progress.');
    }
    if (this.matchState.completedRounds >= this.matchState.totalRounds) {
      return {
        events: [],
        snapshot: this.getSnapshot()
      };
    }

    const events = this._startRound({ firstPlayerId: this.matchState.nextFirstPlayerId });
    return {
      events,
      snapshot: this.getSnapshot()
    };
  }

  isRoundFinished() {
    if (!this.round) {
      return false;
    }
    if (this.round.roundResult) {
      return true;
    }
    return this.round.isComplete();
  }

  isMatchFinished() {
    if (!this.matchState) {
      return false;
    }
    return this.matchState.completedRounds >= this.matchState.totalRounds;
  }

  _buildMatchSnapshot() {
    const totals = Array.from(this.matchState.totals.entries()).map(([playerId, points]) => ({
      playerId,
      points
    }));

    return {
      totalRounds: this.matchState.totalRounds,
      completedRounds: this.matchState.completedRounds,
      currentRound: this.matchState.currentRound,
      nextFirstPlayerId: this.matchState.nextFirstPlayerId,
      totals,
      history: this.matchState.history.map((entry) => ({
        round: entry.round,
        result: {
          reason: entry.result.reason,
          winnerId: entry.result.winnerId,
          points: entry.result.points.map((item) => ({ ...item })),
          statuses: entry.result.statuses.map((status) => ({ ...status })),
          yaku: entry.result.yaku.map((item) => ({
            playerId: item.playerId,
            list: item.list.map((yaku) => ({ ...yaku }))
          }))
        }
      })),
      isFinished: this.matchState.completedRounds >= this.matchState.totalRounds
    };
  }

  _startRound({ firstPlayerId } = {}) {
    const events = [];
    const order = this._reorderPlayers(firstPlayerId);
    const seed = normalizeSeed(this.seed, this._roundSeedOffset);
    this.round = new RoundState({ seed, players: order });
    this._lastRoundSnapshot = null;
    this.matchState.currentFirstPlayerId = order[0]?.id ?? null;
    this.matchState.nextFirstPlayerId = this.matchState.currentFirstPlayerId;
    this.matchState.currentRound = this.matchState.completedRounds + 1;

    events.push({
      type: 'round-start',
      round: this.matchState.currentRound,
      firstPlayerId: this.matchState.currentFirstPlayerId,
      redealCount: this.round.redealCount
    });

    this._roundSeedOffset += 1;

    this._autoPlayIfNeeded(events);
    return events;
  }

  _reorderPlayers(firstPlayerId) {
    if (!firstPlayerId) {
      return this.players.map((player) => ({ ...player }));
    }
    const index = this.players.findIndex((player) => player.id === firstPlayerId);
    if (index === -1) {
      return this.players.map((player) => ({ ...player }));
    }
    const before = this.players.slice(index);
    const after = this.players.slice(0, index);
    return [...before, ...after].map((player) => ({ ...player }));
  }

  _autoPlayIfNeeded(events = []) {
    while (this.round) {
      const pending = this.round.pendingKoikoi;
      if (pending) {
        if (pending.playerId === this.humanPlayerId) {
          break;
        }
        const decision = this._decideCpuKoikoi(pending);
        const outcome = this.round.handleKoikoiDecision(pending.playerId, decision);
        events.push({
          type: 'koikoi-decision',
          playerId: pending.playerId,
          decision,
          result: outcome.result ?? null,
          level: outcome.level
        });
        if (outcome.result) {
          this._handleRoundCompletion(events);
          continue;
        }
        continue;
      }

      if (this.round.roundResult) {
        this._handleRoundCompletion(events);
        continue;
      }

      const currentPlayerId = this.round.currentPlayerId;
      if (!currentPlayerId) {
        this._handleRoundCompletion(events);
        continue;
      }

      if (currentPlayerId === this.humanPlayerId) {
        break;
      }

      const moves = this.round.availableMoves(currentPlayerId);
      if (!moves || moves.length === 0) {
        this._handleRoundCompletion(events);
        continue;
      }

      const move = this._chooseCpuMove(moves);
      const result = this.round.applyMove(move);
      events.push({
        type: 'turn',
        playerId: currentPlayerId,
        actor: 'cpu',
        move,
        result
      });

      if (result.koikoiPrompt && result.pendingKoikoi) {
        events.push({
          type: 'koikoi-prompt',
          playerId: currentPlayerId,
          pending: result.pendingKoikoi
        });
      }

      if (result.roundEnded) {
        this._handleRoundCompletion(events);
        continue;
      }
    }
    return events;
  }

  _chooseCpuMove(moves) {
    const captureMove = moves.find((move) => (move.fieldCardIds ?? []).length > 0);
    return captureMove ?? moves[0];
  }

  _decideCpuKoikoi(pending) {
    const basePoints = pending?.score?.base ?? 0;
    if (basePoints >= 7) {
      return 'stop';
    }
    return 'continue';
  }

  _handleRoundCompletion(events) {
    if (!this.round || !this.round.roundResult) {
      return;
    }

    const finishedRoundNumber = this.matchState.currentRound;
    const result = this.round.roundResult;
    this._lastRoundSnapshot = this.round.snapshot();
    events.push({ type: 'round-end', roundNumber: finishedRoundNumber, result });

    for (const entry of result.points) {
      const prev = this.matchState.totals.get(entry.playerId) ?? 0;
      this.matchState.totals.set(entry.playerId, prev + entry.points);
    }

    this.matchState.history.push({
      round: finishedRoundNumber,
      result
    });

    this.matchState.completedRounds += 1;

    if (result.winnerId) {
      this.matchState.nextFirstPlayerId = result.winnerId;
    } else if (this.matchState.currentFirstPlayerId) {
      const order = this.players.map((player) => player.id);
      const index = order.indexOf(this.matchState.currentFirstPlayerId);
      if (index !== -1) {
        const nextIndex = (index + 1) % order.length;
        this.matchState.nextFirstPlayerId = order[nextIndex];
      }
    }

    if (this.matchState.completedRounds >= this.matchState.totalRounds) {
      this.round = null;
      events.push({
        type: 'match-end',
        totals: this._buildMatchSnapshot().totals
      });
      return;
    }

    const nextEvents = this._startRound({ firstPlayerId: this.matchState.nextFirstPlayerId });
    events.push(...nextEvents);
  }
}
