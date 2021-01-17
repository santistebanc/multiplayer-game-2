import { Application, Sprite } from 'pixi.js';
import { Viewport } from 'pixi-viewport'
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation';
import { snapshotModel } from '../commons'
import Player from '../components/player/client'
import Soldier from '../components/soldier/client'
import Input from './input'

class Camera {
    constructor(game) {
        this.game = game;
        this.interaction = this.game.app.renderer.plugins.interaction;
        this.game.viewport
            .wheel()
            .decelerate()
            .clamp({ left: true, right: true, top: true, bottom: true })
            .clampZoom({ maxWidth: 6000, maxHeight: 3000 })

        this.threshold = 600
        this.damp = 4

        this.game.app.ticker.add(() => {
            if (this.followPlayer?.vessel) {
                const toFollow = this.followPlayer.vessel.sprite;
                const mouse_loc = this.game.viewport.toWorld(this.interaction.mouse.global);
                const mouseX = +mouse_loc.x.toFixed(4);
                const mouseY = +mouse_loc.y.toFixed(4);
                const point = { x: toFollow.x + (mouseX - toFollow.x) / 2, y: toFollow.y + (mouseY - toFollow.y) / 2 }
                const cameraPrev = { x: this.cameraPos?.x ?? point.x, y: this.cameraPos?.y ?? point.y }

                //if the distance to mouse is short snap right into place, if not damp
                if (Math.sqrt(Math.pow(toFollow.x - mouseX, 2) + Math.pow(toFollow.y - mouseY, 2)) < this.threshold) {
                    this.cameraPos = { x: (cameraPrev.x + point.x) / 2, y: (cameraPrev.y + point.y) / 2 }
                } else {
                    this.cameraPos = { x: cameraPrev.x + (point.x - cameraPrev.x) / this.damp, y: cameraPrev.y + (point.y - cameraPrev.y) / this.damp }
                }

                this.game.viewport.moveCenter(this.cameraPos)
                this.game.viewport.wheel({ center: this.cameraPos })
                this.game.viewport.on('zoomed', (e) => {
                    this.cameraPos = { x: (cameraPrev.x + point.x) / 2, y: (cameraPrev.y + point.y) / 2 }
                })

            }
        })
    }

}

export default Camera