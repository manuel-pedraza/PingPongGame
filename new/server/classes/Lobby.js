
class Lobby {

    constructor({
        name = undefined,
        host = undefined,
        opponent = undefined,
        gameStarted = false,
        points = 10,
    } = {}) {
        this.name = name;
        this.host = host;
        this.opponent = opponent;
        this.gameStarted = gameStarted;
        this.points = points;
    }


    getClientLobby(){
        return {name: this.name, host: this.host, opponent: this.opponent};
    }
}

module.exports = Lobby;