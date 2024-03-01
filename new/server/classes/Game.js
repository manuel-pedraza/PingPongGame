const Lobby = require("./Lobby");

export default class Game {

    constructor(Lobby){

        this.Lobby = new Lobby(Lobby);
        this.hostPos = 0;
        this.opponentPos = 0;
        this.hostPoints = 0;
        this.opponentPoints = 0;
        this.ball = {x: 0, y: 0};

    }


}
