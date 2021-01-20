const { Soldier } = require('./common')
class ServerSoldier extends Soldier {
    constructor(game, props) {
        super(game, props)
    }
}

module.exports.default = ServerSoldier