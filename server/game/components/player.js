class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, playerId, x = 200, y = 200) {
    super(scene, x, y, '')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.scene = scene

    this.prevX = -1
    this.prevY = -1

    this.dead = false
    this.prevDead = false

    this.playerId = playerId
    this.move = {}

    this.body.setSize(32, 48)

    this.prevNoMovement = true

    this.setCollideWorldBounds(true)

    scene.events.on('update', this.update, this)
  }

  kill() {
    this.dead = true
    this.setActive(false)
  }

  revive(playerId) {
    this.playerId = playerId
    this.dead = false
    this.setActive(true)
    this.setVelocity(0)
  }

  setMove(data) {
    let int = parseInt(data, 36)

    let move = {
      left: int === 1 || int === 5 ? true : false,
      right: int === 2 || int === 6 ? true : false,
      up: int === 4 || int === 6 || int === 5 ? true : false,
      none: int === 8 ? true : false
    }

    this.move = move
  }

  update() {
    if (this.move.left) this.setVelocityX(-160)
    else if (this.move.right) this.setVelocityX(160)
    else this.setVelocityX(0)

    if (this.move.up && this.body.onFloor()) this.setVelocityY(-550)
  }

  postUpdate() {
    this.prevX = this.x
    this.prevY = this.y
    this.prevDead = this.dead
  }
}

module.exports = Player
