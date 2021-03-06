import { Application, Sprite } from 'pixi.js';
import { World } from 'planck-js'
import { Viewport } from 'pixi-viewport'
import Input from './input'
import Camera from './camera'
import { WorldState } from '../state';
import { GE_FPS, VELOCITY_ITERATIONS, POSITION_ITERATIONS, SIMULATED_LATENCY, SIMULATED_LOSS } from '../constants';

class Game {
    constructor(channel, { playerId }) {
        this.channel = channel;

        //the id of the player object of this client
        this.playerId = playerId;

        //initialize world state store
        this.state = new WorldState(this)

        //initialize game engine world
        this.world = new World({
            allowSleep: true,
        });

        //initialize PIXI renderer
        this.app = new Application({
            autoResize: true,
            resolution: devicePixelRatio
        });


        //mount renderer to DOM
        this.mount()

        //create viewport (used for camera position and zoom)
        this.viewport = new Viewport({
            screenWidth: this.app.view.width,
            screenHeight: this.app.view.height,
            worldWidth: 6000,
            worldHeight: 3000,
            interaction: this.app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        })
        this.app.stage.addChild(this.viewport)

        //load assets and after finishing loading run game
        this.app.loader.add('field', 'field.jpg').add('crosshair', 'crosshair.png').add('soldier', 'soldier.png').load((loader, resources) => {
            this.resources = resources;
            this.run()
            //add camera (needs to be added after objects have been loaded to world)
            this.camera = new Camera(this)
        });

    }
    run() {
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

        const { getArrows, getPointer, getMouseMain } = Input(this)


        this.app.ticker.add((delta) => {

            this.state.clientTick()
            const player = this.state.players.list.get(this.playerId);

            if (player?.vessel) {
                this.camera.followPlayer = player

                const { arrows } = getArrows()
                const { pointer } = getPointer()
                const { mouseMain } = getMouseMain()

                if (arrows || pointer || mouseMain) {
                    player.input({ pointer, arrows, mouseMain })
                    this.channel.emit('input', { arrows, pointer, mouseMain })
                }


            }

            //compute step of game engine
            this.world.step(delta / GE_FPS, VELOCITY_ITERATIONS, POSITION_ITERATIONS);

            this.state.reconcile()
        })

        this.channel.on('update', (data) => {
            this.state.updateFromServer(data)
        })
        //listen for world updates from server
        this.channel.onRaw(buffer => {
            this.state.readObjectsBuffer(buffer);
        })
        this.channel.emit('getState')
    }
    mount() {
        this.element = document.querySelector('#game')
        this.element.style.cursor = 'none'
        this.element.appendChild(this.app.view);
        // Listen for window resize events
        window.addEventListener('resize', this.resize.bind(this));
        this.resize()
    }
    resize() {
        const parent = this.app.view.parentNode;
        this.app.renderer.resize(parent.clientWidth, parent.clientHeight);
        if (this.viewport) {
            this.viewport.screenWidth = parent.clientWidth;
            this.viewport.screenHeight = parent.clientHeight;
            this.viewport.update()
        }
    }
}

export default Game