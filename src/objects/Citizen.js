import "phaser";

export default class Citizen extends Phaser.GameObjects.Image {
    constructor(scene, x, y, type, parent, path) {
        super(scene, x, y, type);
        this.type = type;
        this.scene = scene;
        this.path = path;
        this.parent = parent;
        this.hp = 0;
        this.enemySpeed = 0;
        this.doneExecuting = true;
        this.selected = false;
        this.assignedAction = false;
        this.selectedAction = null;
        this.follower = {
            t:0,
            vec:new Phaser.Math.Vector2()
        };
        this.tasks = {
            idle:true,
            move:false,
        };
        this.setDepth(3);
        if (this.type === "warrior") {
            this.setDepth(4);
            this.tasks.attack = false;
        } else if (this.type === "gatherer") {
            this.tasks.farm = false;
            this.haul = 2;
        } else if (this.type === "worker") {
            this.tasks.build = false;
        }
        // add enemy to scene
        this.scene.add.existing(this);
    }

    update(time, delta) {
        if (this.tasks.move) {
            console.log("citizen running");
            if (this.path) {
                this.follower.t += (1/1000) * delta;
                this.path.getPoint(this.follower.t, this.follower.vec);
                // set the x and y
                this.setPosition(this.follower.vec.x, this.follower.vec.y);
                // citizen and flag sprite sorting logic.
                if (this.depth > 2 && this.y - this.height < this.parent.y) {
                    this.setDepth(1);
                } else if (this.depth === 1 && this.y > this.parent.y) {
                    this.setDepth(3);
                    if (this.type === "warrior") {
                        this.setDepth(4);
                    }
                }
                // check to see if it reached the end of path.
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
        } else if (!this.tasks.idle) {
            if (this.type === "gatherer") {
                this.haul = 3;
            }
            this.animateActions();
            this.doneExecuting = true;
            this.assignedAction = false;
        } else {
            if (this.type === "gatherer") {
                this.haul = 2;
            }
            this.doneExecuting = true;
            this.assignedAction = false;
        }
    }

    recieveDamage(damage) {
        this.hp -= damage;

        if (this.hp <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
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
    }

    setIdle() {
        this.tasks.idle = true;
        if (this.type === "gatherer") {
            this.tasks.farm = false;
        }
        else if (this.type === "worker") {
            this.tasks.build = false;
        }
        else if (this.type === "warrior") {
            this.tasks.attack = false;
        }
    }

    animateActions() {
        this.scene.add.tween({
            targets: this,
            ease: "Power2",
            duration: 2000,
            delay: 0,
            scale: {
                getStart: function() { return 1; },
                getEnd: function() { return 2; },
            },
            ease: "Power2",
            yoyo: -1,
        });
    }
}