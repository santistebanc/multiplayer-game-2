const { Vec2, Circle } = require('planck-js')
const { schema } = require('./common')

let count = 0;

class Soldier {
    constructor(game, x, y, angle=0) {
        this.game = game;
        this.id = count++;
        this.schema = schema;
        this.body = game.world.createDynamicBody({ position: Vec2(x, y), angle, userData: this });
        this.body.createFixture(Circle(0.5), 1);
        this.body.setLinearDamping(20)

        this.game.state.add(this, 'soldiers')
    }
    getSnapshot() {
        const { x, y } = this.body.getPosition()
        const angle = this.body.getAngle()
        return { id: this.id, x: +x.toFixed(2), y: +y.toFixed(2), angle: +angle.toFixed(4) }
    }
    kill() {
        this.game.world.destroyBody(this.body)
        this.game.state.remove(this, 'soldiers')
    }
}

module.exports.default = Soldier