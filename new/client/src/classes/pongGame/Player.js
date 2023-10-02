import Queue from "../Queue";

const { default: Actor } = require("./Actor");

export default class Player extends Actor {
    constructor(name, ctx, x, y) {
        super(ctx, x, y);
        this.name = name;
        this.points = 0;
        this.speedQueue = new Queue();
        this.speedQueue.setMaxItems(10);
        this.avgSpeed = this.speedQueue.getAverage();
        this.height = 150;
        this.width = 30;
    }

    draw() {
        this.avgSpeed = this.speedQueue.getAverage();
        this.ctx.fillStyle = '#fff';
        // ctx.fillRect(200, 200, 100, 100);
        this.ctx.fillRect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
        this.ctx.fill();
    }

}