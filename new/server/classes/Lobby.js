
class Lobby {

    constructor({
        name = undefined,
        host = undefined,
        opponent = undefined,
        gameStarted = false,
        gameEnded = false,
        points = 1
    } = {}) {
        this.name = name;
        this.host = host;
        this.opponent = opponent;
        this.gameStarted = gameStarted;
        this.gameEnded = gameEnded;
        this.points = points;
    }


    getClientLobby(){
        return {name: this.name, host: this.host, opponent: this.opponent};
    }
}

module.exports = Lobby;