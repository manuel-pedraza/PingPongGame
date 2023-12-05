class Lobby {

    constructor({
        name = undefined,
        host = undefined,
        opponent = undefined
    } = {}) {
        this.name = name;
        this.host = host;
        this.opponent = opponent;
    }
}

module.exports = Lobby;