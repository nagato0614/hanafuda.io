import Phaser from 'phaser';
import { getCardTextureKey, CARD_BACK_KEY } from '../utils/cardAssets.js';

const CARD_WIDTH = 84;
const CARD_HEIGHT = 120;
const HAND_Y_PLAYER = 720;
const HAND_Y_OPPONENT = 220;
const FIELD_CENTER_Y = 460;
const CAPTURED_OFFSET = 40;
const TWEEN_DURATION = 300;
const HOVER_OFFSET = -14;
const TINT_SELECTED = 0xfacc15;
const TINT_SELECTABLE = 0x60a5fa;

function spreadPositions(count, startX, spacing) {
  if (count <= 0) {
    return [];
  }
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

    const context = {
      selectableHands: new Set(snapshot.meta?.selectableHandIds ?? []),
      selectableFields: new Set(snapshot.meta?.selectableFieldIds ?? []),
      selectedHandId: snapshot.player?.selectedCardId ?? null,
      selectedFieldId: snapshot.field?.selectedCardId ?? null
    };

    this._layoutHands(snapshot, used, context);
    this._layoutField(snapshot, used, context);
    this._layoutCaptures(snapshot, used);

    this._cleanupUnused(used);
  }

  _layoutHands(snapshot, used, context) {
    const handCards = snapshot.player?.hand ?? [];
    const playerCount = snapshot.meta?.handCounts?.player ?? handCards.length;
    const opponentCount = snapshot.meta?.handCounts?.opponent ?? 0;

    const playerPositions = spreadPositions(playerCount, 700, CARD_WIDTH + 12);
    handCards.forEach((card, index) => {
      const target = { x: playerPositions[index], y: HAND_Y_PLAYER };
      this._placeCard({
        card,
        faceDown: false,
        target,
        origin: target,
        used,
        depth: 120 + index,
        interactive: true,
        zone: 'hand',
        isSelected: context.selectedHandId === card.id,
        isSelectable: context.selectableHands.has(card.id)
      });
    });

    const opponentPositions = spreadPositions(opponentCount, 700, CARD_WIDTH + 12);
    for (let index = 0; index < opponentCount; index += 1) {
      const syntheticId = `opponent-slot-${index}`;
      const target = { x: opponentPositions[index], y: HAND_Y_OPPONENT };
      this._placeCard({
        card: { id: syntheticId, shortLabel: '裏' },
        faceDown: true,
        target,
        origin: target,
        used,
        depth: 80 + index,
        interactive: false,
        zone: 'opponent',
        isSelected: false,
        isSelectable: false
      });
    }
  }

  _layoutField(snapshot, used, context) {
    const cards = snapshot.field?.cards ?? [];
    const columns = cards.length > 8 ? 5 : 4;
    const rows = 2;
    const spacingX = CARD_WIDTH + 20;
    const spacingY = CARD_HEIGHT + 10;
    const centerX = 700;

    cards.forEach((card, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const offsetX = (column - (columns - 1) / 2) * spacingX;
      const offsetY = (row - (rows - 1) / 2) * spacingY;
      const target = { x: centerX + offsetX, y: FIELD_CENTER_Y + offsetY };

      const origin = row === 0
        ? { x: centerX + offsetX, y: HAND_Y_PLAYER }
        : { x: centerX + offsetX, y: HAND_Y_OPPONENT };

      this._placeCard({
        card,
        faceDown: false,
        target,
        origin,
        used,
        depth: 200 + row * 10 + column,
        interactive: true,
        zone: 'field',
        isSelected: context.selectedFieldId === card.id,
        isSelectable: context.selectableFields.has(card.id)
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
          y: 680 + index * CAPTURED_OFFSET
        };
        this._placeCard({
          card,
          faceDown: false,
          target,
          origin: { x: 700, y: HAND_Y_PLAYER },
          used,
          depth: 60 + groupIdx * 5 + index,
          interactive: false,
          zone: 'captured-player',
          isSelected: false,
          isSelectable: false
        });
      });
    });

    opponentCaptured.forEach((group, groupIdx) => {
      group.cards.forEach((card, index) => {
        const target = {
          x: 1180 - groupIdx * (CARD_WIDTH + 20) - index * 10,
          y: 260 - index * CAPTURED_OFFSET
        };
        this._placeCard({
          card,
          faceDown: true,
          target,
          origin: { x: 700, y: HAND_Y_OPPONENT },
          used,
          depth: 40 + groupIdx * 5 + index,
          interactive: false,
          zone: 'captured-opponent',
          isSelected: false,
          isSelectable: false
        });
      });
    });
  }

  _placeCard({ card, faceDown, target, origin, used, depth, interactive, zone, isSelected, isSelectable }) {
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
    this._applyHighlight(entry, { isSelected, isSelectable });
    this._tweenTo(entry, { ...target, depth });
  }

  _createSprite(card, { faceDown, interactive, zone, origin }) {
    const container = this.scene.add.container(origin.x ?? 0, origin.y ?? 0);

    const frontKey = card?.id && !card.id.startsWith('opponent-slot-') ? getCardTextureKey(card.id) : null;
    let front = null;
    if (frontKey && this.scene.textures.exists(frontKey)) {
      front = this.scene.add.image(0, 0, frontKey).setOrigin(0.5);
      front.displayWidth = CARD_WIDTH;
      front.displayHeight = CARD_HEIGHT;
      container.add(front);
    }

    let back;
    if (this.scene.textures.exists(CARD_BACK_KEY)) {
      back = this.scene.add.image(0, 0, CARD_BACK_KEY).setOrigin(0.5);
      back.displayWidth = CARD_WIDTH;
      back.displayHeight = CARD_HEIGHT;
    } else {
      back = this.scene.add.rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, 0x1e293b, 1).setOrigin(0.5);
    }
    container.add(back);

    const label = this.scene.add.text(0, 0, '', {
      fontSize: '18px',
      fontFamily: 'sans-serif',
      color: '#0f172a',
      align: 'center'
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(CARD_WIDTH, CARD_HEIGHT);

    const entry = { container, front, back, label, target: origin };
    this._updateFace(entry, { faceDown, card });
    this._configureInteractivity(entry, { interactive, zone, card });

    return entry;
  }

  _updateFace(entry, { faceDown, card }) {
    if (!entry) {
      return;
    }

    const hasTextureKey = card?.id && !card.id.startsWith('opponent-slot-');
    const frontKey = hasTextureKey ? getCardTextureKey(card.id) : null;
    const textureExists = frontKey && this.scene.textures.exists(frontKey);

    if (entry.front) {
      if (textureExists) {
        entry.front.setTexture(frontKey);
      }
      entry.front.setVisible(!faceDown && textureExists);
    }

    if (entry.back) {
      entry.back.setVisible(faceDown || !textureExists);
    }

    if (entry.label) {
      if (!textureExists && !faceDown) {
        entry.label.setText(card.shortLabel ?? card.name ?? card.id);
      } else {
        entry.label.setText('');
      }
    }
  }

  _configureInteractivity(entry, { interactive, zone, card }) {
    if (!entry?.container) {
      return;
    }
    entry.container.removeAllListeners();
    entry.interactive = interactive;

    entry.container.setInteractive({ useHandCursor: interactive });
    entry.container.on('pointerover', () => this._setHover(entry, true));
    entry.container.on('pointerout', () => this._setHover(entry, false));
    entry.container.on('pointerup', () => {
      if (!interactive) {
        return;
      }
      if (zone === 'hand') {
        this.onHandSelect?.(card);
      } else if (zone === 'field') {
        this.onFieldSelect?.(card);
      }
    });
  }

  _applyHighlight(entry, { isSelected, isSelectable }) {
    entry.isSelected = isSelected;
    entry.isSelectable = isSelectable;

    const tint = isSelected ? TINT_SELECTED : isSelectable ? TINT_SELECTABLE : 0xffffff;
    entry.front?.setTint(tint);
    entry.back?.setTint(isSelected || isSelectable ? tint : 0xffffff);

    if (entry.label) {
      entry.label.setTint(isSelected ? 0x1f2937 : 0x0f172a);
    }

    if (!entry.interactive) {
      this._setHover(entry, false, true);
    }
  }

  _setHover(entry, hovering, immediate = false) {
    if (!entry?.container || !entry.target) {
      return;
    }

    const offset = hovering ? HOVER_OFFSET : 0;
    const targetY = entry.target.y + offset;

    if (immediate) {
      entry.container.y = targetY;
      return;
    }

    this.scene.tweens.add({
      targets: entry.container,
      y: targetY,
      duration: 120,
      ease: Phaser.Math.Easing.Cubic.Out
    });
  }

  _tweenTo(entry, { x, y, depth }) {
    if (!entry || !entry.container) {
      return;
    }
    entry.target = { x, y };
    entry.container.depth = depth;

    this.scene.tweens.add({
      targets: entry.container,
      x,
      y,
      duration: TWEEN_DURATION,
      ease: Phaser.Math.Easing.Cubic.Out,
      onComplete: () => {
        if (!entry.interactive) {
          entry.container.y = entry.target.y;
        }
      }
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
