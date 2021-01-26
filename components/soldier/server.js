const { Bullet } = require('../bullet/common')
const { Soldier } = require('./common')
class ServerSoldier extends Soldier {
    constructor(game, props) {
        super(game, props)
    }
    shoot() {
        const { x, y } = this.body.getPosition()
        const angle = this.body.getAngle()
        const rad = 16
        new Bullet(this.game, { x: x + Math.cos(angle) * rad, y: y + Math.sin(angle) * rad, angle })

        this.kickbackReady = false
        setTimeout(() => {
            this.kickbackReady = true
        }, this.kickback)
    }
}

module.exports.default = ServerSoldier