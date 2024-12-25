const BALL_SIZE = 30;
const BALL_MAX_SPEED = 4;
const BALL_MID_SPEED = 8
const BALL_MIN_SPEED = 12;
const PlayerConsts = require("./Consts")

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = undefined;
        this.direction = null;
        this.player = undefined;
        this.speed = BALL_MID_SPEED;
    }

    setAngle(newAngle) {

        newAngle %= 360;
        if (Math.sign(newAngle) === 1)
            newAngle = (360 - newAngle) * -1;

        this.angle = newAngle;
    }

    isOutOfBounds(xLimit) {
        return this.x <= 0 || this.x >= xLimit;
    }

    hasCollidedWithWall(newY, yLimit) {
        return newY - (BALL_SIZE / 2) <= 0 || newY + (BALL_SIZE / 2) >= yLimit;
    }

    hasCollidedWithPlayer(newX, newY) {
        // console.log(this.direction, "HCWP", this.player, "BALL", newX, newY);

        const r = newX + (BALL_SIZE / 2);
        const l = newX - (BALL_SIZE / 2);
        const t = newY - (BALL_SIZE / 2);
        const b = newY + (BALL_SIZE / 2);

        const { x, y } = this.player;
        const height = PlayerConsts.height();
        const width  = PlayerConsts.width(); 

        const isLInside = this.direction === true && l >= x - width / 2 && l <= x + width / 2;
        const isRInside = this.direction === false && r >= x - width / 2 && r <= x + width / 2;
        const isTInside = t <= y + height / 2 && t >= y - height / 2;
        const isBInside = b >= y - height / 2 && b <= y + height / 2;

        let result = isLInside || isRInside ? isLInside ? "l" : "r" : undefined;

        if (result === undefined || !(isTInside || isBInside))
            return undefined;

        return result + (isTInside && isBInside ? "tb" : isTInside ? "t" : "b");

    }

    updatePos(yLimit) {
        if (this.angle === undefined || this.direction === null)
            return;

        // Rad convertion
        // const angleRad = this.angle * (Math.PI / 180 * bXPivot);
        const angleRad = this.angle * (Math.PI / 180);

        const xDelta = Math.cos(angleRad);
        const yDelta = Math.sin(angleRad);

        const newX = this.x + (xDelta * this.speed);
        const newY = this.y + (yDelta * this.speed);

        if (this.hasCollidedWithWall(newY, yLimit)) {

            const goDown = newY - (BALL_SIZE / 2) <= 0
            const angle90 = Math.abs(this.angle % 90);
            let addAngle = 0;

            if (this.direction === true)
                addAngle = goDown ? (90 - angle90) * -2 : angle90 * 2;
            else
                addAngle = goDown ? angle90 * 2 : (90 - angle90) * -2;

            this.setAngle(this.angle + addAngle);


        } else if (this.hasCollidedWithPlayer(newX, newY) !== undefined) {

            const xPivot = this.direction === true ? 1 : -1;
            this.x = (this.player.x + PlayerConsts.width() / 2 * xPivot) + BALL_SIZE / 2 * xPivot;
            this.y = newY;

            // const newSpeed = this.player.avgSpeed * 2;
            // this.speed = newSpeed > 16 ? 16 : newSpeed < 5.5 ? 5.5 : newSpeed;

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

    reset(arena) {
        this.x = arena.x / 2;
        this.y = arena.y / 2;
        this.direction = null;
        this.angle = undefined;
        this.player = undefined;
        this.speed = BALL_MID_SPEED;
    }

    toJSON(){
        return {x: this.x, y: this.y, speed: this.speed, angle: this.angle, direction: this.direction};
    }

}

module.exports = Ball;