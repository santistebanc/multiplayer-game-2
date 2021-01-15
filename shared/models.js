const { BufferSchema, Model } = require('@geckos.io/typed-array-buffer-schema')
const { uint8, int16, string8, uint64 } = require('@geckos.io/typed-array-buffer-schema')

const playerSchema = BufferSchema.schema('player', {
    id: {type: uint8, digits: 2},
    x: int16,
    y: int16,
    dead: {type: uint8, digits: 1}
})

const snapshotSchema = BufferSchema.schema('snapshot', {
    id: { type: string8, length: 6 },
    time: uint64,
    state: { players: [playerSchema] }
})

module.exports.snapshotModel = new Model(snapshotSchema)