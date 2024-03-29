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
        this.ctx.fillRect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
        this.ctx.fill();
    }

    updatePos(x, y){
        const distance = Math.abs(this.y - y);
        const sign = Math.sign(this.y - y) * (-1);
        let newY = (distance > this.speed ? this.speed : distance) * sign;


        
        super.updatePos(x, this.y + newY);
    }

}