import "phaser";
import Citizen from "./../objects/Citizen.js";

export default class CitizenGroup extends Phaser.GameObjects.Image {
    constructor(scene, x, y, path) {
        super(scene, x, y, "flag");

        this.scene = scene;
        this.path = path;
        this.hp = 0;
        this.speed = 0;
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
        this.currentFoodStockPile = 0;
        this.setDepth(2);
        // add to scene
        this.scene.add.existing(this);
        this.citizens = this.scene.physics.add.group({ classType: Citizen, runChildUpdate:false });
    }

    update(time, delta) {
        if (this.actions.split) {
            if (this.citizens.getChildren().length === 0) {
                this.scene.addCitizen(this.x, this.y, "gatherer", null, this);
                this.scene.time.delayedCall(2000, function() {
                    this.actions.split = false;
                    this.actions.arrange = true;
                    this.scene.events.emit("has_split");
                }, [], this);
            } else {
                this.actions.split = false;
                this.actions.arrange = true;
                this.scene.events.emit("has_split");
            }
        } else if (this.actions.arrange) {
            console.log("do arrange logic");
            if (this.path) {
                this.follower.t += (1/1000) * delta;
    
                this.path.getPoint(this.follower.t, this.follower.vec);
    
                // set the x and y of enemy
                this.setPosition(this.follower.vec.x, this.follower.vec.y);
    
                // check to see if it reached the end of path
                if (this.follower.t >= 1) {
                    this.follower.t = 0;
                    this.follower.vec = new Phaser.Math.Vector2()
                    this.path = null
                    this.doneExecuting = true;
                    this.assignedAction = false;
                    this.graphics.destroy();
                }
            }
        } else if (this.actions.move) {
            console.log("do move logic");
            if (this.path) {
                this.follower.t += (1/1000) * delta;
    
                this.path.getPoint(this.follower.t, this.follower.vec);
    
                // set the x and y of enemy
                this.setPosition(this.follower.vec.x, this.follower.vec.y);
    
                // check to see if it reached the end of path
                if (this.follower.t >= 1) {
                    this.follower.t = 0;
                    this.follower.vec = new Phaser.Math.Vector2()
                    this.doneExecuting = true;
                    this.assignedAction = false;
                    this.y = this.path._tmpVec2B.y;
                    this.x = this.path._tmpVec2B.x;
                    this.path = null
                    this.graphics.destroy();
                }
            }
        } else if (this.actions.tasks) {
            console.log("do task logic");
            this.doneExecuting = true;
            this.assignedAction = false;
        }
    }

    startOnPath() {
        this.follower.t = 0;

        this.path.getPoint(this.follower.t, this.follower.vec);
        this.setPosition(this.follower.vec.x, this.follower.vec.y);
    }

    createPath(origin, destination) {
        if (this.graphics) {
            this.graphics.destroy();
        }
        this.graphics = this.scene.add.graphics();
        // path enemies follow
        this.path = this.scene.add.path(origin.x, origin.y);
        this.path.lineTo(destination.x, destination.y);
        console.log(this.path);
        // visualizing the path
        this.graphics.lineStyle(3, 0xffffff, 1);
        this.path.draw(this.graphics);
        //this.startOnPath();
    }
}