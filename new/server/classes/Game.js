const PLAYER_SPEED = 12;
class Game {

    constructor() {

        this.hostSocket = undefined;
        this.opponentSocket = undefined;
        this.havePointsChanged = false;
        this.hasPosChanged = false;

        this.hasGameEnded = false;
        this.hostPos = undefined;
        this.opponentPos = undefined;
        this.hostPoints = 0;
        this.opponentPoints = 0;
        this.ball = { x: 0, y: 0 };
    }

    lookForEndGame(points) {
        this.hasGameEnded = this.hostPoints >= points || this.opponentPoints >= points;
        return this.hasGameEnded;
    }

    resetChangedProps() {
        this.hasPosChanged = false;
        this.havePointsChanged = false;
    }

    addHostPoint() {
        this.hostPoints++;
        this.lookForEndGame();
        this.havePointsChanged = true;
    }

    addOpponentPoint() {
        this.opponentPoints++;
        this.lookForEndGame();
        this.havePointsChanged = true;
    }


    addPoint(isHost) {
        if (isHost)
            this.addHostPoint();
        else
            this.addOpponentPoint();
    }

    changePos(isHost, newY) {
        if (isHost)
            this.changeHostPos(newY);
        else
            this.changeOppPos(newY);
    }

    changeHostPos(newY) {
        if (newY === this.hostPos) return;

        if (isNaN(this.hostPos)){
            console.log("WAS NOT A NUMBER");
            this.hostPos = newY;
        }
        else {
            const distance = Math.abs(this.hostPos - newY);
            const sign = Math.sign(this.hostPos - newY) * (-1);
            newY = (distance > PLAYER_SPEED ? PLAYER_SPEED : distance) * sign;
            this.hostPos += newY;
        }
        this.hasPosChanged = true;
    }

    changeOppPos(newY) {
        if (newY === this.opponentPos) return;

        if (isNaN(this.opponentPos)){
            console.log("WAS NOT A NUMBER");
            this.opponentPos = newY;
        }
        else {
            const distance = Math.abs(this.opponentPos - newY);
            const sign = Math.sign(this.opponentPos - newY) * (-1);
            newY = (distance > PLAYER_SPEED ? PLAYER_SPEED : distance) * sign;
            this.opponentPos += newY;
        }
        this.hasPosChanged = true;
    }
}


module.exports = Game;
