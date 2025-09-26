import { Field } from './field.js';
import { PlayerState } from './playerState.js';
import { Deck } from './deck.js';
import { cloneCardCollection } from './utils.js';
import { YakuEvaluator } from './YakuEvaluator.js';
import { computePlayerScore, buildRoundPoints } from './ScoreCalculator.js';

const DEFAULT_HAND_SIZE = 8;
const DEFAULT_FIELD_SIZE = 8;
const MAX_REDEAL_ATTEMPTS = 12;

export class RoundState {
  constructor({ seed, players, deckFactory } = {}) {
    if (!Array.isArray(players) || players.length === 0) {
      throw new Error('Players are required to start a round.');
    }
    this._baseSeed = seed;
    this._playerConfigs = players.map((player) => ({ ...player }));
    this._deckFactory = typeof deckFactory === 'function'
      ? deckFactory
      : ({ seed: deckSeed } = {}) => Deck.create({ seed: deckSeed });

    this.turnCount = 0;
    this.history = [];
    this.drawnCardForTurn = null;
    this.redealCount = 0;
    this.pendingKoikoi = null;
    this.roundResult = null;

    this.playerStatus = new Map();
    this.playerYaku = new Map();

    this._initialiseRound();
  }

  _dealInitialCards() {
    for (let i = 0; i < DEFAULT_HAND_SIZE; i += 1) {
      for (const player of this.players) {
        const card = this.deck.draw();
        if (card) {
          player.receiveCard(card);
        }
      }
    }

    for (let i = 0; i < DEFAULT_FIELD_SIZE; i += 1) {
      const card = this.deck.draw();
      if (card) {
        this.field.addCard(card);
      }
    }
  }

  _initialiseRound() {
    for (let attempt = 0; attempt < MAX_REDEAL_ATTEMPTS; attempt += 1) {
      this.turnCount = 0;
      this.history = [];
      this.drawnCardForTurn = null;

      this.deck = this._createDeck(attempt);
      this.players = this._playerConfigs.map((playerConfig) => new PlayerState(playerConfig));
      this.playerOrder = this.players.map((player) => player.id);
      this.playerMap = new Map(this.players.map((player) => [player.id, player]));
      this.field = new Field();
      this.currentPlayerId = this.playerOrder[0] ?? null;

      this._resetPlayerStates();

      this._dealInitialCards();

      const needsRedeal = this._requiresRedeal();
      if (!needsRedeal) {
        this.redealCount = attempt;
        return;
      }
    }

    throw new Error('Unable to produce playable round after maximum redeal attempts.');
  }

  _createDeck(attempt) {
    const seed = this._resolveSeedForAttempt(attempt);
    return this._deckFactory({ seed });
  }

  _resetPlayerStates() {
    this.pendingKoikoi = null;
    this.roundResult = null;
    this.playerStatus = new Map(this.playerOrder.map((playerId) => [playerId, {
      koikoiDeclared: false,
      koikoiLevel: 0,
      koikoiLocked: false,
      totalPoints: 0
    }]));
    this.playerYaku = new Map(this.playerOrder.map((playerId) => [playerId, []]));
  }

  _resolveSeedForAttempt(attempt) {
    if (this._baseSeed === undefined || this._baseSeed === null) {
      return undefined;
    }

    const numericSeed = Number(this._baseSeed);
    if (Number.isFinite(numericSeed)) {
      const base = numericSeed >>> 0;
      return (base + attempt) >>> 0;
    }

    return undefined;
  }

  _requiresRedeal() {
    for (const player of this.players) {
      if (this._hasSameMonthQuad(player.hand)) {
        return { type: 'player-quad', playerId: player.id };
      }
    }

    if (this._hasSameMonthQuad(this.field.cards)) {
      return { type: 'field-quad' };
    }

    return null;
  }

  _hasSameMonthQuad(cards = []) {
    const counts = new Map();
    for (const card of cards) {
      const total = (counts.get(card.month) ?? 0) + 1;
      if (total >= 4) {
        return true;
      }
      counts.set(card.month, total);
    }
    return false;
  }

  getPlayer(playerId) {
    const player = this.playerMap.get(playerId);
    if (!player) {
      throw new Error(`Unknown player: ${playerId}`);
    }
    return player;
  }

