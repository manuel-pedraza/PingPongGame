export default class Actor {
    constructor(ctx, devicePixelRatio, x, y) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.devicePixelRatio = devicePixelRatio;
    }

    draw() {

    }

    updatePos(x, y) {
        this.x = x;
        this.y = y;
    }
}