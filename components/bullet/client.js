import { Graphics } from 'pixi.js';
import { Vec2 } from 'planck-js';
import { Bullet } from './common';

class ClientBullet extends Bullet {
    constructor(game, props) {
        super(game, props)
        const { x, y, angle } = props

        this.graph = new Graphics();
        this.graph.position.set(x, y)
        this.graph.rotation = angle

        this.graph.moveTo(0, 0).lineStyle(5, 0xffffff).lineTo(50, 0)

        this.game.viewport.addChild(this.graph);
    }
    reconcile(serverSnapshot) {
        const { x, y, angle } = serverSnapshot
        this.body.setPosition(Vec2(x, y))
        this.body.setAngle(angle)
        this.render()
    }
    render() {
        const { x, y } = this.body.getPosition()
        const angle = this.body.getAngle()
        this.graph.position.set(x, y)
        this.graph.rotation = angle
    }
    kill() {
        super.kill()
        // this.sprite.parent.removeChild(this.sprite);
    }
}

export default ClientBullet