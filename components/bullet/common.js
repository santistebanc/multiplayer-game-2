const { Vec2, Box } = require('planck-js')
const { uint16, float32 } = require('@geckos.io/typed-array-buffer-schema')

const schema = {
    id: uint16,
    x: float32,
    y: float32,
    angle: float32,
}

let count = 0;
class Bullet {
    constructor(game, { id, x, y, angle }) {
        this.speed = 1000
        this.maxLifetime = 5000

        this.game = game;
        this.schema = schema;

        this.id = id ?? count++;

        this.body = this.game.world.createKinematicBody({ position: Vec2(x, y), angle, fixedRotation: true, userData: this });
        this.body.createFixture(Box(25, 2.5, Vec2(25, 0)), { isSensor: true });
        this.body.setLinearVelocity(Vec2(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed))
        this.game.state.bullets.add(this)
    }
    getSnapshot() {
        const { x, y } = this.body.getPosition()
        const angle = this.body.getAngle()
        return { id: this.id, x: +x.toFixed(2), y: +y.toFixed(2), angle: +angle.toFixed(4) }
    }
    render() {
        //used on client
    }
}

module.exports = { schema, Bullet }