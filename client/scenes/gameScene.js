import { Scene } from 'phaser'
import Player from '../components/player'
import Cursors from '../components/cursors'
import Controls from '../components/controls'
import FullscreenButton from '../components/fullscreenButton'
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation';
import { snapshotModel } from '../../shared/models'

const SI = new SnapshotInterpolation(30) // 30 FPS

export default class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.objects = {}
    this.playerId
    this.dudes = new Map()
  }

  init({ channel }) {
    this.channel = channel
  }

  preload() {
    this.load.image('controls', 'controls.png')
    this.load.spritesheet('fullscreen', 'fullscreen.png', {
      frameWidth: 64,
      frameHeight: 64
    })
    this.load.spritesheet('player', 'player.png', {
      frameWidth: 32,
      frameHeight: 48
    })
  }

  create() {
    new Cursors(this, this.channel)
    new Controls(this, this.channel)

    FullscreenButton(this)

    this.channel.onRaw(buffer => {

      const snapshot = snapshotModel.fromBuffer(buffer)
      SI.addSnapshot(snapshot)
    })

    this.channel.on('removePlayer', playerId => {
      try {
        this.dudes.get(playerId).dude.destroy()
        this.dudes.delete(playerId);
      } catch (error) {
        console.error(error.message)
      }
    })

    this.channel.on('getId', playerId36 => {
      this.playerId = parseInt(playerId36, 36)
      this.channel.emit('addPlayer')
    })

    this.channel.emit('getId')

  }

  update() {
    const snap = SI.calcInterpolation('x y', 'players')
    if (!snap) return
    
    const { state } = snap
    if (!state) return
    
    state.forEach(dude => {
      const { x, y, id } = dude
      const exists = this.dudes.has(id)

      if (!exists) {
        let _dude = new Player(this, id, x || 200, y || 200);
        this.dudes.set(id, { dude: _dude })
      } else {
        const _dude = this.dudes.get(id).dude
        _dude.setPosition(x, y)
      }
    })
  }

}
