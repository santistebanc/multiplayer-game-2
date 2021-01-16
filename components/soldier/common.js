const { uint16, float32 } = require('@geckos.io/typed-array-buffer-schema')

module.exports.schema = {
    id: uint16,
    x: float32,
    y: float32,
    angle: float32,
}