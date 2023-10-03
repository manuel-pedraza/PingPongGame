const { default: Actor } = require("./Actor");

export default class Ball extends Actor {
    constructor(ctx, x, y) {
        super(ctx, x, y);
        this.angle = undefined;
        this.ballSize = 30;
        this.direction = null;
        this.player = undefined;
        this.speed = 8;
    }

    setAngle(newAngle) {

        newAngle %= 360;
        if (Math.sign(newAngle) === 1)
            newAngle = (360 - newAngle) * -1;

        this.angle = newAngle;
    }

    draw() {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(this.x - (this.ballSize / 2), this.y - (this.ballSize / 2), this.ballSize, this.ballSize);
        this.ctx.fill()
    }

    isOutOfBounds() {
        return this.x <= 0 || this.x >= this.ctx.canvas.width;
    }

    hasCollidedWithWall(newY) {
        return newY - (this.ballSize / 2) <= 0 || newY + (this.ballSize / 2) >= this.ctx.canvas.height;
    }

    hasCollidedWithPlayer(newX, newY) {

        const r = newX + (this.ballSize / 2);
        const l = newX - (this.ballSize / 2);
        const t = newY - (this.ballSize / 2);
        const b = newY + (this.ballSize / 2);

        const { x, y, width, height } = this.player;


        const isLInside = this.direction === true && l >= x - width / 2 && l <= x + width / 2;
        const isRInside = this.direction === false && r >= x - width / 2 && r <= x + width / 2;
        const isTInside = t <= y + height / 2 && t >= y - height / 2;
        const isBInside = b >= y - height / 2 && b <= y + height / 2;

        let result = isLInside || isRInside ? isLInside ? "l" : "r" : undefined;

        if (result === undefined || !(isTInside || isBInside))
            return undefined;

        return result + (isTInside && isBInside ? "tb" : isTInside ? "t" : "b");

    }

    updatePos() {
        if (this.angle === undefined || this.direction === null)
            return;

        // Rad convertion
        // const angleRad = this.angle * (Math.PI / 180 * bXPivot);
        const angleRad = this.angle * (Math.PI / 180);

        const xDelta = Math.cos(angleRad);
        const yDelta = Math.sin(angleRad);

        const newX = this.x + (xDelta * this.speed);
        const newY = this.y + (yDelta * this.speed);

        if (this.hasCollidedWithWall(newY)) {

            const goDown = newY - (this.ballSize / 2) <= 0
            const angle90 = Math.abs(this.angle % 90);
            let addAngle = 0;

            if (this.direction === true)
                addAngle = goDown ? (90 - angle90) * -2 : angle90 * 2;
            else
                addAngle = goDown ? angle90 * 2 : (90 - angle90) * -2;

            this.setAngle(this.angle + addAngle);


        } else if (this.hasCollidedWithPlayer(newX, newY) !== undefined) {

            const xPivot = this.direction === true ? 1 : -1;
            this.x = (this.player.x + this.player.width / 2 * xPivot) + this.ballSize / 2 * xPivot;
            this.y = newY;

            const newSpeed = this.player.avgSpeed * 2;
            this.speed = newSpeed > 16 ? 16 : newSpeed < 5.5 ? 5.5 : newSpeed;

            this.setNewDirection();
            this.player = undefined;
        } else {
            this.x = newX;
            this.y = newY;
        }
    }

    setNewDirection() {
        if (this.direction === null)
            this.direction = true;
        else
            this.direction = !this.direction;

        let angleTmp = Math.floor(Math.random() * 90) - 45 + (this.direction === true ? 180 : 0);
        angleTmp *= -1;
        this.setAngle(angleTmp);

    }

    reset() {
        this.x = this.ctx.canvas.width / 2;
        this.y = this.ctx.canvas.height / 2;
        this.direction = null;
        this.angle = undefined;
        this.player = undefined;
        this.speed = 8;
    }

}