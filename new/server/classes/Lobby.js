class Lobby {

    constructor({
        name = "",
        host = "",
        opponent = ""
    } = {}) {
        this.name = name;
        this.host = host;
        this.opponent = opponent;
    }
}

module.exports = Lobby;