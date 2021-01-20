let count = 0;
class Player {
    constructor(game, { id, name, vessel }) {
        this.game = game
        this.id = id;
        this.name = name || 'player ' + ++count;
        this.vessel = vessel;
        if (this.vessel) this.vessel.player = this
        this.game.state.players.add(this)
    }
    updateFromServer({ name, vesselId }) {
        this.name = name
        this.vessel = this.game.state.soldiers.list.get(vesselId)
        if (this.vessel) this.vessel.player = this
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