import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { CardSpriteManager } from '../systems/CardSpriteManager.js';
import { HudManager } from '../systems/HudManager.js';

export class Game extends Scene {
  constructor() {
    super('Game');
    this.cardManager = null;
    this.hudManager = null;
    this.pendingSnapshot = null;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x123456);

    this.cardManager = new CardSpriteManager(this, {
      onHandSelect: (card) => {
        EventBus.emit('phaser-hand-card-selected', card);
      },
      onFieldSelect: (card) => {
        EventBus.emit('phaser-field-card-selected', card);
      }
    });

    this.hudManager = new HudManager(this, {
      onAction: (action) => EventBus.emit('phaser-action', action)
    });

    if (this.pendingSnapshot) {
      this.cardManager.updateFromState(this.pendingSnapshot);
      this.hudManager.update(this.pendingSnapshot);
      this.pendingSnapshot = null;
    }

    EventBus.emit('current-scene-ready', this);
  }

  syncSnapshot(snapshot) {
    if (!snapshot) {
      return;
    }

    if (!this.cardManager || !this.hudManager) {
      this.pendingSnapshot = snapshot;
      return;
    }

    this.cardManager.updateFromState(snapshot);
    this.hudManager.update(snapshot);
  }

  changeScene() {
    this.scene.start('GameOver');
  }
}
