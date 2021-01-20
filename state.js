const { SnapshotInterpolation } = require('@geckos.io/snapshot-interpolation')

const isClient = typeof window !== 'undefined'

const Player = (isClient ? require('./components/player/client').default : require('./components/player/server').default)
const Soldier = (isClient ? require('./components/soldier/client').default : require('./components/soldier/server').default)
const { GE_FPS, DATA_FRACTION } = require('./constants')

const { BufferSchema, Model } = require('@geckos.io/typed-array-buffer-schema')
const { string8, uint64 } = require('@geckos.io/typed-array-buffer-schema')
const soldierDef = require('./components/soldier/common').schema

const soldierSchema = BufferSchema.schema('soldier', soldierDef)

const snapshotSchema = BufferSchema.schema('snapshot', {
    id: { type: string8, length: 6 },
    time: uint64,
    state: { soldiers: [soldierSchema] }
})

const snapshotModel = new Model(snapshotSchema)

const lists = new Map()

class List {
    constructor(objClass) {
        this.objClass = objClass;
        this.objConst = objClass.constructor;
        this.count = 0;
        lists.set(this.name, this)
        this.list = new Map()
    }
    has(instOrId) {
        if (instOrId.id) {
            return this.list.has(instOrId.id)
        } else {
            return this.list.has(instOrId)
        }
    }
    add(inst) {
        const id = inst.id ?? this.count++;
        return this.list.set(id, inst).get(id)
    }
    remove(instOrId) {
        if (instOrId.id) {
            return this.list.delete(instOrId.id)
        } else {
            return this.list.delete(instOrId)
        }
    }
    update(props) {
        const id = props.id;
        return this.list.get(id).update(props)
    }
    toArray() {
        return Array.from(this.list.values())
    }
    map(func) { return this.toArray().map(func) }
}

class WorldState {
    constructor(game) {
        this.isClient = typeof window !== 'undefined'
        this.game = game;
        this.players = new List(Player)
        this.soldiers = new List(Soldier)
        this.dirty = true;

        this.SI = new SnapshotInterpolation(GE_FPS)
    }
    getObjectsBuffer() {
        const snapshot = this.SI.snapshot.create({
            soldiers: this.soldiers.map(soldier => soldier.getSnapshot())
        });
        return snapshotModel.toBuffer(snapshot)
    }
    getUpdates() {
        //TODO send only changed bits of data
        return { players: this.players.map(player => player.getSnapshot()) }
    }
    readObjectsBuffer(buffer) {
        const snapshot = snapshotModel.fromBuffer(buffer)
        this.SI.snapshot.add(snapshot)
        this.latestReceived = SnapshotInterpolation.Now()
    }
    clientTick() {
        const snap = this.SI.vault.get() //get latest snapshot from server

        //todo handle as well deletions in state
        snap?.state?.soldiers.forEach(props => {
            if (!this.soldiers.has(props.id)) {
                new Soldier(this.game, props)
            }
        })
    }
    reconcile() {
        const snap = this.SI.vault.get() //get latest snapshot from server
        snap?.state?.soldiers.forEach(props => {
            this.soldiers.list.get(props.id).reconcile(props, snap, this.SI, this.latestReceived)
        })
    }
    updateFromServer(data) {
        const { players } = data
        players.forEach(props => {
            if (this.players.has(props.id)) {
                this.players.list.get(props.id).updateFromServer(props)
            } else {
                new Player(this.game, props)
            }
        })
    }
}

module.exports = { WorldState }