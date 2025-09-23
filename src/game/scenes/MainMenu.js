import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0xcbe9ff);

        this.add.text(512, 460, '花札こいこい', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setDepth(100).setOrigin(0.5);

        // 何もしないボタン
        const noopButton = this.add.text(512, 540, '対局を始める', {
            fontFamily: 'Arial', fontSize: '28px', color: '#ffffff',
            backgroundColor: '#1e40af',
            padding: { x: 16, y: 10 }
        })
            .setOrigin(0.5)
            .setDepth(100)
            .setInteractive({ useHandCursor: true });

        noopButton.on('pointerover', () => noopButton.setStyle({ backgroundColor: '#2563eb' }));
        noopButton.on('pointerout',  () => noopButton.setStyle({ backgroundColor: '#1e40af' }));
        noopButton.on('pointerdown', () => {
            noopButton.setStyle({ backgroundColor: '#1d4ed8' });
            noopButton.setScale(0.98);
        });
        noopButton.on('pointerup', () => {
            noopButton.setStyle({ backgroundColor: '#2563eb' });
            noopButton.setScale(1);
            // 何もしない
        });

        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('Game');
    }

    moveLogo (vueCallback)
    {
        vueCallback({ x: 512, y: 300 });
    }
}
