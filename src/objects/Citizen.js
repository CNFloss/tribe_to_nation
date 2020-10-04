import "phaser";

export default class Citizen extends Phaser.GameObjects.Image {
    constructor(scene, x, y, type, path) {
        super(scene, x, y, type);
        this.type = type;
        this.scene = scene;
        this.path = path;
        this.hp = 0;
        this.enemySpeed = 0;
        this.follower = {
            t:0,
            vec:new Phaser.Math.Vector2()
        };
        //this.setDepth(3);
        // add enemy to scene
        this.scene.add.existing(this);
    }

    update(time, delta) {
        /*if (this.path) {
            this.follower.t += this.enemySpeed * delta;

            this.path.getPoint(this.follower.t, this.follower.vec);

            // set the x and y of enemy
            this.setPosition(this.follower.vec.x, this.follower.vec.y);

            // check to see if it reached the end of path
            if (this.follower.t >= 1) {
                this.path = this.add.path(this.x, this.y);
            }
        }*/
    }

    startOnPath(level) {
        this.follower.t = 0;

        this.path.getPoint(this.follower.t, this.follower.vec);
        this.setPosition(this.follower.vec.x, this.follower.vec.y);
    }

    recieveDamage(damage) {
        this.hp -= damage;

        if (this.hp <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

    createPath(origin, destination) {
        this.graphics = this.add.graphics();
        // path enemies follow
        this.path = this.add.path(origin.x, origin.y);
        this.path.lineTo(destination.x, destination.y);
        // visualizing the path
        this.graphics.lineStyle(3, 0xffffff, 1);
        this.path.draw(this.graphics);
    }
}