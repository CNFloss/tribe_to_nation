import "phaser";
import CitizenGroup from "./../objects/CitizenGroup.js";
import Citizen from "./../objects/Citizen.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("Game")
    }

    init() {
        this.uiScene = this.scene.get("UI");
        this.stages = {
            plan: true,
            execute: false,
            calculate: false
        }
        this.groupCount = 1;
        this.turn = 1;
        this.turnPlanned = false;
        this.endStage = false;
        this.events.emit("loaded");
    }

    create() {
        this.createMap();
        this.createCursor();
        this.selectedCitizenGroup = new CitizenGroup(this, 320-16, 320-16, null);
        this.selectedCitizenGroup.selected = true;
        var two = new CitizenGroup(this, 320-16, 160-16, null);
        this.citizenGroup = this.physics.add.group({ classType: CitizenGroup, runChildUpdate:true });
        this.citizenGroup.add(this.selectedCitizenGroup);
        this.citizenGroup.add(two);
        this.addCitizen(320-24, 160-16, "warrior", null, two);
        this.addCitizen(320-8, 160-16, "gatherer", null, two);
        this.uiScene.updateGroupUIAlphas();
        this.uiScene.showGroupIcons();
        this.uiScene.updateGroupIcon(this.citizenGroup.getChildren().indexOf(this.selectedCitizenGroup));
        this.uiScene.events.on("playPressed", function() {
            if (this.turnPlanned) {
                console.log("Turn planned: " + this.turnPlanned);
                if (this.stages.plan) {
                    this.uiScene.updatePlayButtonAlpha((this.turnPlanned/2) + 0.5);
                    this.endStage = true;
                }
            };
        }.bind(this));
        this.uiScene.events.on("arrangePressed", function() {
            this.updateGroupActions(this.selectedCitizenGroup, "arrange");
            this.destroyMoveOptions();
            this.uiScene.updateGroupUIAlphas();
        }.bind(this));
        this.uiScene.events.on("movePressed", function() {
            this.updateGroupActions(this.selectedCitizenGroup, "move");
            this.destroyMoveOptions();
            this.uiScene.updateGroupUIAlphas();
        }.bind(this));
        this.uiScene.events.on("tasksPressed", function() {
            this.updateGroupActions(this.selectedCitizenGroup, "tasks");
            this.destroyMoveOptions();
            this.uiScene.updateGroupUIAlphas();
        }.bind(this));
        this.uiScene.events.on("checkboxPressed", function() {
            if (!this.selectedCitizenGroup.actions.split) {
                this.selectedCitizenGroup.assignedAction = !this.selectedCitizenGroup.assignedAction;
                this.uiScene.updateCheckboxTexture();
                this.uiScene.updatePlayButtonAlpha((this.turnPlanned/2) + 0.5);
                console.log("group assigned action: " + this.selectedCitizenGroup.assignedAction);
            }
        }.bind(this));
        this.events.on("has_split", function() {
            this.uiScene.showCitizenIcons();
            this.citizenGroup.runChildUpdate = false;
            this.uiScene.updateGroupUIAlphas();
        }.bind(this));
        this.uiScene.events.on("groupSelected", function(num) {
            console.log(num);
            if (this.citizenGroup.getChildren()[num] !== this.selectedCitizenGroup) {
                this.selectedCitizenGroup.selected = false;
                this.uiScene.updateGroupIcon(this.citizenGroup.getChildren().indexOf(this.selectedCitizenGroup));
                this.selectedCitizenGroup = this.citizenGroup.getChildren()[num];
                this.selectedCitizenGroup.selected = true;
                this.destroyMoveOptions();
                this.uiScene.updateGroupUIAlphas();
                this.uiScene.updateGroupIcon(this.citizenGroup.getChildren().indexOf(this.citizenGroup.getChildren()[num]));
                this.uiScene.showCitizenIcons();
                this.uiScene.updateCheckboxTexture();
            }
        }.bind(this));
        this.uiScene.events.on("citizenSelected", function(num) {
            var name = "citizenIcons" + num;
            var type = this.selectedCitizenGroup.citizens.getChildren()[num].type;
            console.log(num);
            this.uiScene.updateCitizenIcon(name, type);
        }.bind(this));
    }

    update(time, delta) {
        if (this.stages.plan) {
            if (!this.selectedCitizenGroup) {
                for (let i = 0; i < this.citizenGroup.getChildren().length; i++) {
                    if (!this.citizenGroup.getChildren()[i].assignedAction) {
                        this.selectedCitizenGroup = this.citizenGroup.getChildren()[i];
                        i = this.citizenGroup.getChildren().length;
                        this.uiScene.updateGroupUIAlphas();
                    }
                }
            }
            if (this.endStage) {
                this.endStage = false;
                this.stages.plan = false;
                this.stages.execute = true;
                this.destroyMoveOptions();
                this.uiScene.updateTurnIconAlphas();
                return;
            }
            if (!this.moveOptions && !this.selectedCitizenGroup.actions.split) {
                var points = this.generateAvailableStatePoints();
                this.showMoveOptions(points);
            }
            var allAssigned = 0;
            for (let i = 0; i < this.citizenGroup.getChildren().length; i++) {
                if (this.citizenGroup.getChildren()[i].assignedAction) {
                    allAssigned += 1;
                }
            }
            if (allAssigned === this.citizenGroup.getChildren().length && !this.turnPlanned) {
                this.turnPlanned = true;
                this.uiScene.updatePlayButtonAlpha((this.turnPlanned/2) + 0.5);
            } else if (allAssigned < this.citizenGroup.getChildren().length && this.turnPlanned) {
                this.turnPlanned = false;
                this.uiScene.updatePlayButtonAlpha((this.turnPlanned/2) + 0.5);
            }
        } else if (this.stages.execute) {
            if (!this.citizenGroup.runChildUpdate) {
                this.citizenGroup.runChildUpdate = true;
            }
            //console.log("executing turn");
            var executed = 0;
            for (let i = 0; i < this.citizenGroup.getChildren().length; i++) {
                if (this.citizenGroup.getChildren()[i].doneExecuting) {
                    executed += 1;
                    console.log("groups executed actions: " + executed);
                }
            }
            if (this.citizenGroup.getChildren().length === executed) {
                console.log("end execute stage and start calculate stage");
                this.citizenGroup.runChildUpdate = false;
                this.turnPlanned = false;
                this.endStage = true;
            }
            if (this.endStage) {
                this.endStage = false;
                this.stages.execute = false;
                this.stages.calculate = true;
                this.uiScene.updateTurnIconAlphas();
                this.uiScene.updateCheckboxTexture();
            }
        } else if (this.stages.calculate) {
            console.log("calculate stuff and restart cycle", this.citizenGroup.getChildren().length);
            for (var i = 0; i < this.citizenGroup.getChildren().length; i++) {
                this.citizenGroup.getChildren()[i].doneExecuting = false;
                console.log(this.citizenGroup.getChildren()[i].citizens.getChildren().length);
                for (var j = 0; j < this.citizenGroup.getChildren()[i].citizens.getChildren().length; j++) {
                    console.log(this.citizenGroup.getChildren()[i].citizens.getChildren()[j]);
                    if (this.citizenGroup.getChildren()[i].citizens.getChildren()[j].type === "gatherer") {
                        this.citizenGroup.getChildren()[i].currentFoodStockPile += 2;
                        this.events.emit("updateFood", this.citizenGroup.getChildren()[i].currentFoodStockPile);
                    }
                }
            }
            this.endStage = false;
            this.stages.calculate = false;
            this.stages.plan = true;
            this.turnPlanned = false;
            this.turn += 1;
            this.uiScene.updateTurnCounter();
            this.uiScene.updateTurnIconAlphas();
            this.uiScene.updatePlayButtonAlpha((this.turnPlanned/2) + 0.5);
        }
    }

    createCursor() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        this.cursor = this.add.image(0, 0, "cursor");
        this.cursor.setDepth(5);
        this.cursor.alpha = 0;
        this.input.on("pointermove", function(pointer) {
            var y = Math.floor(pointer.y / 32);
            var x = Math.floor(pointer.x / 32);
            this.cursor.setPosition(x*32+16, y*32+16);
            this.cursor.alpha = 0.8;
        }.bind(this));
        this.input.on("pointerdown", function(pointer) {
            this.events.emit("tileSelected", Math.floor(pointer.x/32)*32, Math.floor(pointer.y/32)*32);
            let points = this.generateAvailableStatePoints();
            for (let i = 0; i < points.length; i++) {
                if(points[i].x === Math.floor(pointer.x/32)*32 && points[i].y === Math.floor(pointer.y/32)*32) {
                    this.selectedCitizenGroup.createPath(
                        {x:this.selectedCitizenGroup.x, y:this.selectedCitizenGroup.y},
                        {x:Math.floor(pointer.x/32)*32+16, y:Math.floor(pointer.y/32)*32+16}
                    );
                }
            }
        }.bind(this));
    }

    createMap() {
        // create map
        this.bgMap = this.make.tilemap({ key: "world"});
        // add tileset image
        this.tiles = this.bgMap.addTilesetImage("medieval_tilesheet", "world_tiles");
        // create our background layer
        this.backgroundLayer = this.bgMap.createStaticLayer("ground", this.tiles, 0, 0);
    }

    zoomCamera() {}

    addCitizen(x, y, type, path, group) {
        var citizen = new Citizen(this, x, y, type, path);
        group.citizens.add(citizen);
    }

    showMoveOptions(points) {
        this.moveOptions = this.add.graphics();
        this.moveOptions.setDepth(1);
        this.moveOptions.fillStyle(0x000000, 0.25);
        for (let i = 0; i < points.length; i++) {
            this.moveOptions.fillRect(points[i].x+1, points[i].y+1, 30, 30);
        }
    }

    destroyMoveOptions() {
        if (this.moveOptions) {
            this.moveOptions.destroy();
        }
        this.moveOptions = false;
    }

    updateGroupActions(group, action) {
        if (!group.actions.split) {
            switch (action) {
                case "arrange":
                    group.actions.arrange = true;
                    group.actions.move = false;
                    group.actions.tasks = false;
                    break;
                case "move":
                    group.actions.arrange = false;
                    group.actions.move = true;
                    group.actions.tasks = false;
                    break;
                case "tasks":
                    group.actions.arrange = false;
                    group.actions.move = false;
                    group.actions.tasks = true;
                    break;
            }
        }
    }

    generateAvailableStatePoints() {
        let points = [];
        if (this.selectedCitizenGroup.actions.move) {
            points = [
                {x:this.selectedCitizenGroup.x-16-32, y:this.selectedCitizenGroup.y-16},
                {x:this.selectedCitizenGroup.x-16+32, y:this.selectedCitizenGroup.y-16},
                {x:this.selectedCitizenGroup.x-16, y:this.selectedCitizenGroup.y-16-32},
                {x:this.selectedCitizenGroup.x-16, y:this.selectedCitizenGroup.y-16+32},
                {x:this.selectedCitizenGroup.x-16+32, y:this.selectedCitizenGroup.y-16+32},
                {x:this.selectedCitizenGroup.x-16-32, y:this.selectedCitizenGroup.y-16+32},
                {x:this.selectedCitizenGroup.x-16+32, y:this.selectedCitizenGroup.y-16-32},
                {x:this.selectedCitizenGroup.x-16-32, y:this.selectedCitizenGroup.y-16-32},
                {x:this.selectedCitizenGroup.x-16-64, y:this.selectedCitizenGroup.y-16},
                {x:this.selectedCitizenGroup.x-16+64, y:this.selectedCitizenGroup.y-16},
                {x:this.selectedCitizenGroup.x-16, y:this.selectedCitizenGroup.y-16-64},
                {x:this.selectedCitizenGroup.x-16, y:this.selectedCitizenGroup.y-16+64},
            ];
        }
        if (this.selectedCitizenGroup.actions.arrange) {
            points = [
                {x:this.selectedCitizenGroup.x-16-32, y:this.selectedCitizenGroup.y-16},
                {x:this.selectedCitizenGroup.x-16+32, y:this.selectedCitizenGroup.y-16},
                {x:this.selectedCitizenGroup.x-16, y:this.selectedCitizenGroup.y-16-32},
                {x:this.selectedCitizenGroup.x-16, y:this.selectedCitizenGroup.y-16+32},
            ];
        }
        if (this.selectedCitizenGroup.actions.tasks) {
            points = [
                {x:this.selectedCitizenGroup.x-16, y:this.selectedCitizenGroup.y-16},
                {x:this.selectedCitizenGroup.x-16-32, y:this.selectedCitizenGroup.y-16},
                {x:this.selectedCitizenGroup.x-16+32, y:this.selectedCitizenGroup.y-16},
                {x:this.selectedCitizenGroup.x-16, y:this.selectedCitizenGroup.y-16-32},
                {x:this.selectedCitizenGroup.x-16, y:this.selectedCitizenGroup.y-16+32},
            ];
        }
        return points;
    }
}