const Ball = require("./Ball");
const PlayerConsts = require("./Consts")

const PLAYER_SPEED = PlayerConsts.maxSpeed();
class Game {

    constructor() {
        this.hostSocket = undefined;
        this.opponentSocket = undefined;
        this.havePointsChanged = false;
        this.hasPosChanged = false;
        this.hasStarted = false;
        this.hasEnded = false;
        this.turn = true;
        this.hostSeq = 0;
        this.oppSeq = 0;
        this.hostPos = undefined;
        this.opponentPos = undefined;
        this.hostPoints = 0;
        this.opponentPoints = 0;
        this.maxPoints = 1;
        this.ball = undefined;
        this.arena = undefined;
        this.endRequests = 0;
    }

    lookForEndGame() {
        this.hasEnded = this.hostPoints >= this.maxPoints || this.opponentPoints >= this.maxPoints;
        return this.hasEnded;
    }

    resetChangedProps() {
        this.hasPosChanged = false;
        this.havePointsChanged = false;
    }

    addPoint(isHost) {
        if (isHost === true)
            this.hostPoints++;
        else
            this.opponentPoints++;
        this.havePointsChanged = true; 
        this.lookForEndGame();

    }

    changePos(isHost, newY) {

        const posToTreat = isHost === true ? this.hostPos.y : this.opponentPos.y;

        if(!isNaN(posToTreat)){
            const distance = Math.abs(posToTreat - newY);
            const sign = Math.sign(posToTreat - newY) * (-1);
            newY = (distance > PLAYER_SPEED ? PLAYER_SPEED : distance) * sign;
        }

        if (isHost === true)
            this.changeHostPos(newY);
        else
            this.changeOppPos(newY);
    }

    changeHostPos(newY) {
        if (newY === this.hostPos.y) return;

        if (isNaN(this.hostPos.y)){
            this.hostPos.y = newY;
        }
        else {
            this.hostPos.y += newY;
        }
        this.hasPosChanged = true;
    }

    changeOppPos(newY) {
        if (newY === this.opponentPos.y) return;

        if (isNaN(this.opponentPos.y)){
            this.opponentPos.y = newY;
        }
        else {
            this.opponentPos.y += newY;
        }
        this.hasPosChanged = true;
    }

    start(){
        this.hasStarted  = true;
        this.hostPos     = {x: this.arena.x * 0.05};
        this.opponentPos = {x: this.arena.x * 0.95};
        
        this.changeHostPos(this.arena.y * 0.5);
        this.changeOppPos(this.arena.y * 0.5);
    }

    ballLoop(){
        //Ball Logic
        if (!this.ball.player && this.ball.direction !== null) {
            this.ball.player = this.ball.direction === true ? this.hostPos : this.opponentPos;
            this.ball.setNewDirection();
        }

        if (this.ball.direction === null) {
            this.ball.direction = this.turn;
            this.ball.setNewDirection();

        } else {
            this.ball.updatePos(this.arena.y);
            
            if (this.ball.isOutOfBounds(this.arena.x)) {
                console.log("OOB | X", this.ball.x, "Y", this.ball.y, "T", this.turn, this.ball.direction);
                this.addPoint(!this.turn);
                this.turn = !this.turn;
                this.ball.reset(this.arena);
            }
        }
    }

    setArena(arena){
        this.arena = arena;
        this.setBall();
    }

    setBall(){
        this.ball = new Ball(this.arena.x / 2, this.arena.y / 2);
    }

    getBallObject(){
        return this.ball.toObject();
    }
}


module.exports = Game;
