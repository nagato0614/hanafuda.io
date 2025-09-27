import { describe, it, expect, vi } from 'vitest';

vi.mock('phaser', () => {
  class Rectangle {
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
    static Contains() {
      return true;
    }
  }

  const easing = { Out: () => {} };

  const mockPhaser = {
    Geom: { Rectangle },
    Math: { Easing: { Cubic: easing } }
  };

  return {
    default: mockPhaser,
    Geom: { Rectangle },
    Math: { Easing: { Cubic: easing } }
  };
});
import { CardSpriteManager } from '../src/game/systems/CardSpriteManager.js';

class StubElement {
  setOrigin() {
    return this;
  }
  setVisible(flag) {
    this.visible = flag;
    return this;
  }
  setTexture(key) {
    this.textureKey = key;
    return this;
  }
  setTint(tint) {
    this.tint = tint;
    return this;
  }
  setText(text) {
    this.text = text;
    return this;
  }
  setColor(color) {
    this.color = color;
    return this;
  }
}

class StubContainer extends StubElement {
  constructor(x = 0, y = 0) {
    super();
    this.x = x;
    this.y = y;
    this.depth = 0;
    this.children = [];
    this.interactive = true;
    this.listeners = {};
  }
  add(child) {
    this.children.push(child);
    return this;
  }
  setSize() {
    return this;
  }
  setInteractive(hitArea, containsFn, options = {}) {
    this.hitArea = hitArea;
    this.containsFn = containsFn;
    this.useHandCursor = options.useHandCursor;
    this.interactive = true;
    return this;
  }
  disableInteractive() {
    this.interactive = false;
    return this;
  }
  removeAllListeners() {
    this.listeners = {};
  }
  on(event, handler) {
    this.listeners[event] = handler;
    return this;
  }
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
}

class StubScene {
  constructor() {
    this.add = {
      container: (x = 0, y = 0) => new StubContainer(x, y),
      image: () => new StubElement(),
      rectangle: () => new StubElement(),
      text: () => new StubElement()
    };
    this.textures = {
      exists: () => false
    };
    this.tweens = {
      add: ({ targets, x, y, onComplete }) => {
        if (targets) {
          if (typeof x === 'number') {
            targets.x = x;
          }
          if (typeof y === 'number') {
            targets.y = y;
          }
        }
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    };
  }
}

describe('CardSpriteManager hover behavior', () => {
  it('slides card up on hover and resets on exit', () => {
    const scene = new StubScene();
    const manager = new CardSpriteManager(scene);

    const snapshot = {
      player: {
        hand: [{ id: '01-light-crane', shortLabel: '松' }],
        captured: [],
        selectedCardId: null
      },
      opponent: {
        hand: [],
        captured: []
      },
      field: {
        cards: [],
        selectedCardId: null
      },
      meta: {
        handCounts: { player: 1, opponent: 0 },
        selectableHandIds: [],
        selectableFieldIds: []
      }
    };

    manager.updateFromState(snapshot);
    const entry = manager.sprites.get('01-light-crane');
    expect(entry).toBeTruthy();

    const originalY = entry.target.y;
    manager._setHover(entry, true, true);
    expect(entry.container.y).toBeLessThan(originalY);

    manager._setHover(entry, false, true);
    expect(entry.container.y).toBe(originalY);
  });
});
