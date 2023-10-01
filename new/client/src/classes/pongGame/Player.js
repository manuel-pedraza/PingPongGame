const { default: Actor } = require("./Actor");

export default class Player extends Actor {
    constructor(name, ctx, x, y) {
        super(ctx, x, y);
        this.name = name;

        this.height = 150;
        this.width = 30;
    }

    draw() {
        this.ctx.fillStyle = '#fff';
        // ctx.fillRect(200, 200, 100, 100);
        this.ctx.fillRect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
        this.ctx.fill();
    }

}