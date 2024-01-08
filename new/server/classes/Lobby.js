class Lobby {

    constructor({
        name = undefined,
        host = undefined,
        opponent = undefined,
        hostConnected = false,
        opponentConnected = false,
        gameStarted = false
    } = {}) {
        this.name = name;
        this.host = host;
        this.opponent = opponent;
        this.hostConnected = hostConnected;
        this.opponentConnected = opponentConnected;
        this.gameStarted = gameStarted;
    }
}

module.exports = Lobby;