export default class Actor {
    constructor(ctx, x, y) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
    }

    draw() {

    }

    updatePos(x, y) {
        this.x = x;
        this.y = y;
    }
}