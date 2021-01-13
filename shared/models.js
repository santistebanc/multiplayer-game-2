const { BufferSchema, Model } = require('@geckos.io/typed-array-buffer-schema')
const { uint8, int16, string8, uint64 } = require('@geckos.io/typed-array-buffer-schema')

const playerSchema = BufferSchema.schema('player', {
    id: uint8,
    x: int16,
    y: int16
})

const snapshotSchema = BufferSchema.schema('snapshot', {
    id: { type: string8, length: 6 },
    time: uint64,
    state: { players: [playerSchema] }
})

module.exports.snapshotModel = new Model(snapshotSchema)