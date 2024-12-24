const { default: Actor } = require("./Actor");

export default class Player extends Actor {
    constructor(name, ctx, devicePixelRatio, x, y) {
        console.log(name);
        super(ctx, devicePixelRatio, x, y);
        this.name = name;
        this.points = 0;
        this.height = 150;
        this.width = 30;
    }

    draw() {
        this.ctx.fillStyle = '#fff';
        // ctx.fillRect(200, 200, 100, 100);
        this.ctx.fillRect(
            this.x - (this.width / 2) * this.devicePixelRatio,
            this.y - (this.height / 2) * this.devicePixelRatio,
            this.width * this.devicePixelRatio, this.height * this.devicePixelRatio
        );
        this.ctx.fill();
    }

    updatePos(x, y) {
        const distance = Math.abs(this.y - y);
        const sign = Math.sign(this.y - y) * (-1);
        let newY = (distance > this.speed ? this.speed : distance) * sign;

        // Fixes player out of bounds
        if (this.y + newY + this.height / 2 > window.innerHeight * devicePixelRatio)
            super.updatePos(x, window.innerHeight * devicePixelRatio - this.height / 2);
        else if (this.y + newY - this.height / 2 < 0)
            super.updatePos(x, this.height / 2);
        else
            super.updatePos(x, this.y + newY);
    }

}