export default class Actor {
    constructor(ctx, devicePixelRatio, x, y) {
        console.log("Y", y);
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.devicePixelRatio = devicePixelRatio;
        this.speed = 1;
    }

    draw() {

    }

    updatePos(x, y) {
        this.x = x;
        this.y = y;
    }
}