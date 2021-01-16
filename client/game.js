import { Application, Sprite } from 'pixi.js';
import { Viewport } from 'pixi-viewport'
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation';
import { snapshotModel } from '../commons'
import Player from '../components/player/client'
import Soldier from '../components/soldier/client'
import Input from './input'

const SI = new SnapshotInterpolation(30) // 30 FPS

class Game {
    constructor(channel, playerId) {
        this.playerId = playerId;
        this.channel = channel;
        this.players = new Map();
        this.soldiers = new Map();
        this.app = new Application({
            autoResize: true,
            resolution: devicePixelRatio
        });
        document.querySelector('#game').appendChild(this.app.view);

        // create viewport
        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,

            interaction: this.app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        })

        // Listen for window resize events
        window.addEventListener('resize', this.resize);
        this.resize();

        // add the viewport to the stage
        this.app.stage.addChild(this.viewport)
        this.viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate()

        channel.onRaw(buffer => {
            const snapshot = snapshotModel.fromBuffer(buffer)
            SI.snapshot.add(snapshot)
        })

        this.app.loader.add('field', 'field.jpg').add('soldier', 'soldier.png').load((loader, resources) => {
            this.resources = resources;
            const field = new Sprite(this.resources.field.texture);
            this.viewport.addChild(field);

            // viewport.follow(player)

            this.app.ticker.add(() => {
                const snap = SI.calcInterpolation('x y angle(rad)', 'soldiers')
                if (snap && snap.state) {
                    snap.state.forEach(it => {
                        Soldier.readSnapshot(this.soldiers, it);
                    })
                }
            });
            this.app.ticker.add(() => {
                const snap = SI.vault.get()
                snap.state.players.forEach(it => {
                    Player.readSnapshot(this.players, it);
                })
            });
            const { up, down, left, right } = Input()
            let prevMouseX = null;
            let prevMouseY = null;
            let prevArrows = 0;
            this.app.ticker.add(() => {
                const player = this.players.get(playerId);
                if (player.vessel) {
                    const mouse_loc = this.viewport.toWorld(this.app.renderer.plugins.interaction.mouse.global);
                    let code = 0;
                    if (up.isDown) code += 1
                    if (down.isDown) code += 2
                    if (left.isDown) code += 4
                    if (right.isDown) code += 8
                    const mouseX = +mouse_loc.x.toFixed(4);
                    const mouseY = +mouse_loc.y.toFixed(4);
                    if (mouseX !== prevMouseX || mouseY !== prevMouseY || code !== prevArrows) {
                        this.channel.emit('input', { arrows: code, pointer: { x: mouseX, y: mouseY } })
                        prevMouseX = mouseX;
                        prevMouseY = mouseY;
                        prevArrows = code;
                    }
                }
            })
        });

    }
    resize() {
        const parent = this.app.view.parentNode;
        this.app.renderer.resize(parent.clientWidth, parent.clientHeight);
    }
}

export default Game