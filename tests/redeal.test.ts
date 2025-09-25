import { describe, it, expect } from 'vitest';
import { RoundState } from '../src/domain/game/RoundState.js';
import { cardDefinitionsById, createCardById } from '../src/domain/cards/index.js';

type DeckCardId = keyof typeof cardDefinitionsById;

const allCardIds = Object.keys(cardDefinitionsById) as DeckCardId[];

function cardsOfMonth(month: number): DeckCardId[] {
  return allCardIds.filter((id) => cardDefinitionsById[id].month === month);
}

class StubDeck {
  private cards: ReturnType<typeof createCardById>[];

  constructor(order: DeckCardId[]) {
    const seen = new Set<DeckCardId>();
    this.cards = order.map((id) => {
      seen.add(id);
      return createCardById(id);
    });

    for (const id of allCardIds) {
      if (!seen.has(id)) {
        this.cards.push(createCardById(id));
      }
    }
  }

  draw() {
    return this.cards.shift() ?? null;
  }

  get remaining() {
    return this.cards.length;
  }
}

function buildDeck(order: DeckCardId[]) {
  return new StubDeck(order);
}

describe('RoundState 再配札条件', () => {
  const players = [
    { id: 'player', name: 'プレイヤー' },
    { id: 'opponent', name: 'CPU 花子' }
  ];

  it('プレイヤーの手札に同月4枚が揃った場合は再配札する', () => {
    const month1 = cardsOfMonth(1);
    const month2 = cardsOfMonth(2);

    const badOrder: DeckCardId[] = [
      month1[0],
      month2[0],
      month1[1],
      month2[1],
      month1[2],
      month2[2],
      month1[3],
      month2[3]
    ];

    const goodOrder: DeckCardId[] = [
      month1[0],
      month2[0],
      cardsOfMonth(3)[0],
      cardsOfMonth(4)[0],
      cardsOfMonth(5)[0],
      cardsOfMonth(6)[0],
      cardsOfMonth(7)[0],
      cardsOfMonth(8)[0]
    ];

    let callCount = 0;
    const deckFactory = () => {
      callCount += 1;
      return buildDeck(callCount === 1 ? badOrder : goodOrder);
    };

    const round = new RoundState({ players, deckFactory });

    expect(callCount).toBe(2);
    expect(round.redealCount).toBe(1);

    const playerHandMonths = round.getPlayer('player').hand.map((card) => card.month);
    const monthCounts = playerHandMonths.reduce((acc, month) => {
      acc.set(month, (acc.get(month) ?? 0) + 1);
      return acc;
    }, new Map<number, number>());

    expect(Math.max(...monthCounts.values())).toBeLessThan(4);
  });

  it('場札が同月4枚揃った場合は再配札する', () => {
    const month6 = cardsOfMonth(6);
    const month7 = cardsOfMonth(7);
    const month8 = cardsOfMonth(8);
    const month9 = cardsOfMonth(9);

    const prefix: DeckCardId[] = [];
    const playerCardSources = [1, 2, 3, 4, 5, 7, 8, 9];
    for (const month of playerCardSources) {
      const cards = cardsOfMonth(month);
      prefix.push(cards[0], cards[1]);
    }

    const badOrder: DeckCardId[] = [
      ...prefix,
      month6[0],
      month6[1],
      month6[2],
      month6[3],
      cardsOfMonth(10)[2],
      cardsOfMonth(11)[2],
      cardsOfMonth(12)[2],
      cardsOfMonth(3)[2]
    ];

    const goodOrder: DeckCardId[] = [
      ...prefix,
      month6[0],
      month7[2],
      month8[2],
      month9[2],
      cardsOfMonth(10)[2],
      cardsOfMonth(11)[2],
      cardsOfMonth(12)[2],
      cardsOfMonth(3)[2]
    ];

    let callCount = 0;
    const deckFactory = () => {
      callCount += 1;
      return buildDeck(callCount === 1 ? badOrder : goodOrder);
    };

    const round = new RoundState({ players, deckFactory });

    expect(callCount).toBe(2);
    expect(round.redealCount).toBe(1);

    const fieldMonths = round.field.cards.map((card) => card.month);
    const counts = fieldMonths.reduce((acc, month) => {
      acc.set(month, (acc.get(month) ?? 0) + 1);
      return acc;
    }, new Map<number, number>());

    expect(Math.max(...counts.values())).toBeLessThan(4);
  });
});
