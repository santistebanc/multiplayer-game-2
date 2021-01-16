const { BufferSchema, Model } = require('@geckos.io/typed-array-buffer-schema')
const { string8, uint64 } = require('@geckos.io/typed-array-buffer-schema')
const playerDef = require('./components/player/common').schema
const soldierDef = require('./components/soldier/common').schema

const playerSchema = BufferSchema.schema('player', playerDef)
const soldierSchema = BufferSchema.schema('soldier', soldierDef)

const snapshotSchema = BufferSchema.schema('snapshot', {
    id: { type: string8, length: 6 },
    time: uint64,
    state: { players: [playerSchema], soldiers: [soldierSchema] }
})

module.exports.snapshotModel = new Model(snapshotSchema)