  getCurrentPlayer() {
    if (!this.currentPlayerId) {
      return null;
    }
    return this.getPlayer(this.currentPlayerId);
  }

  availableMoves(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) {
      return [];
    }

    if (this.pendingKoikoi) {
      return [];
    }

    if (player.hand.length === 0 && this.deck.remaining > 0) {
      const fallbackCard = this.deck.draw();
      if (fallbackCard) {
        player.receiveCard(fallbackCard);
        this.drawnCardForTurn = { playerId: player.id, cardId: fallbackCard.id };
      }
    }

    if (player.hand.length === 0) {
      return [];
    }

    const moves = [];
    for (const card of player.hand) {
      const matches = this.field.getMatches(card.month);
      if (matches.length === 0) {
        moves.push({
          playerId: player.id,
          handCardId: card.id,
          fieldCardIds: []
        });
        continue;
      }

      for (const match of matches) {
        moves.push({
          playerId: player.id,
          handCardId: card.id,
          fieldCardIds: [match.id]
        });
      }
    }

    return moves;
  }

  applyMove(move) {
    if (this.isComplete()) {
      throw new Error('Round is already complete.');
    }

    if (!move || move.playerId !== this.currentPlayerId) {
      throw new Error('It is not the specified player turn.');
    }

    if (this.pendingKoikoi && this.pendingKoikoi.playerId === move.playerId) {
      throw new Error('Koikoi decision pending for this player.');
    }

    const player = this.getPlayer(move.playerId);
    const playedCard = player.removeHandCard(move.handCardId);

    const matches = this.field.getMatches(playedCard.month);
    let selectedFieldId = null;
    if (matches.length > 0) {
      if (matches.length > 1) {
        if (!move.fieldCardIds || move.fieldCardIds.length === 0) {
          throw new Error('Field selection required when multiple matches exist.');
        }
        selectedFieldId = move.fieldCardIds[0];
      } else {
        selectedFieldId = matches[0].id;
      }
    }

    let capturedFromHand = [];
    if (matches.length === 0) {
      if (move.fieldCardIds && move.fieldCardIds.length > 0) {
        throw new Error('No field matches available for the specified card.');
      }
      this.field.addCard(playedCard);
    } else {
      const captureResult = this.field.placeOrCapture(playedCard, selectedFieldId);
      capturedFromHand = captureResult.captured;
      player.captureCards(capturedFromHand);
    }

    const alreadyDrew = Boolean(this.drawnCardForTurn && this.drawnCardForTurn.playerId === player.id);
    const deckCard = alreadyDrew ? null : this.deck.draw();
    let capturedFromDeck = [];
    if (deckCard) {
      const deckMatches = this.field.getMatches(deckCard.month);
      if (deckMatches.length === 0) {
        this.field.addCard(deckCard);
      } else {
        const chosenFieldCard = deckMatches[0];
        const captureResult = this.field.placeOrCapture(deckCard, chosenFieldCard.id);
        capturedFromDeck = captureResult.captured;
        player.captureCards(capturedFromDeck);
      }
    }

    const captureSummary = {
      capturedFromHand: cloneCardCollection(capturedFromHand),
      capturedFromDeck: cloneCardCollection(capturedFromDeck)
    };

    const evaluation = this._updatePlayerAfterCapture(player.id);
    const status = this.playerStatus.get(player.id);

    const koikoiPrompt = evaluation.newYaku.length > 0;
    if (koikoiPrompt) {
      this.pendingKoikoi = {
        playerId: player.id,
        newYaku: evaluation.newYaku.map((item) => ({ ...item })),
        allYaku: evaluation.allYaku.map((item) => ({ ...item })),
        score: { ...evaluation.score }
      };
      if (status && status.koikoiDeclared && status.koikoiLocked && evaluation.newYaku.length > 0) {
        status.koikoiLocked = false;
      }
    }

    this.turnCount += 1;
    this.drawnCardForTurn = null;

    this.history.push({
      type: 'turn',
      playerId: player.id,
      handCardId: move.handCardId,
      capturedFromHand: captureSummary.capturedFromHand,
      capturedFromDeck: captureSummary.capturedFromDeck,
      newYakuKeys: evaluation.newYaku.map((item) => item.key),
      totalPoints: status?.totalPoints ?? 0
    });

    if (!this.roundResult && this._shouldFinalizeNaturally()) {
      this._finalizeRound({ reason: 'natural-complete' });
    }

    if (!this.roundResult) {
      this._advanceTurn();
    }

    return {
      playerId: player.id,
      ...captureSummary,
      newYaku: evaluation.newYaku,
      allYaku: evaluation.allYaku,
      score: evaluation.score,
      koikoiPrompt,
      pendingKoikoi: this.pendingKoikoi,
      roundEnded: Boolean(this.roundResult),
      result: this.roundResult
    };
  }

  _advanceTurn() {
    if (this.isComplete()) {
      this.currentPlayerId = null;
      return;
    }

    const playerCount = this.playerOrder.length;
    const currentIndex = this.playerOrder.indexOf(this.currentPlayerId);

    for (let offset = 1; offset <= playerCount; offset += 1) {
      const nextIndex = (currentIndex + offset) % playerCount;
      const nextPlayerId = this.playerOrder[nextIndex];
      const nextPlayer = this.getPlayer(nextPlayerId);
      if (nextPlayer.hand.length > 0 || this.deck.remaining > 0) {
        this.currentPlayerId = nextPlayerId;
        return;
      }
    }

    this.currentPlayerId = null;
  }

  _aggregateOpponentStatus(playerId) {
    const others = this.playerOrder.filter((id) => id !== playerId);
    if (others.length === 0) {
      return { koikoiLevel: 0, koikoiDeclared: false };
    }

    let koikoiLevel = 0;
    let koikoiDeclared = false;
    for (const otherId of others) {
      const status = this.playerStatus.get(otherId);
      if (!status) {
        continue;
      }
      koikoiLevel += status.koikoiLevel ?? 0;
      koikoiDeclared = koikoiDeclared || Boolean(status.koikoiDeclared);
    }
    return {
      koikoiLevel,
      koikoiDeclared
    };
  }

  _updatePlayerAfterCapture(playerId) {
    const player = this.getPlayer(playerId);
    const previousYaku = this.playerYaku.get(playerId) ?? [];
    const previousKeys = new Set(previousYaku.map((item) => item.key));
    const yakuList = YakuEvaluator.evaluate(player.captured).map((item) => ({ ...item }));
    const newYaku = yakuList.filter((item) => !previousKeys.has(item.key));

    this.playerYaku.set(playerId, yakuList);

    const status = this.playerStatus.get(playerId);
    if (status) {
      status.hasYaku = yakuList.length > 0;
      const opponentStatus = this._aggregateOpponentStatus(playerId);
      const score = computePlayerScore({
        yakuList,
        selfStatus: status,
        opponentStatus
      });
      status.totalPoints = score.total;
      if (status.koikoiDeclared && status.koikoiLocked && newYaku.length > 0) {
        status.koikoiLocked = false;
      }
      return { allYaku: yakuList, newYaku, score };
    }

    return {
      allYaku: yakuList,
      newYaku,
      score: { base: 0, multiplier: 1, total: 0 }
    };
  }

  _shouldFinalizeNaturally() {
    if (this.roundResult || this.pendingKoikoi) {
      return false;
    }
    if (this.deck.remaining > 0) {
      return false;
    }
    return this.players.every((player) => player.hand.length === 0);
  }

  _snapshotPlayerStatus() {
    return this.playerOrder.map((playerId) => {
      const status = this.playerStatus.get(playerId) ?? {};
      return {
        playerId,
        koikoiDeclared: Boolean(status.koikoiDeclared),
        koikoiLevel: status.koikoiLevel ?? 0,
        koikoiLocked: Boolean(status.koikoiLocked),
        totalPoints: status.totalPoints ?? 0,
        hasYaku: Boolean(status.hasYaku)
      };
    });
  }

  _finalizeRound({ reason, winnerId = null } = {}) {
    if (this.roundResult) {
      return this.roundResult;
    }

    const playerIds = [...this.playerOrder];

    if (!winnerId) {
      const totals = playerIds.map((playerId) => {
        const status = this.playerStatus.get(playerId) ?? {};
        const opponentStatus = this._aggregateOpponentStatus(playerId);
        const score = computePlayerScore({
          yakuList: this.playerYaku.get(playerId) ?? [],
          selfStatus: status,
          opponentStatus
        });
        return { playerId, score };
      });

      const positives = totals.filter((item) => item.score.total > 0);
      if (positives.length > 0) {
        const sorted = [...positives].sort((a, b) => b.score.total - a.score.total);
        const top = sorted[0];
        const second = sorted[1];
        if (!second || top.score.total > second.score.total) {
          winnerId = top.playerId;
        }
      }
    }

    const points = buildRoundPoints({
      playerIds,
      yakuMap: this.playerYaku,
      statusMap: this.playerStatus,
      winnerId
    });

    this.roundResult = {
      reason,
      winnerId: winnerId ?? null,
      points: Array.from(points.entries()).map(([playerId, value]) => ({ playerId, points: value })),
      yaku: playerIds.map((playerId) => ({
        playerId,
        list: (this.playerYaku.get(playerId) ?? []).map((item) => ({ ...item }))
      })),
      statuses: this._snapshotPlayerStatus()
    };

    this.pendingKoikoi = null;
    this.currentPlayerId = null;
    this.history.push({ type: 'round-end', result: this.roundResult });
    return this.roundResult;
  }

  handleKoikoiDecision(playerId, decision) {
    if (!this.pendingKoikoi || this.pendingKoikoi.playerId !== playerId) {
      throw new Error('No Koikoi decision pending for this player.');
    }

    const status = this.playerStatus.get(playerId);
    if (!status) {
      throw new Error(`Unknown player for Koikoi decision: ${playerId}`);
    }

    if (decision === 'continue') {
      status.koikoiDeclared = true;
      status.koikoiLevel = (status.koikoiLevel ?? 0) + 1;
      status.koikoiLocked = true;
      const response = {
        playerId,
        decision,
        result: null,
        level: status.koikoiLevel
      };
      this.history.push({ type: 'koikoi', playerId, decision, level: status.koikoiLevel });
      this.pendingKoikoi = null;
      return response;
    }

    if (decision === 'stop') {
      status.koikoiLocked = false;
      const result = this._finalizeRound({ reason: 'player-stop', winnerId: playerId });
      const response = {
        playerId,
        decision,
        result,
        level: status.koikoiLevel ?? 0
      };
      this.history.push({ type: 'koikoi', playerId, decision, level: status.koikoiLevel ?? 0 });
      this.pendingKoikoi = null;
      return response;
    }

    throw new Error(`Unknown Koikoi decision: ${decision}`);
  }

  isComplete() {
    if (this.roundResult) {
      return true;
    }
    if (this.pendingKoikoi) {
      return false;
    }
    if (this.deck.remaining > 0) {
      return false;
    }
    return this.players.every((player) => player.hand.length === 0);
  }

  snapshot() {
    return {
      currentPlayerId: this.currentPlayerId,
      deckRemaining: this.deck.remaining,
      field: this.field.snapshot(),
      players: this.players.map((player) => player.snapshot()),
      turnCount: this.turnCount,
      isComplete: this.isComplete(),
      pendingKoikoi: this.pendingKoikoi
        ? {
            playerId: this.pendingKoikoi.playerId,
            newYaku: this.pendingKoikoi.newYaku.map((item) => ({ ...item })),
            allYaku: this.pendingKoikoi.allYaku.map((item) => ({ ...item })),
            score: { ...this.pendingKoikoi.score }
          }
        : null,
      playerStatus: this._snapshotPlayerStatus(),
      playerYaku: this.playerOrder.map((playerId) => ({
        playerId,
        list: (this.playerYaku.get(playerId) ?? []).map((item) => ({ ...item }))
      })),
      roundResult: this.roundResult
        ? {
            reason: this.roundResult.reason,
            winnerId: this.roundResult.winnerId,
            points: this.roundResult.points.map((entry) => ({ ...entry })),
            yaku: this.roundResult.yaku.map((entry) => ({
              playerId: entry.playerId,
              list: entry.list.map((item) => ({ ...item }))
            })),
            statuses: this.roundResult.statuses.map((status) => ({ ...status }))
          }
        : null,
      redealCount: this.redealCount
    };
  }
}
