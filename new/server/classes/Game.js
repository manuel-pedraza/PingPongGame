const Lobby  = require("./Lobby");

class Game {

    constructor() {

        this.hostSocket = undefined;
        this.opponentSocket = undefined;
        this.hasChanged = false;
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

    addHostPoint() {
        this.hostPoints++;
        this.lookForEndGame();
        this.hasChanged = true;
    }
    
    addOpponentPoint() {
        this.opponentPoints++;
        this.lookForEndGame();
        this.hasChanged = true;
    }


    addPoint(isHost){
        if(isHost)
            this.addHostPoint();
        else
            this.addOpponentPoint();
    }

    changePos(isHost, newY){
        if(isHost)
            this.changeHostPos(newY);
        else
            this.changeOppPos(newY);
    }

    changeHostPos(newY){
        this.hostPos = newY;
        this.hasChanged = true;
    }

    changeOppPos(newY) {
        this.opponentPos = newY;
        this.hasChanged = true;
    }
}


module.exports = Game;
