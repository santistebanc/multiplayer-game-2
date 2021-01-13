const geckos = require('@geckos.io/server').default
const { iceServers } = require('@geckos.io/server')
const { SnapshotInterpolation } = require('@geckos.io/snapshot-interpolation')
const SI = new SnapshotInterpolation()

const { Scene } = require('phaser')
const Player = require('./components/player')


class GameScene extends Scene {

  constructor() {
    super({ key: 'GameScene' })
    this.tick = 0
    this.playerId = 0
  }

  init() {
    this.io = geckos({
      iceServers: iceServers,
    })
    this.io.addServer(this.game.server)
  }

  getId() {
    return this.playerId++
  }

  create() {
    this.playersGroup = this.add.group()

    this.io.onConnection((channel) => {
      channel.onDisconnect(() => {
        console.log('Disconnect user ' + channel.id)
        this.playersGroup.children.each((player) => {
          if (player.playerId === channel.playerId) {
            player.kill()
          }
        })
        channel.room.emit('removePlayer', channel.playerId)
      })

      channel.on('getId', () => {
        channel.playerId = this.getId()
        channel.emit('getId', channel.playerId.toString(36))
      })

      channel.on('playerMove', (data) => {
        this.playersGroup.children.iterate((player) => {
          if (player.playerId === channel.playerId) {
            player.setMove(data)
          }
        })
      })

      channel.on('addPlayer', (data) => {
        let dead = this.playersGroup.getFirstDead()
        if (dead) {
          dead.revive(channel.playerId, false)
        } else {
          this.playersGroup.add(
            new Player(
              this,
              channel.playerId,
              Phaser.Math.RND.integerInRange(100, 700)
            )
          )
        }
      })

      channel.emit('ready')
    })

  }

  update() {
    this.tick++

    // only send the update to the client at 30 FPS (save bandwidth)
    if (this.tick % 2 !== 0) return
    const dudes = []

    this.playersGroup.children.iterate((player) => {
      dudes.push({ id: player.playerId, x: player.x, y: player.y, dead: player.dead })
      player.postUpdate()
    })

    const snapshot = SI.snapshot.create(dudes)

    this.io.room().emit('snapshot', snapshot)
  }
}

module.exports = GameScene
