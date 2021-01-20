import { SnapshotInterpolation, Vault } from '@geckos.io/snapshot-interpolation';
import { Sprite } from 'pixi.js';
import { Vec2 } from 'planck-js';
import { Soldier } from './common';
class ClientSoldier extends Soldier {
    constructor(game, props) {
        super(game, props)
        const { x, y, angle } = props

        this.sprite = new Sprite(this.game.resources.soldier.texture);
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.rotation = angle;

        this.game.viewport.addChild(this.sprite);

        this.vault = new Vault()

        this.tradeoff = 0.001
    }
    reconcile(serverSnapshot, snap, SI) {
        //get client GE currently predicted values
        const pos = this.body.getPosition();
        const ang = this.body.getAngle()
        const vel = this.body.getLinearVelocity()

        const predicted = this.getSnapshot()

        //save client predicted values in vault
        this.vault.add(
            SI.snapshot.create([predicted])
        )

        //start with GE predicted values
        let correctedX = pos.x
        let correctedY = pos.y
        let correctedAngle = ang
        let correctedVx = vel.x
        let correctedVy = vel.y
        let correction = 0.01

        // get the closest player snapshot that matches the server snapshot time
        const predictionSnapshot = this.vault.get(snap.time, true)?.state[0]

        if (predictionSnapshot) {
            // calculate the offset between server and client
            const offsetX = predictionSnapshot.x - serverSnapshot.x
            const offsetY = predictionSnapshot.y - serverSnapshot.y

            // if moving correct more
            if (Math.abs(vel.x) + Math.abs(vel.y) > 30) {
                correction = 0.02
            }

            correctedX = pos.x - offsetX * correction
            correctedY = pos.y - offsetY * correction

        }

        // if (this.game.playerId !== this.player?.id) {
        //     correction = 0.5
        //     correctedX = correctedX + (serverSnapshot.x - correctedX) * correction
        //     correctedY = correctedY + (serverSnapshot.y - correctedY) * correction
        // }

        if (this.game.playerId !== this.player?.id) {
            //if not player, then do just input server snapshot directly

            const interp = SI.calcInterpolation('x y angle(rad) vx vy', 'soldiers')?.state.find(it => it.id === this.id)
            if (interp) {
                correctedX = interp.x
                correctedY = interp.y
                correctedVx = interp.vx
                correctedVy = interp.vy
                correctedAngle = interp.angle

            }
        }

        this.body.setPosition(Vec2(correctedX, correctedY))
        this.body.setAngle(correctedAngle)
        this.body.setLinearVelocity(Vec2(correctedVx, correctedVy))
        this.sprite.x = correctedX;
        this.sprite.y = correctedY;
        this.sprite.rotation = correctedAngle;

    }
    walk() {
        super.walk(...arguments)
        this.render()
    }
    aim() {
        super.aim(...arguments)
        this.render()
    }
    render() {
        const { x, y } = this.body.getPosition()
        const angle = this.body.getAngle()
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.rotation = angle;
    }
    kill() {
        super.kill()
        // this.sprite.parent.removeChild(this.sprite);
    }
}

export default ClientSoldier