import { cloneCardCollection } from './utils.js';

export class PlayerState {
  constructor({ id, name }) {
    this.id = id;
    this.name = name;
    this.hand = [];
    this.captured = [];
  }

  receiveCard(card) {
    this.hand.push(card);
  }

  removeHandCard(cardId) {
    const index = this.hand.findIndex((card) => card.id === cardId);
    if (index === -1) {
      throw new Error(`Card ${cardId} not found in hand of ${this.id}`);
    }
    const [card] = this.hand.splice(index, 1);
    return card;
  }

  captureCards(cards) {
    this.captured.push(...cards);
  }

  snapshot() {
    return {
      id: this.id,
      name: this.name,
      hand: cloneCardCollection(this.hand),
      captured: cloneCardCollection(this.captured)
    };
  }
}
