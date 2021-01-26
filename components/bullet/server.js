const { Bullet } = require('./common')
class ServerBullet extends Bullet {
    constructor(game, props) {
        super(game, props)
    }
}

module.exports.default = ServerBullet