const userStates = require("../enums/userStates");

class User {

    constructor({
        name = "",
        state = userStates.inactive
    } = {}) {
        this.name = name;
        this.state = state;
    }
}

module.exports = User;