const { World, Vec2 } = require('planck-js')
const { setGameLoop } = require('node-gameloop');
const geckos = require('@geckos.io/server').default
const { iceServers } = require('@geckos.io/server')
const Player = require('../components/player/server').default
const WorldState = require('./state').default

const FPS = 60;
const VELOCITY_ITERATIONS = 10;
const POSITION_ITERATIONS = 8;

class Game {
  constructor(server) {
    this.tick = 0;
    this.state = new WorldState()
    this.world = new World({
      allowSleep: true,
    });
    this.io = geckos({
      iceServers: [],
    })
    this.io.addServer(server)

    this.io.onConnection((channel) => {
      console.log('Connected user ' + channel.id)
      const player = new Player(this)
      channel.playerId = player.id;
      channel.player = player;
      player.spawn()

      channel.onDisconnect(() => {
        console.log('Disconnect user ' + channel.id)
        player.disconnect()
      })

      channel.on('input', (data) => {
        const { arrows, pointer } = data;
        const vx = arrows === 8 || arrows === 9 || arrows === 10 ? 50 : arrows === 4 || arrows === 5 || arrows === 6 ? -50 : 0
        const vy = arrows === 1 || arrows === 5 || arrows === 9 ? -50 : arrows === 2 || arrows === 6 || arrows === 10 ? 50 : 0
        if (channel.player) {
          channel.player.vessel.body.setLinearVelocity(Vec2(vx, vy))
          const { x, y } = channel.player.vessel.body.getPosition()
          channel.player.vessel.body.setAngle(Math.atan2(pointer.y - y, pointer.x - x));
        }
      })

      channel.emit('ready', { playerId: channel.playerId })
    })

    setGameLoop((delta) => {

      //compute step of game engine
      this.world.step(1 / FPS, VELOCITY_ITERATIONS, POSITION_ITERATIONS);

      // only send the update to the client at 30 FPS (save bandwidth)
      if (this.tick++ % 2 === 0) return

      const buffer = this.state.getBuffer()
      this.io.raw.room().emit(buffer)

    }, 1000 / FPS);

  }
}

module.exports.default = Game