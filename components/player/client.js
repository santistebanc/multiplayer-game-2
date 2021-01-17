import { game } from '../../client'

class Player {
    static readSnapshot = function (list, snap) {
        const { id, name, vessel } = snap;

        const exists = list.has(id)

        if (!exists) {
            const player = new Player(id, name);
            list.set(id, player)
            player.vessel = game.soldiers.get(vessel)
        } else {
            const player = list.get(id)
            player.name = name;
            player.vessel = game.soldiers.get(vessel)
        }
    }
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

export default Player