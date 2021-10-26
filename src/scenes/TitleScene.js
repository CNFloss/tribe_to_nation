import "phaser";

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super("Title")
    }

    create() {
        this.createTitle();
        this.createPlayButton();
        this.intro = this.sound.add("intro", {loop:true});
        this.intro.play();
    }

    createTitle() {
        this.titleImage = this.add.image(0, 0, "game_title");
        this.centerObject(this.titleImage, 0.5);
        this.titleImage = this.add.image(0, 0, "studio_title");
        this.centerObject(this.titleImage, 1.8);
    }

    centerObject(gameObject, offset = 0) {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;

        gameObject.x = width / 2;
        gameObject.y = height / 2 - offset * 100;
    }
    
    createPlayButton() {
        // play button
        this.gameButton = this.add.sprite(0, 0, "blueButton1").setInteractive();
        this.centerObject(this.gameButton, -1);

        this.gameText = this.add.text(0, 0, "play", {fontSize: "32px", fill: "#fff"});
        Phaser.Display.Align.In.Center(this.gameText, this.gameButton);

        this.gameButton.on("pointerdown", function(pointer) {
            this.intro.stop();
            this.scene.start("Game");
        }.bind(this));

        this.gameButton.on("pointerover", function(pointer) {
            this.gameButton.setTexture("blueButton2");
        }.bind(this));

        this.gameButton.on("pointerout", function(pointer) {
            this.gameButton.setTexture("blueButton1");
        }.bind(this));
    }
}