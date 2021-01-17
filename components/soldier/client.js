import { Sprite } from 'pixi.js';
import { game } from '../../client'

class Soldier {
    static readSnapshot = function (list, snap) {
        const { id, x, y, angle } = snap;

        const exists = list.has(id)

        if (!exists) {
            const soldier = new Soldier(x, y, angle);
            list.set(id, soldier)
        } else {
            const soldier = list.get(id)
            soldier.sprite.x = x;
            soldier.sprite.y = y;
            soldier.sprite.rotation = angle;
        }
    }

    constructor(x, y, angle) {
        // const body = world.createDynamicBody({ position: Vec2(x, y), userData: newPlayer }).createFixture(Circle(1), 10.0);
        this.sprite = new Sprite(game.resources.soldier.texture);

        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;

        this.sprite.rotation = angle;

        game.viewport.addChild(this.sprite);
    }
    kill() {
        this.sprite.parent.removeChild(this.sprite);
    }
}

export default Soldier