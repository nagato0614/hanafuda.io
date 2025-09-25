import { Random } from './random.js';
import { createCardById } from './utils.js';
import { cardDefinitionsById } from '../cards/index.js';

export class Deck {
  constructor(cards, rng = new Random()) {
    this._rng = rng;
    this._cards = [...cards];
  }

  static create({ seed } = {}) {
    const rng = new Random(seed);
    const cards = Object.keys(cardDefinitionsById).map((cardId) => createCardById(cardId));
    const shuffled = rng.shuffle(cards);
    return new Deck(shuffled, rng);
  }

  draw() {
    if (this._cards.length === 0) {
      return null;
    }
    return this._cards.shift();
  }

  get remaining() {
    return this._cards.length;
  }

  toJSON() {
    return {
      remaining: this.remaining
    };
  }
}
