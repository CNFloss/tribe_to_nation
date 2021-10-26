import "phaser";
import Citizen from "./../objects/Citizen.js";

export default class CitizenGroup extends Phaser.GameObjects.Image {
    constructor(scene, x, y, path) {
        super(scene, x, y, "flag");

        this.scene = scene;
        this.path = path;
        this.follower = {
            t:0,
            vec:new Phaser.Math.Vector2()
        };
        this.actions = {
            split: true,
            arrange: false,
            move: false,
            tasks: false,
        };
        this.selected = false;
        this.assignedAction = false;
        this.doneExecuting = false;
        this.hp = 0;
        this.speed = 0;
        this.selectedCitizen = null;
        this.currentCitizenGrowth = 0;
        this.maxCitizenGrowth = 10;
        this.currentFoodStockPile = 0;
        this.maxFoodStockPile = 10;
        this.setScale(2);
        this.setDepth(2);
        // add to scene
        this.scene.add.existing(this);
        this.citizens = this.scene.physics.add.group({ classType:Citizen, runChildUpdate:false });
    }

    update(time, delta) {
        if (this.doneExecuting) {
            return;
        }
        if (this.actions.split) {
            if (this.citizens.getChildren().length === 0) {
                this.scene.addCitizen(this.x, this.y, "gatherer", null, this.citizens);
            }
            this.scene.time.delayedCall(2000, function() {
                if (this.actions.split) {
                    this.actions.split = false;
                    this.actions.arrange = true;
                    this.selectedCitizen = this.citizens.getChildren()[0];
                    this.selectedCitizen.selected = true;
                    this.scene.events.emit("has_split");
                }
            }, [], this);
                
        } else if (this.actions.arrange) {
            var temp = 0;
            for (let i = 0; i < this.citizens.getChildren().length; i++) {
                if(!this.citizens.getChildren()[i].doneExecuting) {
                    if (!this.citizens.getChildren()[i].tasks.idle  && !this.citizens.getChildren()[i].tasks.move && this.citizens.getChildren()[i].path) {
                        this.citizens.getChildren()[i].setIdle();
                        this.citizens.getChildren()[i].tasks.move = true;
                        this.citizens.getChildren()[i].tasks.idle = false;
                    }
                } else {
                    if (this.citizens.getChildren()[i].tasks.move) {
                        this.citizens.getChildren()[i].tasks.move = false;
                        this.citizens.getChildren()[i].tasks.idle = true;
                    }
                    temp += 1;
                }
            }
            if (temp === this.citizens.getChildren().length) {
                this.doneExecuting = true;
                this.assignedAction = false;
                this.citizens.runChildUpdate = false;
            } else {
                this.citizens.runChildUpdate = true;
            }
        } else if (this.actions.move) {
            console.log("do move logic");
            if (this.path) {
                this.follower.t += (1/1000) * delta;
    
                this.path.getPoint(this.follower.t, this.follower.vec);
                // set the x and y
                let diff = {
                    x: this.follower.vec.x-this.x,
                    y: this.follower.vec.y-this.y
                }
                for (let i = 0; i < this.citizens.getChildren().length; i++) {
                    if (!this.citizens.getChildren()[i].tasks.idle) {
                        this.citizens.getChildren()[i].setIdle();
                    }
                    this.citizens.getChildren()[i].x += diff.x;
                    this.citizens.getChildren()[i].y += diff.y;
                }
                this.setPosition(this.follower.vec.x, this.follower.vec.y);
                // check to see if it reached the end of path
                if (this.follower.t >= 1) {
                    this.follower.t = 0;
                    this.follower.vec = new Phaser.Math.Vector2();
                    this.doneExecuting = true;
                    this.assignedAction = false;
                    this.y = this.path._tmpVec2B.y;
                    this.x = this.path._tmpVec2B.x;
                    this.path = null;
                    this.graphics.destroy();
                }
            } else {
                this.doneExecuting = true;
                this.assignedAction = false;
            }
        } else if (this.actions.tasks) {
            var temp = 0;
            for (let i = 0; i < this.citizens.getChildren().length; i++) {
                if(!this.citizens.getChildren()[i].doneExecuting) {
                    if (this.citizens.getChildren()[i].path) {
                        this.citizens.getChildren()[i].setIdle();
                        this.citizens.getChildren()[i].tasks.move = true;
                        this.citizens.getChildren()[i].tasks.idle = false;
                    } else {
                        this.citizens.getChildren()[i].tasks.move = false;
                        this.citizens.getChildren()[i].tasks.idle = false;
                        if (this.citizens.getChildren()[i].type === "gatherer") {
                            this.citizens.getChildren()[i].tasks.farm = true;
                        }
                        if (this.citizens.getChildren()[i].type === "worker") {
                            this.citizens.getChildren()[i].tasks.build = true;
                        }
                        if (this.citizens.getChildren()[i].type === "warrior") {
                            this.citizens.getChildren()[i].tasks.attack = true;
                        }
                    }
                } else {
                    temp += 1;
                }
            }
            if (temp === this.citizens.getChildren().length) {
                this.doneExecuting = true;
                this.assignedAction = false;
                this.citizens.runChildUpdate = false;
            } else {
                this.citizens.runChildUpdate = true;
            }
        }
    }

    startOnPath() {
        this.follower.t = 0;

        this.path.getPoint(this.follower.t, this.follower.vec);
        this.setPosition(this.follower.vec.x, this.follower.vec.y);
    }

    createPath(origin, destination) {
        this.destroyPath();
        this.graphics = this.scene.add.graphics();
        // path enemies follow
        this.path = this.scene.add.path(origin.x, origin.y);
        this.path.lineTo(destination.x, destination.y);
        // visualizing the path
        this.graphics.lineStyle(3, 0xffffff, 1);
        this.path.draw(this.graphics);
    }

    destroyPath() {
        if (this.graphics) {
            this.graphics.destroy();
        }
        for (let i = 0; i < this.citizens.getChildren().length; i++) {
            this.citizens.getChildren()[i].destroyPath();
        }
    }
}