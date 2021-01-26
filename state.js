const { SnapshotInterpolation } = require('@geckos.io/snapshot-interpolation')

const isClient = typeof window !== 'undefined'

const Player = (isClient ? require('./components/player/client').default : require('./components/player/server').default)
const Soldier = (isClient ? require('./components/soldier/client').default : require('./components/soldier/server').default)
const Wall = (isClient ? require('./components/wall/client').default : require('./components/wall/server').default)
const Bullet = (isClient ? require('./components/bullet/client').default : require('./components/bullet/server').default)
const { GE_FPS } = require('./constants')

const { BufferSchema, Model } = require('@geckos.io/typed-array-buffer-schema')
const { string8, uint64 } = require('@geckos.io/typed-array-buffer-schema')
const soldierDef = require('./components/soldier/common').schema
const bulletDef = require('./components/bullet/common').schema
const { List } = require('./utils')

const soldierSchema = BufferSchema.schema('soldier', soldierDef)
const bulletSchema = BufferSchema.schema('bullet', bulletDef)

const snapshotSchema = BufferSchema.schema('snapshot', {
    id: { type: string8, length: 6 },
    time: uint64,
    state: { soldiers: [soldierSchema], bullets: [bulletSchema] }
})

const snapshotModel = new Model(snapshotSchema)

class WorldState {
    constructor(game) {
        this.isClient = typeof window !== 'undefined'
        this.game = game;
        this.players = new List(Player)
        this.soldiers = new List(Soldier)
        this.walls = new List(Wall)
        this.bullets = new List(Bullet)
        this.dirty = true;

        this.SI = new SnapshotInterpolation(GE_FPS)
    }
    getObjectsBuffer() {
        const snapshot = this.SI.snapshot.create({
            soldiers: this.soldiers.map(soldier => soldier.getSnapshot()),
            bullets: this.bullets.map(bullet => bullet.getSnapshot())
        });
        return snapshotModel.toBuffer(snapshot)
    }
    getUpdates(all) {
        const players = [];
        this.players.toArray().forEach(it => {
            if (all) {
                players.push(it.getSnapshot())
            } else {
                const changes = it.getSnapshotChanges()
                if (Object.keys(changes).length) {
                    players.push(changes)
                }
            }
        })
        const walls = [];
        this.walls.toArray().forEach(it => {
            if (all) {
                walls.push(it.getSnapshot())
            } else {
                const changes = it.getSnapshotChanges()
                if (Object.keys(changes).length) {
                    walls.push(changes)
                }
            }
        })
        this.dirty = false;
        return { players, walls }
    }
    readObjectsBuffer(buffer) {
        const snapshot = snapshotModel.fromBuffer(buffer)
        this.SI.snapshot.add(snapshot)
    }
    clientTick() {
        const snap = this.SI.vault.get() //get latest snapshot from server
        const snapState = snap?.state
        const player = this.players.list.get(this.game.playerId);

        //todo handle as well deletions in state
        snapState?.soldiers.forEach(props => {
            if (!this.soldiers.has(props.id)) {
                if (player?.vesselId === props.id) {
                    const newSoldier = new Soldier(this.game, { ...props, player })
                    player.vessel = newSoldier
                } else {
                    new Soldier(this.game, props)
                }
            }
        })
        snapState?.bullets?.forEach(props => {
            if (!this.bullets.has(props.id)) {
                new Bullet(this.game, props)
            }
        })
    }
    reconcile() {
        const snap = this.SI.vault.get() //get latest snapshot from server
        const snapState = snap?.state
        snapState?.soldiers.forEach(props => {
            this.soldiers.list.get(props.id).reconcile(props, snap, this.SI)
        })
        console.log('................this.bullets.list', this.bullets.list.get(0)?.name)
        snapState?.bullets?.forEach(props => {
            this.bullets.list.get(props.id).reconcile(props, snap, this.SI)
        })
    }
    updateFromServer(data) {
        const { players, walls } = data
        players.forEach(props => {
            if (this.players.has(props.id)) {
                this.players.list.get(props.id).updateFromServer(props)
            } else {
                new Player(this.game, props)
            }
        })
        walls.forEach(props => {
            if (this.walls.has(props.id)) {

            } else {
                new Wall(this.game, props)
            }
        })
    }
}

module.exports = { WorldState }