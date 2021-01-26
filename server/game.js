require('@babel/polyfill')
const { World, Vec2 } = require('planck-js')
const { setGameLoop } = require('node-gameloop');
const geckos = require('@geckos.io/server').default
const { iceServers } = require('@geckos.io/server')
const { WorldState } = require('../state')
const { GE_FPS, GE_VELOCITY_ITERATIONS, GE_POSITION_ITERATIONS, DATA_FRACTION, SIMULATED_LATENCY, SIMULATED_LOSS } = require('../constants');
const Player = require('../components/player/server').default;
const Wall = require('../components/wall/server').default

class Game {
  constructor(server) {
    //tick increases on every frame
    this.tick = 0;

    //initialize world state store
    this.state = new WorldState(this)

    //initialize game engine world
    this.world = new World({
      allowSleep: true,
    });

    //initialize io communication
    this.io = geckos({
      iceServers: process.env.NODE_ENV === 'production' ? iceServers : [],
    })
    this.io.addServer(server)


    //create walls
    let vertices = [
      Vec2(1000, 1000),
      Vec2(1400, 1000),
      Vec2(1400, 2000),
      Vec2(1000, 2000)
    ];
    const mauer = new Wall(this, { id: 0, vertices })


    //check connections of users
    this.io.onConnection((channel) => {
      console.log('Connected user ' + channel.id)
      const player = this.connectPlayer(channel.id)
      player.spawn()

      channel.onDisconnect(() => {
        console.log('Disconnect user ' + channel.id)
        player.disconnect()
      })

      //handle every input of client user (e.g. mouse, or keyboard press)
      channel.on('input', (data) => {
        player.input(data)
      })

      channel.on('getState', () => {
        this.io.room().emit(
          'update',
          this.state.getUpdates(true),
          {
            reliable: true,
            interval: 150,
            runs: 10
          }
        )
      })

      //notify client communication connection server-client is ready
      channel.emit('ready', { playerId: player.id })
    })


    //game loop
    setGameLoop((delta) => {
      this.update(delta)
    }, 1000 / GE_FPS);

  }
  update(delta) {
    //compute step of game engine
    this.world.step(delta, GE_VELOCITY_ITERATIONS, GE_POSITION_ITERATIONS);

    //send updated objects state to all clients on every DATA_FRACTION ticks (saves bandwidth)
    if (this.tick++ % DATA_FRACTION === 0) {
      const buffer = this.state.getObjectsBuffer()
      this.io.raw.room().emit(buffer)
    }

    //send crucial state updates to all clients if there was any change
    if (this.state.dirty) {
      this.io.room().emit(
        'update',
        this.state.getUpdates(),
        {
          reliable: true,
          interval: 150,
          runs: 10
        }
      )
    }

  }
  connectPlayer(channelId) {
    const instance = new Player(this, { id: channelId })
    return instance
  }
  disconnectPlayer(instance) {
    this.state.players.remove(instance)
  }
}

module.exports.default = Game
