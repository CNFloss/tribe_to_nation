import "phaser";

export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super("Preloader")
    }

    init() {
        this.readyCount = 0;
    }

    preload() {
        // time event for logo
        this.timedEvent = this.time.delayedCall(2000, this.ready, [], this);
        this.createPreloader();
        this.loadAssets();
    }

    createPreloader() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;

        // add logo
        this.add.image(width / 2, height / 2 -80, "logo");
        
        // display progress bar
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 + 130, 320, 50);

        // loading text
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 + 210,
            text: "Loading...",
            style: {
                font: "20px monospace",
                fill: "#ffffff"
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        // percent text
        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 + 155,
            text: "0%",
            style: {
                font: "18px monospace",
                fill: "#ffffff"
            }
        });
        percentText.setOrigin(0.5, 0.5);

        // loading assets text
        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 100,
            text: "",
            style: {
                font: "18px monospace",
                fill: "#ffffff"
            }
        });
        assetText.setOrigin(0.5, 0.5);

        // update progress bar
        this.load.on("progress", function(value) {
            percentText.setText(parseInt(value * 100) + "%");
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 + 140, 300 * value, 30);
        });

        // update file progress text
        this.load.on("fileprogress", function(file) {
            assetText.setText("Loading assets: " + file.key)
        });

        // remove progress bar when complete
        this.load.on("complete", function() {
            progressBar.destroy();
            progressBox.destroy();
            assetText.destroy();
            loadingText.destroy();
            percentText.destroy();
            this.ready();
        }.bind(this));
    }

    loadAssets() {
        this.load.tilemapTiledJSON("world", "./src/maps/world_map.json");
        this.load.spritesheet("world_tiles", "./src/maps/medieval_tilesheet.png", {frameWidth:32, frameHeight:32});
        this.load.image("game_title", "./src/logo/title_T2E.png");
        this.load.image("studio_title", "./src/logo/title_mandarax.png");
        this.load.image("blueButton1", "./src/ui/blue_button02.png");
        this.load.image("blueButton2", "./src/ui/blue_button03.png");
        this.load.image("crossHair", "./src/ui/cross_hair.png");
        this.load.image("cursor", "./src/ui/cursor.png");
        this.load.image("playButton", "./src/ui/play_button.png");
        this.load.image("planIcon", "./src/ui/plan_icon.png");
        this.load.image("actIcon", "./src/ui/act_icon.png");
        this.load.image("calculateIcon", "./src/ui/calculate_icon.png");
        this.load.image("splitIcon", "./src/ui/split_group_button.png");
        this.load.image("checkmarkIcon", "./src/ui/checkmark_icon.png");
        this.load.image("organizeGroupButton", "./src/ui/organize_group_button.png");
        this.load.image("moveGroupButton", "./src/ui/move_group_button.png");
        this.load.image("uncheckedboxButton", "./src/ui/uncheckedbox_button.png");
        this.load.image("checkedboxButton", "./src/ui/checkedbox_button.png");
        this.load.image("warrior_icon", "./src/ui/warrior_icon.png");
        this.load.image("worker_icon", "./src/ui/worker_icon.png");
        this.load.image("gatherer_icon", "./src/ui/gatherer_icon.png");
        this.load.image("warrior_icon_selected", "./src/ui/warrior_icon_selected.png");
        this.load.image("worker_icon_selected", "./src/ui/worker_icon_selected.png");
        this.load.image("gatherer_icon_selected", "./src/ui/gatherer_icon_selected.png");
        this.load.image("flag_icon", "./src/ui/purple_flag_icon.png");
        this.load.image("flag_icon_selected", "./src/ui/purple_flag_icon_selected.png");
        this.load.image("warrior", "./src/sprites/warrior.png");
        this.load.image("worker", "./src/sprites/worker.png");
        this.load.image("gatherer", "./src/sprites/gatherer.png");
        this.load.image("flag", "./src/sprites/purple_flag.png");
        this.load.audio("intro", "./src/audio/anttisinstrumentals_armadaouttoatlanticv3.mp3");
        //for (var i = 0; i < 1000; i++) {
        //    this.load.image("blueButton2" + i, "./src/ui/blue_button03.png");
        //}
    }

    ready() {
        this.readyCount++;
        if (this.readyCount === 2) {
            this.scene.start("Title");
        }
    }
}