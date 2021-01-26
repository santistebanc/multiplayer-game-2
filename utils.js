var deepEqual = require('deep-equal')

function snapshotChanges(getSnapshotFunc) {
    const prev = {}
    return function () {
        const current = getSnapshotFunc.call(this)
        const res = {}
        Object.keys(current).forEach(key => {
            if (!deepEqual(current[key], prev[key])) {
                res[key] = current[key]
                prev[key] = current[key]
            }
        })
        return res
    }
}

class List {
    static lists = new Map()
    constructor(objClass) {
        this.objClass = objClass;
        this.objConst = objClass.constructor;
        this.count = 0;
        List.lists.set(this.name, this)
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

module.exports = { snapshotChanges, List }