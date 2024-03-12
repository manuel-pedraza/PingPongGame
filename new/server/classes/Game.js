const Lobby = require("./Lobby");

class Game {

    constructor({Lobby}){

        this.lobby = new Lobby(Lobby);
        this.hostPos = 0;
        this.opponentPos = 0;
        this.hostPoints = 0;
        this.opponentPoints = 0;
        this.ball = {x: 0, y: 0};
    }
}


module.exports = Game;
