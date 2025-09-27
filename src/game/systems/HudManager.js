const BASE_TEXT_STYLE = {
  fontFamily: 'sans-serif',
  color: '#f8fafc'
};

const LOG_TEXT_STYLE = {
  fontFamily: 'sans-serif',
  fontSize: '18px',
  color: '#cbd5f5'
};

const BUTTON_CONFIG = {
  primary: { background: 0x2563eb, hover: 0x1d4ed8, text: '#f8fafc' },
  secondary: { background: 0x475569, hover: 0x334155, text: '#f8fafc' }
};

export class HudManager {
  constructor(scene, { onAction } = {}) {
    this.scene = scene;
    this.onAction = onAction;

    this.monthText = scene.add.text(40, 30, '', {
      ...BASE_TEXT_STYLE,
      fontSize: '28px'
    });

    this.turnText = scene.add.text(40, 70, '', {
      ...BASE_TEXT_STYLE,
      fontSize: '22px'
    });

    this.scoreText = scene.add.text(40, 110, '', {
      ...BASE_TEXT_STYLE,
      fontSize: '22px'
    });

    const logBaseY = 870;
    this.logTexts = Array.from({ length: 5 }, (_, index) =>
      scene.add.text(60, logBaseY + index * 24, '', LOG_TEXT_STYLE)
    );

    this.primaryButtons = [];
    this.secondaryButtons = [];
  }

  update(snapshot) {
    if (!snapshot) {
      return;
    }

    const status = snapshot.status ?? {};
    const player = snapshot.player ?? {};
    const opponent = snapshot.opponent ?? {};

    this.monthText.setText(status.monthLabel ?? '');
    this.turnText.setText(status.turnLabel ?? '');

    const scoreLabel = `あなた ${player.totalScore ?? 0} 点 / ${player.roundScore ?? 0} 点 | ${opponent.name ?? 'CPU'} ${opponent.totalScore ?? 0} 点 / ${opponent.roundScore ?? 0} 点`;
    this.scoreText.setText(scoreLabel);

    const logs = snapshot.actions?.logs ?? [];
    for (let i = 0; i < this.logTexts.length; i += 1) {
      const entry = logs[i];
      this.logTexts[i].setText(entry ? `${entry.time ?? ''} ${entry.message ?? ''}` : '');
    }

    this._updateButtons(snapshot.actions ?? { primary: [], secondary: [] });
  }

  _updateButtons(actions) {
    const primary = actions.primary ?? [];
    this._syncButtonGroup(this.primaryButtons, primary, {
      baseY: 860,
      type: 'primary'
    });

    const secondary = actions.secondary ?? [];
    const filtered = secondary.filter((item) => item.key !== 'view-rules');
    this._syncButtonGroup(this.secondaryButtons, filtered, {
      baseY: 904,
      type: 'secondary'
    });

    const ruleButton = secondary.find((item) => item.key === 'view-rules');
    if (ruleButton) {
      const button = this._ensureButton(this.secondaryButtons, this.secondaryButtons.length);
      button.container.setPosition(1220, 940);
      this._applyAction(button, ruleButton, 'secondary');
    }
  }

  _syncButtonGroup(collection, descriptors, { baseY, type }) {
    const spacing = 200;
    const startX = 666;

    descriptors.forEach((action, index) => {
      const button = this._ensureButton(collection, index, type);
      const offsetX = (index - (descriptors.length - 1) / 2) * spacing;
      button.container.setPosition(startX + offsetX, baseY);
      this._applyAction(button, action, type);
    });

    for (let i = descriptors.length; i < collection.length; i += 1) {
      collection[i].container.setVisible(false).disableInteractive();
    }
  }

  _ensureButton(collection, index, type = 'primary') {
    let button = collection[index];
    if (!button) {
      button = this._createButton(type);
      collection[index] = button;
    }
    return button;
  }

  _createButton(type) {
    const { background, hover, text } = BUTTON_CONFIG[type] ?? BUTTON_CONFIG.primary;
    const container = this.scene.add.container(0, 0);
    const rect = this.scene.add.rectangle(0, 0, 180, 56, background, 0.95);
    rect.setStrokeStyle(2, 0xffffff, 0.35);
    rect.setOrigin(0.5);
    const label = this.scene.add.text(0, 0, '', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: text
    }).setOrigin(0.5);

    container.add(rect);
    container.add(label);
    container.setSize(200, 64);

    container.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        rect.setFillStyle(hover, 0.95);
      })
      .on('pointerout', () => {
        rect.setFillStyle(background, 0.95);
      });

    return { container, rect, label, background, hover };
  }

  _applyAction(button, action, type) {
    const { container, rect, label, background, hover } = button;
    const disabled = action?.disabled;

    container.setVisible(true);
    rect.setFillStyle(background, 0.95);
    label.setText(action?.label ?? '');
    label.setColor(BUTTON_CONFIG[type]?.text ?? '#f8fafc');

    container.removeAllListeners('pointerup');
    container.removeAllListeners('pointerout');
    container.removeAllListeners('pointerover');

    container.setInteractive({ useHandCursor: !disabled });
    if (!disabled) {
      container.on('pointerover', () => rect.setFillStyle(hover, 0.95));
      container.on('pointerout', () => rect.setFillStyle(background, 0.95));
      container.on('pointerup', () => {
        this.onAction?.(action);
      });
    } else {
      rect.setFillStyle(0x475569, 0.4);
      container.disableInteractive();
    }
  }
}
