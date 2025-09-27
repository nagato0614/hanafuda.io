import Phaser from 'phaser';

const CARD_WIDTH = 84;
const CARD_HEIGHT = 120;
const HAND_Y_PLAYER = 720;
const HAND_Y_OPPONENT = 220;
const FIELD_CENTER_Y = 460;
const CAPTURED_OFFSET = 40;
const TWEEN_DURATION = 300;

function spreadPositions(count, startX, spacing) {
  const positions = [];
  const totalWidth = spacing * (count - 1);
  const baseX = startX - totalWidth / 2;
  for (let i = 0; i < count; i += 1) {
    positions.push(baseX + spacing * i);
  }
  return positions;
}

export class CardSpriteManager {
  constructor(scene, { onHandSelect, onFieldSelect } = {}) {
    this.scene = scene;
    this.onHandSelect = onHandSelect;
    this.onFieldSelect = onFieldSelect;
    this.sprites = new Map();
  }

  updateFromState(snapshot) {
    if (!snapshot) {
      return;
    }

    const used = new Set();

    used.forEach(() => {});

    this._layoutHands(snapshot, used);
    this._layoutField(snapshot, used);
    this._layoutCaptures(snapshot, used);

    this._cleanupUnused(used);
  }

  _layoutHands(snapshot, used) {
    const hand = snapshot.player?.hand ?? [];
    const handCount = snapshot.meta?.handCounts?.player ?? hand.length;
    const oppCount = snapshot.meta?.handCounts?.opponent ?? 0;

    const playerPositions = spreadPositions(handCount, 700, CARD_WIDTH + 12);
    hand.forEach((card, index) => {
      const target = { x: playerPositions[index], y: HAND_Y_PLAYER };
      this._placeCard({
        card,
        faceDown: false,
        target,
        used,
        depth: 100 + index,
        interactive: true,
        zone: 'hand'
      });
    });

    const opponentPositions = spreadPositions(oppCount, 700, CARD_WIDTH + 12);
    for (let index = 0; index < oppCount; index += 1) {
      const synthetic = { id: `opponent-slot-${index}`, shortLabel: '裏' };
      const target = { x: opponentPositions[index], y: HAND_Y_OPPONENT };
      this._placeCard({
        card: synthetic,
        faceDown: true,
        target,
        used,
        depth: 50 + index,
        interactive: false,
        zone: 'opponent'
      });
    }
  }

  _layoutField(snapshot, used) {
    const cards = snapshot.field?.cards ?? [];
    const columns = cards.length > 8 ? 5 : 4;
    const rows = 2;
    const spacingX = CARD_WIDTH + 20;
    const spacingY = CARD_HEIGHT + 10;
    const startX = 666;
    const startY = FIELD_CENTER_Y;

    cards.forEach((card, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const offsetX = (column - (columns - 1) / 2) * spacingX;
      const offsetY = (row - (rows - 1) / 2) * spacingY;
      const target = { x: startX + offsetX, y: startY + offsetY };
      const origin = row === 0 ? { x: startX + offsetX, y: HAND_Y_PLAYER } : { x: startX + offsetX, y: HAND_Y_OPPONENT };
      this._placeCard({
        card,
        faceDown: false,
        target,
        origin,
        used,
        depth: 200 + row * 10 + column,
        interactive: true,
        zone: 'field'
      });
    });
  }

  _layoutCaptures(snapshot, used) {
    const playerCaptured = snapshot.player?.captured ?? [];
    const opponentCaptured = snapshot.opponent?.captured ?? [];

    playerCaptured.forEach((group, groupIdx) => {
      group.cards.forEach((card, index) => {
        const target = {
          x: 150 + groupIdx * (CARD_WIDTH + 20) + index * 10,
          y: 700 + index * CAPTURED_OFFSET
        };
        this._placeCard({
          card,
          faceDown: false,
          target,
          origin: { x: 700, y: HAND_Y_PLAYER },
          used,
          depth: 60 + groupIdx * 5 + index,
          interactive: false,
          zone: 'captured-player'
        });
      });
    });

    opponentCaptured.forEach((group, groupIdx) => {
      group.cards.forEach((card, index) => {
        const target = {
          x: 1180 - groupIdx * (CARD_WIDTH + 20) - index * 10,
          y: 240 - index * CAPTURED_OFFSET
        };
        this._placeCard({
          card,
          faceDown: true,
          target,
          origin: { x: 700, y: HAND_Y_OPPONENT },
          used,
          depth: 40 + groupIdx * 5 + index,
          interactive: false,
          zone: 'captured-opponent'
        });
      });
    });
  }

  _placeCard({ card, faceDown, target, origin, used, depth, interactive, zone }) {
    if (!card || !card.id) {
      return;
    }

    let entry = this.sprites.get(card.id);
    if (!entry) {
      entry = this._createSprite(card, { faceDown, interactive, zone, origin: origin ?? target });
      this.sprites.set(card.id, entry);
    } else {
      this._updateFace(entry, { faceDown, card });
      this._configureInteractivity(entry, { interactive, zone, card });
    }

    used.add(card.id);
    entry.zone = zone;
    this._tweenTo(entry.container, { ...target, depth });
  }

  _createSprite(card, { faceDown, interactive, zone, origin }) {
    const container = this.scene.add.container(origin.x ?? 0, origin.y ?? 0);
    const rect = this.scene.add.rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, 0xffffff, 0.95);
    rect.setStrokeStyle(2, 0x0d6efd, 0.6);
    rect.setOrigin(0.5);

    const label = this.scene.add.text(0, 0, '', {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#0f172a',
      align: 'center'
    }).setOrigin(0.5);

    container.add(rect);
    container.add(label);
    container.setSize(CARD_WIDTH, CARD_HEIGHT);

    this._updateFace({ container, rect, label }, { faceDown, card });
    this._configureInteractivity({ container, rect, label }, { interactive, zone, card });

    return { container, rect, label };
  }

  _updateFace(entry, { faceDown, card }) {
    if (!entry || !entry.rect || !entry.label) {
      return;
    }
    if (faceDown) {
      entry.rect.setFillStyle(0x1e293b, 0.95);
      entry.label.setText('');
    } else {
      entry.rect.setFillStyle(0xffffff, 0.95);
      entry.label.setText(card.shortLabel ?? card.name ?? card.id);
    }
  }

  _configureInteractivity(entry, { interactive, zone, card }) {
    if (!entry?.container) {
      return;
    }
    entry.container.removeAllListeners();
    if (interactive) {
      entry.container.setInteractive({ useHandCursor: true });
      entry.container.on('pointerup', () => {
        if (zone === 'hand') {
          this.onHandSelect?.(card);
        } else if (zone === 'field') {
          this.onFieldSelect?.(card);
        }
      });
    } else {
      entry.container.disableInteractive();
    }
  }

  _tweenTo(container, { x, y, depth }) {
    if (!container) {
      return;
    }
    container.depth = depth;
    this.scene.tweens.add({
      targets: container,
      x,
      y,
      duration: TWEEN_DURATION,
      ease: Phaser.Math.Easing.Cubic.Out
    });
  }

  _cleanupUnused(used) {
    this.sprites.forEach((entry, key) => {
      if (!used.has(key)) {
        this.scene.tweens.add({
          targets: entry.container,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            entry.container.destroy(true);
          }
        });
        this.sprites.delete(key);
      }
    });
  }
}
