const PLAYER_HEIGHT = 150;
const PLAYER_WIDTH = 30;
const PLAYER_MAX_SPEED = 12;

class PlayerConsts{
    static height(){
        return PLAYER_HEIGHT;
    }

    static width() {
        return PLAYER_WIDTH;
    }

    static maxSpeed() {
        return PLAYER_MAX_SPEED;
    }
}

module.exports = PlayerConsts;
