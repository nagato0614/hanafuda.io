import { Scene } from 'phaser';
import { CARD_TEXTURE_INFOS, CARD_BACK_KEY } from '../utils/cardAssets.js';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        this.cameras.main.setBackgroundColor(0xcbe9ff);

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets/hanafuda');

        CARD_TEXTURE_INFOS.forEach(({ key, filename }) => {
            this.load.image(key, filename);
        });
    }

    createCardBackTexture()
    {
        if (this.textures.exists(CARD_BACK_KEY)) {
            return;
        }

        const gfx = this.make.graphics({ x: 0, y: 0, add: false });
        gfx.fillStyle(0x1e293b, 1);
        gfx.fillRoundedRect(0, 0, 84, 120, 8);
        gfx.lineStyle(4, 0xf8fafc, 1);
        gfx.strokeRoundedRect(4, 4, 76, 112, 6);
        gfx.generateTexture(CARD_BACK_KEY, 84, 120);
        gfx.destroy();
    }

    create ()
    {
        this.createCardBackTexture();
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
