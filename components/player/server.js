const { schema } = require('./common')
const Soldier = require('../soldier/server').default

let count = 0;

class Player {
    constructor(game, name) {
        this.game = game
        this.id = count++;
        this.schema = schema;
        this.name = name || 'player ' + count;
        this.game.state.add(this, 'players')
    }
    getSnapshot() {
        return { id: this.id, name: this.name, vessel: this.vessel.id }
    }
    spawn() {
        this.vessel = new Soldier(this.game,
            Math.random() * 1000 + 1400,
            Math.random() * 1000 + 1000,
            Math.random() * 2 * Math.PI
        )
        this.vessel.player = this;
    }
    disconnect() {
        this.vessel.kill()
        this.game.state.remove(this, 'players')
    }
}

module.exports.default = Player