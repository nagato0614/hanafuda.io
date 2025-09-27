import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x0f172a);

    const title = this.add.text(666, 320, '花札こいこい', {
      fontSize: '64px',
      fontFamily: 'sans-serif',
      color: '#f8fafc'
    }).setOrigin(0.5);

    const prompt = this.add.text(666, 520, '対局を開始する', {
      fontSize: '32px',
      fontFamily: 'sans-serif',
      color: '#fde68a',
      backgroundColor: '#2563eb',
      padding: { x: 24, y: 12 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        prompt.setStyle({ backgroundColor: '#1d4ed8' });
      })
      .on('pointerout', () => {
        prompt.setStyle({ backgroundColor: '#2563eb' });
      })
      .on('pointerup', () => {
        this.scene.start('Game');
      });

    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    EventBus.emit('current-scene-ready', this);
  }
}
