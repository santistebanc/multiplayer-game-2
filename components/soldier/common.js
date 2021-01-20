const { Vec2, Circle } = require('planck-js')
const { uint16, float32 } = require('@geckos.io/typed-array-buffer-schema')

const schema = {
    id: uint16,
    x: float32,
    y: float32,
    angle: float32,
    vx: float32,
    vy: float32,
}

class Soldier {
    constructor(game, { id, x, y, angle, player }) {
        this.walkFwd = 10000
        this.walkSide = 10000

        this.game = game;
        this.schema = schema;

        this.id = id;
        this.player = player;

        this.body = this.game.world.createDynamicBody({ position: Vec2(x, y), angle, fixedRotation: true, userData: this });
        this.body.createFixture(Circle(16), 0.01);
        this.body.setLinearDamping(10)
        this.game.state.soldiers.add(this)
    }
    getSnapshot() {
        const { x, y } = this.body.getPosition()
        const angle = this.body.getAngle()
        const { x: vx, y: vy } = this.body.getLinearVelocity()
        return { id: this.id, x: +x.toFixed(2), y: +y.toFixed(2), angle: +angle.toFixed(4), vx: +vx.toFixed(2), vy: +vy.toFixed(2) }
    }
    input(data) {
        const { arrows, pointer } = data;
        if (pointer) this.aim(pointer)
        if (arrows) {
            const side = arrows === 8 || arrows === 9 || arrows === 10 ? 1 : arrows === 4 || arrows === 5 || arrows === 6 ? -1 : 0
            const fwd = arrows === 1 || arrows === 5 || arrows === 9 ? 1 : arrows === 2 || arrows === 6 || arrows === 10 ? -1 : 0
            this.walk(fwd, side)
        }
    }
    walk(fwd, side, angle) {
        const ang = angle ?? this.body.getAngle();
        const moveY = Math.cos(ang) * side * this.walkSide + Math.sin(ang) * fwd * this.walkFwd
        const moveX = Math.cos(ang + Math.PI / 2) * side * this.walkSide + Math.sin(ang + Math.PI / 2) * fwd * this.walkFwd
        this.body.applyForceToCenter(Vec2(moveX, moveY), true)
    }
    aim(pointer) {
        const { x, y } = this.body.getPosition()
        this.body.setAngle(Math.atan2(pointer.y - y, pointer.x - x));
    }
    kill() {
        // this.game.world.destroyBody(this.body)
        // this.game.state.remove(this, 'soldiers')
    }
}

module.exports = { schema, Soldier }