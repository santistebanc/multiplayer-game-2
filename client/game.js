import { Application, Sprite } from 'pixi.js';
import { Viewport } from 'pixi-viewport'
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation';
import { snapshotModel } from '../commons'
import Player from '../components/player/client'
import Soldier from '../components/soldier/client'
import Input from './input'
import Camera from './camera'

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
            screenWidth: this.app.view.width,
            screenHeight: this.app.view.height,
            worldWidth: 6000,
            worldHeight: 3000,
            interaction: this.app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        })

        // Listen for window resize events
        window.addEventListener('resize', this.resize.bind(this));
        this.resize();

        // add the viewport to the stage
        this.app.stage.addChild(this.viewport)

        //add camera (needs to be added after viewport)
        this.camera = new Camera(this)

        channel.onRaw(buffer => {
            const snapshot = snapshotModel.fromBuffer(buffer)
            SI.snapshot.add(snapshot)
        })

        this.app.loader.add('field', 'field.jpg').add('crosshair', 'crosshair.png').add('soldier', 'soldier.png').load((loader, resources) => {
            this.resources = resources;
            const interaction = this.app.renderer.plugins.interaction;

            //set background field
            const field = new Sprite(this.resources.field.texture);
            this.viewport.addChild(field);

            //set cursor
            this.cursor = new Sprite(this.resources.crosshair.texture);
            this.cursor.anchor.set(0.5, 0.5)
            this.app.stage.addChild(this.cursor)
            const updateMousePos = () => {
                const mouse_loc = interaction.mouse.global;
                this.cursor.position.set(mouse_loc.x, mouse_loc.y);
            }
            interaction.on("pointermove", updateMousePos);
            updateMousePos()

            this.app.ticker.add(() => {
                const snap = SI.calcInterpolation('x y angle(rad)', 'soldiers')
                if (snap && snap.state) {
                    snap.state.forEach(it => {
                        Soldier.readSnapshot(this.soldiers, it);
                    })
                }
            });
            const { up, down, left, right } = Input()
            let prevMouseX = Infinity;
            let prevMouseY = Infinity;
            let prevArrows = 0;
            this.app.ticker.add(() => {
                const snap = SI.vault.get()

                snap.state.players.forEach(it => {
                    Player.readSnapshot(this.players, it);
                })

                const player = this.players.get(playerId);
                this.camera.followPlayer = player

                if (player.vessel) {
                    const mouse_loc = this.viewport.toWorld(interaction.mouse.global);
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
        this.viewport.screenWidth = parent.clientWidth;
        this.viewport.screenHeight = parent.clientHeight;
        this.viewport.update()
    }
}

export default Game