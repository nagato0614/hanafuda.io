import { Field } from './field.js';
import { PlayerState } from './playerState.js';
import { Deck } from './deck.js';
import { cloneCardCollection } from './utils.js';

const DEFAULT_HAND_SIZE = 8;
const DEFAULT_FIELD_SIZE = 8;

export class RoundState {
  constructor({ seed, players }) {
    if (!Array.isArray(players) || players.length === 0) {
      throw new Error('Players are required to start a round.');
    }
    this.deck = Deck.create({ seed });
    this.players = players.map((playerConfig) => new PlayerState(playerConfig));
    this.playerOrder = this.players.map((player) => player.id);
    this.playerMap = new Map(this.players.map((player) => [player.id, player]));
    this.field = new Field();
    this.currentPlayerId = this.playerOrder[0];
    this.turnCount = 0;
    this.history = [];
    this.drawnCardForTurn = null;

    this._dealInitialCards();
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

    this.turnCount += 1;

    this.history.push({
      type: 'turn',
      playerId: player.id,
      handCardId: move.handCardId,
      capturedFromHand: cloneCardCollection(capturedFromHand),
      capturedFromDeck: cloneCardCollection(capturedFromDeck)
    });

    this.drawnCardForTurn = null;
    this._advanceTurn();
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

  isComplete() {
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
      isComplete: this.isComplete()
    };
  }
}
