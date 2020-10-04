import "phaser";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super("Boot")
    }

    preload() {
        this.load.image("logo", "./src/logo/mandarax_games_logo.png");
        this.load.image("logo2", "./src/logo/phaser_logo.png");
    }

    create() {
        this.scene.start("Preloader");
    }
}