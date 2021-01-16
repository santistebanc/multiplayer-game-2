const { string16, uint16 } = require('@geckos.io/typed-array-buffer-schema')

module.exports.schema = {
    id: uint16,
    name: string16,
    vessel: uint16,
}