const { World } = require('planck-js')
const { setGameLoop } = require('node-gameloop');
const geckos = require('@geckos.io/server').default
const { iceServers } = require('@geckos.io/server')
const { WorldState } = require('../state')
const { GE_FPS, GE_VELOCITY_ITERATIONS, GE_POSITION_ITERATIONS, DATA_FRACTION, SIMULATED_LATENCY, SIMULATED_LOSS } = require('../constants');
const Player = require('../components/player/server').default

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
        const func = () => {
          player.input(data)
        }
        if (SIMULATED_LATENCY || SIMULATED_LOSS) {
          //simulate latency and package loss
          if (Math.random() > (1 - SIMULATED_LOSS)) return
          setTimeout(() => func(), SIMULATED_LATENCY + Math.random() * 50)
        } else {
          func()
        }
      }
      )

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
