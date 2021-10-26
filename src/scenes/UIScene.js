import "phaser";

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({key: "UI", active: true});
    }

    init() {
        this.gameScene = this.scene.get("Game");
        this.citizenIcons = [];
    }

    create() {
        this.setUpUI();
    }

    hideUI() {
        this.cursorIcon.setAlpha(0);
    }

    setUpUI() {
        this.gameScene.events.on("loaded", function() {
            this.createFoodProgressBar();
            this.createCitizenProgressBar();
            this.createPlayButton();
            this.createPlanIcon();
            this.createActIcon();
            this.createCalculateIcon();
            this.createSplitIcon();
            this.createOrganizeButton();
            this.createMoveButton();
            this.createCheckboxButton();
            this.createGroupUIList();
            this.createCitizenUIList();
            this.createTurnCounter();
        }.bind(this));

        this.gameScene.events.on("tileSelected", function(x, y) {
            var foo = this.cameras.main.width-x;
            var bar = this.cameras.main.height-y;
            if (this.selectedTile) {
                this.selectedTile.destroy();
            }
            this.selectedTile = this.add.graphics();
            this.selectedTile.fillStyle("#800080", 0.7);
            this.selectedTile.fillRect(x, y, 32, 32);
   
            this.add.tween({
                targets: this.selectedTile,
                ease: "Power2",
                duration: 1000,
                delay: 0,
                alpha: {
                    getStart: function() { return 0.7; },
                    getEnd: function() { return 0; },
                },
                onComplete: function() {
                    console.log("tile tween ended");
                    this.selectedTile.destroy();
                }.bind(this)
            });
        }.bind(this));

        this.gameScene.events.on("updateFood", function(num, max) {
            var height = this.cameras.main.height;
            this.foodProgressBar.destroy();
            this.foodText.destroy();
            this.foodProgressBar = this.add.graphics();
            this.foodProgressBar.fillStyle(0x65EA0C, 0.8);
            this.foodProgressBar.fillRect(26, height - 62, (num*100)/max, 28);
            this.foodText = this.add.text(40, height - 57, num + " / " + max, {fontSize: "22px", fill: "#000"});
        }.bind(this));

        this.gameScene.events.on("updateCitizenGrowth", function(num, max) {
            var height = this.cameras.main.height;
            this.citizenProgressBar.destroy();
            this.citizenText.destroy();
            this.citizenProgressBar = this.add.graphics();
            this.citizenProgressBar.fillStyle(0x3385FF, 0.8);
            this.citizenProgressBar.fillRect(162, height - 62, (num*100)/max, 28);
            this.citizenText = this.add.text(176, height - 57, num + " / " + max, {fontSize: "22px", fill: "#000"});
        }.bind(this));
    }

    createFoodProgressBar() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        var value = 5;
        this.foodProgressBox = this.add.graphics();
        this.foodProgressBoxBG = this.add.graphics();
        this.foodProgressBar = this.add.graphics();
        this.foodProgressBox.fillStyle(0x222222, 0.6);
        this.foodProgressBox.fillRect(16, height - 72, 120, 48);
        this.foodProgressBoxBG.fillStyle(0xFFFFFF, 1);
        this.foodProgressBoxBG.fillRect(26, height - 62, 100, 28);
        this.foodProgressBar.fillStyle(0x65EA0C, 0.8);
        this.foodProgressBar.fillRect(26, height - 62, 0, 28);
        this.foodText = this.add.text(40, height - 57, "0 / 0", {fontSize: "22px", fill: "#000"});
    }

    createCitizenProgressBar() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        this.citizenProgressBox = this.add.graphics();
        this.citizenProgressBoxBG = this.add.graphics();
        this.citizenProgressBar = this.add.graphics();
        this.citizenProgressBox.fillStyle(0x222222, 0.6);
        this.citizenProgressBox.fillRect(152, height - 72, 120, 48);
        this.citizenProgressBoxBG.fillStyle(0xFFFFFF, 1);
        this.citizenProgressBoxBG.fillRect(162, height - 62, 100, 28);
        this.citizenProgressBar.fillStyle(0x3385FF, 0.8);
        this.citizenProgressBar.fillRect(162, height - 62, 0, 28);
        this.citizenText = this.add.text(176, height - 57, "0 / 0", {fontSize: "22px", fill: "#000"});
    }

    createGroupUIList() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        this.GroupUIList = this.add.graphics();
        this.GroupUIList.fillStyle(0x000000, 0.5);
        this.GroupUIList.fillRect(16, 16, 176, 80);
    }

    createCitizenUIList() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        this.CitizenUIList = this.add.graphics();
        this.CitizenUIList.fillStyle(0x000000, 0.5);
        this.CitizenUIList.fillRect(width - 192, 16, 176, 80);
    }

    createPlayButton() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        this.playButton = this.add.sprite(width - 48, height - 48, "playButton").setInteractive();
        this.playButton.setAlpha(0.5);
        this.playButton.on("pointerdown", function(pointer) {
            this.events.emit("playPressed");
        }.bind(this));
    }

    createPlanIcon() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        this.planIcon = this.add.image(width - 48*4 - 16, height - 48, "planIcon");
        this.planIcon.setAlpha(1);
    }

    createActIcon() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        this.actIcon = this.add.image(width - 48*3 - 16, height - 48, "actIcon");
        this.actIcon.setAlpha(0.5);
    }

    createCalculateIcon() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        this.calculateIcon = this.add.image(width - 48*2 - 16, height - 48, "calculateIcon");
        this.calculateIcon.setAlpha(0.5);
    }

    createSplitIcon() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        this.splitIcon = this.add.image(64, height/2 - 96, "splitIcon");
        this.splitIcon.setAlpha(0.5);
    }

    createMoveButton() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        this.moveButton = this.add.sprite(64, height/2 - 48, "moveGroupButton").setInteractive();
        this.moveButton.setAlpha(0.5);
        this.moveButton.on("pointerdown", function(pointer) {
            this.events.emit("movePressed");
        }.bind(this));
    }

    createOrganizeButton() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        this.organizeButton = this.add.sprite(64, height/2 + 8, "organizeGroupButton").setInteractive();
        this.organizeButton.setAlpha(0.5);
        this.organizeButton.on("pointerdown", function(pointer) {
            this.events.emit("organizePressed");
        }.bind(this));
    }

    createCheckboxButton() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        
        this.checkboxButton = this.add.sprite(width/2 + 96, 32, "uncheckedboxButton").setInteractive();
        this.checkboxButton.on("pointerdown", function(pointer) {
            this.events.emit("checkboxPressed");
        }.bind(this));
    }

    createTurnCounter() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        this.turnCounterText = this.add.text(width/2 - 16, height - 80, "Turn", {fontSize: "32px", fill: "#000"});
        this.turnCounterNumber = this.add.text(width/2 + 16, height - 48, this.gameScene.turn, {fontSize: "32px", fill: "#000"});
    }

    updateGroupUIAlphas() {
        this.splitIcon.setAlpha((this.gameScene.selectedCitizenGroup.actions.split)/2 + 0.5);
        this.organizeButton.setAlpha((this.gameScene.selectedCitizenGroup.actions.arrange)/2 + 0.5);
        this.moveButton.setAlpha((this.gameScene.selectedCitizenGroup.actions.move)/2 + 0.5);
    }

    updateTurnIconAlphas() {
        this.planIcon.setAlpha((this.gameScene.stages.plan)/2 + 0.5);
        this.actIcon.setAlpha((this.gameScene.stages.execute)/2 + 0.5);
        this.calculateIcon.setAlpha((this.gameScene.stages.calculate)/2 + 0.5);
    }

    updateCheckboxTexture() {
        if (this.checkboxButton.texture.key === "uncheckedboxButton" && this.gameScene.selectedCitizenGroup.assignedAction) {
            this.checkboxButton.setTexture("checkedboxButton");
        } else if (this.checkboxButton.texture.key === "checkedboxButton" && !this.gameScene.selectedCitizenGroup.assignedAction) {
            this.checkboxButton.setTexture("uncheckedboxButton");
        } else if (!this.gameScene.selectedCitizenGroup.assignedAction) {
            this.checkboxButton.setTexture("uncheckedboxButton");
        }
    }

    updatePlayButtonAlpha(num) {
        this.playButton.setAlpha(num);
    }

    updateTurnCounter() {
        this.turnCounterNumber.setText(this.gameScene.turn);
    }

    showCitizenIcons() {
        this.destroyCitizenIcons();
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        for (let i = 0; i < this.gameScene.selectedCitizenGroup.citizens.getChildren().length; i++) {
            var temp = "citizenIcons" + i;
            var type = this.gameScene.selectedCitizenGroup.citizens.getChildren()[i].type;
            var icon = type + "_icon";
            this.citizenIcons.push(temp);
            this[temp] = this.add.sprite(width-32-(i*32), 32, icon).setInteractive();
            this[temp].on("pointerdown", function(pointer) {
                this.events.emit("citizenSelected", i, type, temp);
            }.bind(this));
        }
    }

    destroyCitizenIcons() {
        for (let i = 0; i < this.citizenIcons.length; i++) {
            var temp = "citizenIcons" + i;
            this[temp].destroy();
        }
        this.citizenIcons = [];
    }

    showGroupIcons() {
        for (let i = 0; i < this.gameScene.citizenGroup.getChildren().length; i++) {
            var temp = "groupIcons" + i;
            this[temp] = this.add.sprite(32+(i*32), 32, "flag_icon").setInteractive();
            this[temp].on("pointerdown", function(pointer) {
                this.events.emit("groupSelected", i);
            }.bind(this));
        }
    }

    updateGroupIcon(num) {
        var temp = "groupIcons" + num;
        if (this[temp].texture.key === "flag_icon") {
            this[temp].setTexture("flag_icon_selected");
        } else if(this[temp].texture.key === "flag_icon_selected") {
            this[temp].setTexture("flag_icon");
        }
    }

    updateCitizenIcon(name, type) {
        if (this[name].texture.key === type + "_icon") {
            this[name].setTexture(type + "_icon_selected");
        } else if(this[name].texture.key === type + "_icon_selected") {
            this[name].setTexture(type + "_icon");
        }
    }
}