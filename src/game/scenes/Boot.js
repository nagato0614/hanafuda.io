import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  Boot scene remains lightweight; no additional assets required at this stage.
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
