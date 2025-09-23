import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
        // JSではプロパティをconstructor内で初期化
        this.logoTween = null;
        this.logo = null;
    }

    create ()
    {
        this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setDepth(100).setOrigin(0.5);

        // 何もしないボタン
        const noopButton = this.add.text(512, 540, '何もしないボタン', {
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
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }
        this.scene.start('Game');
    }

    moveLogo (vueCallback)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        }
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    vueCallback({
                        x: Math.floor(this.logo.x),
                        y: Math.floor(this.logo.y)
                    });
                }
            });
        }
    }
}
