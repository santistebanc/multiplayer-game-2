const { Vec2, Chain } = require('planck-js')
const { uint16, float32 } = require('@geckos.io/typed-array-buffer-schema')
const { snapshotChanges } = require("../../utils");

const schema = {
    id: uint16,
    // x: float32,
    // y: float32,
    // angle: float32,
}

class Wall {
    constructor(game, { id, vertices }) {

        this.game = game;
        this.schema = schema;

        this.id = id;
        this.vertices = vertices;

        this.body = this.game.world.createBody()
        this.fixture = this.body.createFixture(Chain(vertices), 0);
        this.game.state.walls.add(this)

        this.getSnapshotChanges = snapshotChanges(this.getSnapshot).bind(this)
    }
    updateFromServer({ vertices }) {
        if (vertices) {
            this.vertices = vertices;
            this.body.destroyFixture(this.fixture)
            this.fixture = this.body.createFixture(Chain(vertices), 0);
            this.render()
        }
        this.game.state.dirty = true
        return this
    }
    getSnapshot() {
        return { id: this.id, vertices: this.vertices }
    }
    render() {

    }
}

module.exports = { schema, Wall }