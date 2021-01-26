const { snapshotChanges } = require("../../utils");

let count = 0;
class Player {
    constructor(game, { id, name, vessel, vesselId }) {
        this.game = game
        this.id = id;
        this.name = name || 'player ' + ++count;
        this.vesselId = vesselId
        this.vessel = vessel;
        if (this.vessel) this.vessel.player = this
        this.game.state.players.add(this)

        this.getSnapshotChanges = snapshotChanges(this.getSnapshot).bind(this)
    }
    updateFromServer({ name, vesselId }) {
        if (name != undefined) this.name = name
        if (vesselId != undefined) {
            this.vesselId = vesselId
            this.vessel = this.game.state.soldiers.list.get(vesselId)
            if (this.vessel) this.vessel.player = this
        }
        this.game.state.dirty = true
        return this
    }
    getSnapshot() {
        return { id: this.id, name: this.name, vesselId: this.vessel?.id }
    }
    input(data) {
        this.vessel.input(data)
    }
}

module.exports = { Player }