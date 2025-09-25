import { cloneCardCollection } from './utils.js';

export class Field {
  constructor() {
    this.cards = [];
    this.discard = [];
  }

  addCard(card) {
    this.cards.push(card);
  }

  removeCard(cardId) {
    const idx = this.cards.findIndex((card) => card.id === cardId);
    if (idx === -1) {
      throw new Error(`Field card not found: ${cardId}`);
    }
    const [removed] = this.cards.splice(idx, 1);
    return removed;
  }

  getMatches(month) {
    return this.cards.filter((card) => card.month === month);
  }

  placeOrCapture(card, selectedCardId = null) {
    const matches = this.getMatches(card.month);

    if (matches.length === 0) {
      this.addCard(card);
      return { captured: [] };
    }

    let targetId = selectedCardId;
    if (!targetId) {
      if (matches.length > 1) {
        throw new Error('Multiple matches found; field selection is required.');
      }
      targetId = matches[0].id;
    }

    if (!matches.some((item) => item.id === targetId)) {
      throw new Error(`Selected field card ${targetId} is not a valid match.`);
    }

    const fieldCard = this.removeCard(targetId);
    return { captured: [card, fieldCard] };
  }

  snapshot() {
    return {
      cards: cloneCardCollection(this.cards),
      discard: cloneCardCollection(this.discard)
    };
  }
}
