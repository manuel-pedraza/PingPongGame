const { default: Actor } = require("./Actor");

export default class Ball extends Actor {
    constructor(ctx, x, y) {
        super(ctx, x, y);
        this.angle = -1;
        this.ballSize = 30;
        this.direction = null;
    }

    setAngle(newAngle) {

        console.log("NA", newAngle);

        newAngle %= 360;

        if (Math.sign(newAngle) === 1) {
            newAngle = (360 - newAngle) * -1;
        }

        this.angle = newAngle;
    }

    draw() {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(this.x - (this.ballSize / 2), this.y - (this.ballSize / 2), this.ballSize, this.ballSize);
        this.ctx.fill()
    }

    hasCollidedWithWall(newY) {
        return newY - (this.ballSize / 2) <= 0 || newY + (this.ballSize / 2) >= this.ctx.canvas.height;
    }

    hasCollidedWithPlayer(newX, newY, player) {
        // See player collision
        return false;
    }

    updatePos() {
        if (this.angle === -1 || this.direction === null)
            return;

        const speed = 8;
        // 

        // Rad convertion
        // const angleRad = this.angle * (Math.PI / 180 * bXPivot);
        const angleRad = this.angle * (Math.PI / 180);

        const xDelta = Math.cos(angleRad);
        const yDelta = Math.sin(angleRad);

        const newX = this.x + (xDelta * speed);
        const newY = this.y + (yDelta * speed);

        const p = this.direction === true ? "p1" : "p2";

        if (this.hasCollidedWithWall(newY)) {

            console.log(xDelta, yDelta);

            const goDown = newY - (this.ballSize / 2) <= 0

            const angle90 = Math.abs(this.angle % 90);
            let addAngle = 0;

            if (this.direction === true)
                addAngle = goDown ? (90 - angle90) * -2 : angle90 * 2;
            else
                addAngle = goDown ? angle90 * 2 : (90 - angle90) * -2;

            this.setAngle(this.angle + addAngle);


        } else if (this.hasCollidedWithPlayer(newX, newY, p)) {

        } else {
            this.x = newX;
            this.y = newY;
        }

        // console.log(bXPivot);
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
}