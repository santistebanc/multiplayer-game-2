const { Wall } = require('./common')
class ServerWall extends Wall {
    constructor(game, props) {
        super(game, props)
    }
}

module.exports.default = ServerWall