const { Player } = require('./common')
const Soldier = require('../soldier/server').default

let count = 0
class ServerPlayer extends Player {
    constructor(game, props) {
        super(game, props)
    }
    spawn() {
        this.vessel = new Soldier(this.game,
            {
                id: count++,
                x: Math.random() * 1000 + 1400,
                y: Math.random() * 1000 + 1000,
                angle: Math.random() * 2 * Math.PI,
                player: this
            }
        )
        this.game.state.dirty = true
    }
    disconnect() {
        this.vessel.kill()
        this.game.disconnectPlayer(this)
        this.game.state.dirty = true
    }
}

module.exports.default = ServerPlayer