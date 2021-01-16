const { SnapshotInterpolation } = require('@geckos.io/snapshot-interpolation')

const { snapshotModel } = require('../commons')

class WorldState {
    constructor() {
        this.SI = new SnapshotInterpolation()
        this.objects = new Map()
    }
    add(instance, listName) {
        const list = this.objects.get(listName)
        if (list) {
            list.add(instance)
        } else {
            this.objects.set(listName, new Set([instance]))
        }
    }
    remove(instance, listName) {
        this.objects.get(listName).delete(instance)
    }
    getBuffer() {
        const state = Array.from(this.objects).reduce((obj, [key, list]) => {
            obj[key] = Array.from(list).map(it => it.getSnapshot());
            return obj;
        }, {});

        const snapshot = this.SI.snapshot.create(state);
        return snapshotModel.toBuffer(snapshot)
    }
}

module.exports.default = WorldState