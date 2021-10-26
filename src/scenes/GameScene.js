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
        this.turn = 1;
        this.clickNum = 0;
        this.turnPlanned = false;
        this.endStage = false;
        this.pointerdown = false;
        this.pointermoving = false;
        this.oldPointerX = false;
        this.oldPointerY = false;
        this.events.emit("loaded");
    }

    create() {
        this.createMap();
        this.createCursor();
        this.zoomCamera();
        this.citizenGroup = this.physics.add.group({ classType: CitizenGroup, runChildUpdate:true });
        this.selectedCitizenGroup = new CitizenGroup(this, 320-16, 160-16, null);
        this.selectedCitizenGroup.selected = true;
        this.citizenGroup.add(this.selectedCitizenGroup);
        this.addCitizen(320-16, 160-16, "warrior", null, this.selectedCitizenGroup);
        this.addCitizen(320-16, 160-16, "gatherer", null, this.selectedCitizenGroup);
        this.addCitizen(320-16, 160-16, "gatherer", null, this.selectedCitizenGroup);
        let two = new CitizenGroup(this, 160-16, 160-16, null);
        this.addCitizen(160-16, 160-16, "warrior", null, two);
        this.addCitizen(160-16, 160-16, "gatherer", null, two);
        this.citizenGroup.add(two);
        this.uiScene.updateGroupUIAlphas();
        this.uiScene.showGroupIcons();
        this.uiScene.showCitizenIcons();
        this.uiScene.updateGroupIcon(this.citizenGroup.getChildren().indexOf(this.selectedCitizenGroup));
        this.setupUIEvents();
    }

    update(time, delta) {
        this.pointermoving = false;
        if (this.stages.plan) {
            if (!this.selectedCitizenGroup) {
                for (let i = 0; i < this.citizenGroup.getChildren().length; i++) {
                    if (!this.citizenGroup.getChildren()[i].assignedAction) {
                        this.selectedCitizenGroup = this.citizenGroup.getChildren()[i];
                        this.selectedCitizenGroup.selected = true;
                        this.destroyMoveOptions();
                        this.uiScene.updateGroupUIAlphas();
                        this.uiScene.updateGroupIcon(this.citizenGroup.getChildren().indexOf(this.selectedCitizenGroup));
                        this.uiScene.showCitizenIcons();
                        this.uiScene.updateCheckboxTexture();
                        i = this.citizenGroup.getChildren().length;
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
            var allGroupsAssigned = 0;
            if (this.selectedCitizenGroup.actions.tasks || this.selectedCitizenGroup.actions.arrange) {
                var allCitizensAssigned = 0;
                for (let i = 0; i < this.selectedCitizenGroup.citizens.getChildren().length; i++) {
                    if (this.selectedCitizenGroup.citizens.getChildren()[i].assignedAction) {
                        allCitizensAssigned += 1;
                    }
                }
                if (allCitizensAssigned === this.selectedCitizenGroup.citizens.getChildren().length) {
                    this.selectedCitizenGroup.assignedAction = true;
                    this.uiScene.updateCheckboxTexture();
                }
            }
            for (let i = 0; i < this.citizenGroup.getChildren().length; i++) {
                if (this.citizenGroup.getChildren()[i].assignedAction) {
                    allGroupsAssigned += 1;
                }
            }
            if (allGroupsAssigned === this.citizenGroup.getChildren().length && !this.turnPlanned) {
                this.turnPlanned = true;
                this.uiScene.updatePlayButtonAlpha((this.turnPlanned/2) + 0.5);
            } else if (allGroupsAssigned < this.citizenGroup.getChildren().length && this.turnPlanned) {
                this.turnPlanned = false;
                this.uiScene.updatePlayButtonAlpha((this.turnPlanned/2) + 0.5);
            }
        } else if (this.stages.execute) {
            if (!this.citizenGroup.runChildUpdate) {
                this.citizenGroup.runChildUpdate = true;
            }
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
                // reset each group
                this.citizenGroup.getChildren()[i].doneExecuting = false;
                for (var j = 0; j < this.citizenGroup.getChildren()[i].citizens.getChildren().length; j++) {
                    this.citizenGroup.getChildren()[i].citizens.getChildren()[j].doneExecuting = false;
                    if (this.citizenGroup.getChildren()[i].citizens.getChildren()[j].tasks.idle) {
                        this.citizenGroup.getChildren()[i].citizens.getChildren()[j].assignedAction = false;
                    }
                    // penalize group for each citizen
                    this.citizenGroup.getChildren()[i].currentFoodStockPile -= 1;
                    if (this.citizenGroup.getChildren()[i].citizens.getChildren()[j].type === "gatherer") {
                        // add food to stockpile
                        this.citizenGroup.getChildren()[i].currentFoodStockPile += this.citizenGroup.getChildren()[i].citizens.getChildren()[j].haul;
                        // check if stockpile equals or exceeds max
                        if (this.citizenGroup.getChildren()[i].currentFoodStockPile > this.citizenGroup.getChildren()[i].maxFoodStockPile) {
                            // carry over excess stockpile
                            this.citizenGroup.getChildren()[i].currentFoodStockPile = this.citizenGroup.getChildren()[i].currentFoodStockPile - this.citizenGroup.getChildren()[i].maxFoodStockPile;
                            // increase max stockpile and add to citizen growth
                            this.citizenGroup.getChildren()[i].maxFoodStockPile += 2;
                            this.citizenGroup.getChildren()[i].currentCitizenGrowth += 2;
                        }
                    }
                }
            }
            // clean up stage and render UI
            this.endStage = false;
            this.stages.calculate = false;
            this.stages.plan = true;
            this.turnPlanned = false;
            this.turn += 1;
            this.selectedCitizenGroup.selected = false;
            this.uiScene.updateGroupIcon(this.citizenGroup.getChildren().indexOf(this.selectedCitizenGroup));
            this.selectedCitizenGroup = this.citizenGroup.getChildren()[0];
            this.selectedCitizenGroup.selected = true;
            this.uiScene.updateGroupUIAlphas();
            this.uiScene.updateGroupIcon(this.citizenGroup.getChildren().indexOf(this.citizenGroup.getChildren()[0]));
            this.uiScene.showCitizenIcons();
            var index = this.selectedCitizenGroup.citizens.getChildren().indexOf(this.selectedCitizenGroup.selectedCitizen);
            var type = this.selectedCitizenGroup.citizens.getChildren()[index].type;
            this.uiScene.updateCitizenIcon("citizenIcons"+index, type);
            this.updateFoodBar(0);
            this.updateCitizenGrowthBar(0);
            this.uiScene.updateCheckboxTexture();
            this.uiScene.updateTurnCounter();
            this.uiScene.updateTurnIconAlphas();
            this.uiScene.updatePlayButtonAlpha((this.turnPlanned/2) + 0.5);
        }
    }

    setupUIEvents() {
        this.uiScene.events.on("playPressed", function() {
            if (this.turnPlanned) {
                console.log("Turn planned: " + this.turnPlanned);
                if (this.stages.plan) {
                    this.uiScene.updatePlayButtonAlpha((this.turnPlanned/2) + 0.5);
                    this.endStage = true;
                }
            };
        }.bind(this));
        this.uiScene.events.on("organizePressed", function() {
            this.updateGroupActions(this.selectedCitizenGroup, "arrange");
            this.destroyMoveOptions();
            this.selectedCitizenGroup.destroyPath();
            this.selectedCitizenGroup.assignedAction = false;
            this.uiScene.updateCheckboxTexture();
            this.uiScene.updateGroupUIAlphas();
        }.bind(this));
        this.uiScene.events.on("movePressed", function() {
            this.updateGroupActions(this.selectedCitizenGroup, "move");
            this.destroyMoveOptions();
            this.selectedCitizenGroup.destroyPath();
            this.selectedCitizenGroup.assignedAction = false;
            this.uiScene.updateCheckboxTexture();
            this.uiScene.updateGroupUIAlphas();
        }.bind(this));
        this.uiScene.events.on("checkboxPressed", function() {
            if (!this.selectedCitizenGroup.actions.split) {
                this.selectedCitizenGroup.assignedAction = !this.selectedCitizenGroup.assignedAction;
                this.uiScene.updateCheckboxTexture();
                this.uiScene.updatePlayButtonAlpha((this.turnPlanned/2) + 0.5);
                console.log("group assigned action: " + this.selectedCitizenGroup.assignedAction);
            }
            if (!this.selectedCitizenGroup.assignedAction) {
                this.selectedCitizenGroup.destroyPath();
            }
        }.bind(this));
        this.events.on("has_split", function() {
            this.uiScene.showCitizenIcons();
            var index = this.selectedCitizenGroup.citizens.getChildren().indexOf(this.selectedCitizenGroup.selectedCitizen);
            var pastType = this.selectedCitizenGroup.citizens.getChildren()[index].type;
            this.uiScene.updateCitizenIcon("citizenIcons"+index, pastType);
            this.citizenGroup.runChildUpdate = false;
            this.uiScene.updateGroupUIAlphas();
        }.bind(this));
        this.uiScene.events.on("groupSelected", function(num) {
            if (this.citizenGroup.getChildren()[num] !== this.selectedCitizenGroup) {
                this.selectedCitizenGroup.selected = false;
                this.uiScene.updateGroupIcon(this.citizenGroup.getChildren().indexOf(this.selectedCitizenGroup));
                this.selectedCitizenGroup = this.citizenGroup.getChildren()[num];
                this.selectedCitizenGroup.selected = true;
                this.destroyMoveOptions();
                this.uiScene.updateGroupUIAlphas();
                this.uiScene.updateGroupIcon(this.citizenGroup.getChildren().indexOf(this.citizenGroup.getChildren()[num]));
                this.uiScene.showCitizenIcons();
                this.updateFoodBar(num);
                this.updateCitizenGrowthBar(num);
                var index = this.selectedCitizenGroup.citizens.getChildren().indexOf(this.selectedCitizenGroup.selectedCitizen);
                var type = this.selectedCitizenGroup.citizens.getChildren()[index].type;
                this.uiScene.updateCitizenIcon("citizenIcons"+index, type);
                this.uiScene.updateCheckboxTexture();
            }
        }.bind(this));
        this.uiScene.events.on("citizenSelected", function(num) {
            // toggle last selected citizen
            var index = this.selectedCitizenGroup.citizens.getChildren().indexOf(this.selectedCitizenGroup.selectedCitizen);
            var pastType = this.selectedCitizenGroup.citizens.getChildren()[index].type;
            this.uiScene.updateCitizenIcon("citizenIcons"+index, pastType);
            // toggle current selected citizen
            var name = "citizenIcons" + num;
            var type = this.selectedCitizenGroup.citizens.getChildren()[num].type;
            this.uiScene.updateCitizenIcon(name, type);
            // update data to represent current game state
            this.selectedCitizenGroup.selectedCitizen.selected = false;
            this.selectedCitizenGroup.selectedCitizen = this.selectedCitizenGroup.citizens.getChildren()[num];
            this.selectedCitizenGroup.selectedCitizen.selected = true;
            this.destroyMoveOptions();
        }.bind(this));
    }

    createCursor() {
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        this.cursor = this.add.image(0, 0, "cursor");
        this.cursor.setDepth(5);
        this.cursor.alpha = 0;
        // mouse up listener for click and drag map functionality.
        this.input.on("pointerup", function(pointer) {
            // reset for map drag
            this.pointerdown = false;
            this.oldPointerX = false;
            this.oldPointerY = false;
            // check if map is offset
            if (this.backgroundLayer.x % 32 !== 0 || this.backgroundLayer.y % 32 !== 0) {
                // calculate offset diff and snap map and all characters to nearest 32 by 32 camera cell line.
                // add in some sort off easing function in future
                let diffX = this.backgroundLayer.x - Math.floor(this.backgroundLayer.x / 32)*32;
                let diffY = this.backgroundLayer.y - Math.floor(this.backgroundLayer.y / 32)*32;
                this.backgroundLayer.x -= diffX;
                this.backgroundLayer.y -= diffY;
                // player group and citizens
                for (let i = 0; i < this.citizenGroup.getChildren().length; i++) {
                    this.citizenGroup.getChildren()[i].x -= diffX;
                    this.citizenGroup.getChildren()[i].y -= diffY;
                    if (this.citizenGroup.getChildren()[i].path) {
                        this.citizenGroup.getChildren()[i].createPath({
                            x: this.citizenGroup.getChildren()[i].x,
                            y: this.citizenGroup.getChildren()[i].y
                        }, {
                            x: this.citizenGroup.getChildren()[i].path._tmpVec2B.x -= diffX,
                            y: this.citizenGroup.getChildren()[i].path._tmpVec2B.y -= diffY,
                        });
                    }
                    for (let j = 0; j < this.citizenGroup.getChildren()[i].citizens.getChildren().length; j++) {
                        this.citizenGroup.getChildren()[i].citizens.getChildren()[j].x -= diffX;
                        this.citizenGroup.getChildren()[i].citizens.getChildren()[j].y -= diffY;
                        if (this.citizenGroup.getChildren()[i].citizens.getChildren()[j].path) {
                            this.citizenGroup.getChildren()[i].citizens.getChildren()[j].createPath({
                                x: this.citizenGroup.getChildren()[i].citizens.getChildren()[j].x,
                                y: this.citizenGroup.getChildren()[i].citizens.getChildren()[j].y
                            }, {
                                x: this.citizenGroup.getChildren()[i].citizens.getChildren()[j].path._tmpVec2B.x -= diffX,
                                y: this.citizenGroup.getChildren()[i].citizens.getChildren()[j].path._tmpVec2B.y -= diffY,
                            });
                        }
                    }
                }
                // location based UI
                if (this.moveOptions) {
                    this.moveOptions.x -= diffX;
                    this.moveOptions.y -= diffY;
                }
            }
        }.bind(this));
        // game world cursor MOVEMENT effects and functionality.
        this.input.on("pointermove", function(pointer) {
            this.pointermoving = true;
            // cursor visibillity in world bounds while not dragging.
            if (!this.pointerdown) {
                if (pointer.worldX > this.backgroundLayer.x
                    && pointer.worldY > this.backgroundLayer.y
                    && pointer.worldX < this.backgroundLayer.width + this.backgroundLayer.x
                    && pointer.worldY < this.backgroundLayer.height + this.backgroundLayer.y)
                {
                    let y = Math.floor(pointer.worldY / 32);
                    let x = Math.floor(pointer.worldX / 32);
                    this.cursor.setPosition(x*32+16, y*32+16);
                    this.cursor.alpha = 0.8;
                } else {
                    this.cursor.alpha = 0;
                }
            // dragging world x,y update, cursor is invisble.
            } else if (this.pointerdown  && !this.selectedCitizenGroup.actions.split) {
                this.cursor.alpha = 0;
                this.oldPointerX = this.oldPointerX ? this.oldPointerX : pointer.x;
                this.oldPointerY = this.oldPointerY ? this.oldPointerY : pointer.y;
                var deltaX = this.oldPointerX - pointer.x;
                var deltaY = this.oldPointerY - pointer.y;
                this.oldPointerX = pointer.x;
                this.oldPointerY = pointer.y;
                this.backgroundLayer.x -= Math.round(deltaX);
                this.backgroundLayer.y -= Math.round(deltaY);
                for (let i = 0; i < this.citizenGroup.getChildren().length; i++) {
                    this.citizenGroup.getChildren()[i].x -= Math.round(deltaX);
                    this.citizenGroup.getChildren()[i].y -= Math.round(deltaY);
                    if (this.citizenGroup.getChildren()[i].path) {
                        this.citizenGroup.getChildren()[i].createPath({
                            x: this.citizenGroup.getChildren()[i].x,
                            y: this.citizenGroup.getChildren()[i].y
                        }, {
                            x: this.citizenGroup.getChildren()[i].path._tmpVec2B.x -= Math.round(deltaX),
                            y: this.citizenGroup.getChildren()[i].path._tmpVec2B.y -= Math.round(deltaY),
                        });
                    }
                    for (let j = 0; j < this.citizenGroup.getChildren()[i].citizens.getChildren().length; j++) {
                        this.citizenGroup.getChildren()[i].citizens.getChildren()[j].x -= Math.round(deltaX);
                        this.citizenGroup.getChildren()[i].citizens.getChildren()[j].y -= Math.round(deltaY);
                        if (this.citizenGroup.getChildren()[i].citizens.getChildren()[j].path) {
                            this.citizenGroup.getChildren()[i].citizens.getChildren()[j].createPath({
                                x: this.citizenGroup.getChildren()[i].citizens.getChildren()[j].x,
                                y: this.citizenGroup.getChildren()[i].citizens.getChildren()[j].y
                            }, {
                                x: this.citizenGroup.getChildren()[i].citizens.getChildren()[j].path._tmpVec2B.x -= Math.round(deltaX),
                                y: this.citizenGroup.getChildren()[i].citizens.getChildren()[j].path._tmpVec2B.y -= Math.round(deltaY),
                            });
                        }
                    }
                }
                if (this.moveOptions) {
                    this.moveOptions.x -= Math.round(deltaX);
                    this.moveOptions.y -= Math.round(deltaY);
                }
            }
        }.bind(this));
        // cursor clicking logic
        this.input.on("pointerdown", function(pointer) {
            this.pointerdown = true;
            // double click logic
            this.clickNum += 1;
            this.timedEvent = this.time.delayedCall(500, function() { this.clickNum = 0; }, [], this);
            if (this.clickNum === 2) {
                this.cameras.main.pan(Math.floor(pointer.worldX/32)*32, Math.floor(pointer.worldY/32)*32, 1000, "Sine.easeInOut");
            }
            // unit assignment logic
            if (!this.pointermoving) {
                this.events.emit("tileSelected", Math.floor(pointer.x/32)*32, Math.floor(pointer.y/32)*32);
                let points = this.generateAvailableStatePoints();
                for (let i = 0; i < points.length; i++) {
                    if(points[i].x === Math.floor(pointer.worldX/32)*32 && points[i].y === Math.floor(pointer.worldY/32)*32) {
                        if (this.stages.plan) {
                            if (this.selectedCitizenGroup.actions.move) {
                                this.selectedCitizenGroup.createPath(
                                    {x:this.selectedCitizenGroup.x, y:this.selectedCitizenGroup.y},
                                    {x:Math.floor(pointer.worldX/32)*32+16, y:Math.floor(pointer.worldY/32)*32+16}
                                );
                                this.selectedCitizenGroup.assignedAction = true;
                            } else if (this.selectedCitizenGroup.actions.arrange) {
                                this.selectedCitizenGroup.selectedCitizen.createPath(
                                    {x:this.selectedCitizenGroup.selectedCitizen.x, y:this.selectedCitizenGroup.selectedCitizen.y},
                                    {x:Math.floor(pointer.worldX/32)*32+16, y:Math.floor(pointer.worldY/32)*32+16+4}
                                );
                                this.selectedCitizenGroup.selectedCitizen.doneExecuting = false;
                                this.selectedCitizenGroup.selectedCitizen.assignedAction = true;
                            } else if (this.selectedCitizenGroup.actions.tasks) {
                                if (i !== 0) {
                                    this.selectedCitizenGroup.selectedCitizen.createPath(
                                        {x:this.selectedCitizenGroup.selectedCitizen.x, y:this.selectedCitizenGroup.selectedCitizen.y},
                                        {x:Math.floor(pointer.worldX/32)*32+16, y:Math.floor(pointer.worldY/32)*32+16+4}
                                    );
                                } else {
                                    this.selectedCitizenGroup.selectedCitizen.path = null
                                }
                                this.selectedCitizenGroup.selectedCitizen.doneExecuting = false;
                                this.selectedCitizenGroup.selectedCitizen.assignedAction = true;
                            }
                            this.uiScene.updateCheckboxTexture();
                            this.uiScene.updatePlayButtonAlpha((this.turnPlanned/2) + 0.5);
                        }
                    }
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

    zoomCamera() {
        this.input.on("wheel", function(pointer, gameObject, dx, dy, dz) {
            this.backgroundLayer.scale = this.backgroundLayer.scale - (dy/1500);
        }.bind(this));
    }

    addCitizen(x, y, type, path, group) {
        let tempX = x;
        let tempY = y;
        if (type === "gatherer") {
            tempX -= 8;
        } else if (type === "worker") {
            tempX += 8;
        } else if(type === "warrior") {
            tempY += 4;
        }
        group.currentCitizens += 1;
        var citizen = new Citizen(this, tempX, tempY, type, group, path);
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
            console.log(group.actions, action);
        }
    }

    updateFoodBar(num) {
        let currentFood = this.citizenGroup.getChildren()[num].currentFoodStockPile;
        let maxFood = this.citizenGroup.getChildren()[num].maxFoodStockPile;
        this.events.emit("updateFood", currentFood, maxFood);
    }

    updateCitizenGrowthBar(num) {
        let currentCitizenGrowth = this.citizenGroup.getChildren()[num].currentCitizenGrowth;
        console.log(currentCitizenGrowth);
        let maxCitizenGrowth = this.citizenGroup.getChildren()[num].maxCitizenGrowth;
        this.events.emit("updateCitizenGrowth", currentCitizenGrowth, maxCitizenGrowth);
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
        if (this.selectedCitizenGroup.actions.arrange || this.selectedCitizenGroup.actions.tasks) {
            var tempX = Math.floor(this.selectedCitizenGroup.selectedCitizen.x/32)*32+16;
            var tempY = Math.floor(this.selectedCitizenGroup.selectedCitizen.y/32)*32+16;
            var newPoints = [];
            if (this.selectedCitizenGroup.actions.arrange) {
                points = [
                    {x:tempX-16-32, y:tempY-16},
                    {x:tempX-16+32, y:tempY-16},
                    {x:tempX-16, y:tempY-16-32},
                    {x:tempX-16, y:tempY-16+32},
                ];
            }
            if (this.selectedCitizenGroup.actions.tasks) {
                points = [
                    {x:tempX-16, y:tempY-16},
                    {x:tempX-16-32, y:tempY-16},
                    {x:tempX-16+32, y:tempY-16},
                    {x:tempX-16, y:tempY-16-32},
                    {x:tempX-16, y:tempY-16+32},
                ];
            }
            var tempPoints = [
                {x:this.selectedCitizenGroup.x-16, y:this.selectedCitizenGroup.y-16},
                {x:this.selectedCitizenGroup.x-16-32, y:this.selectedCitizenGroup.y-16},
                {x:this.selectedCitizenGroup.x-16+32, y:this.selectedCitizenGroup.y-16},
                {x:this.selectedCitizenGroup.x-16, y:this.selectedCitizenGroup.y-16-32},
                {x:this.selectedCitizenGroup.x-16, y:this.selectedCitizenGroup.y-16+32},
                {x:this.selectedCitizenGroup.x-16+32, y:this.selectedCitizenGroup.y-16+32},
                {x:this.selectedCitizenGroup.x-16-32, y:this.selectedCitizenGroup.y-16+32},
                {x:this.selectedCitizenGroup.x-16+32, y:this.selectedCitizenGroup.y-16-32},
                {x:this.selectedCitizenGroup.x-16-32, y:this.selectedCitizenGroup.y-16-32}
            ];
            for (let i = 0; i < points.length; i++) {
                for (let j = 0; j < tempPoints.length; j++) {
                    if (tempPoints[j].x === points[i].x && tempPoints[j].y === points[i].y) {
                        newPoints.push(points[i]);
                    }
                }
            }
            points = newPoints;
        }
        return points;
    }
}