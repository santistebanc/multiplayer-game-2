import { Graphics } from 'pixi.js';
import { Wall } from './common';

class ClientWall extends Wall {
    constructor(game, props) {
        super(game, props)

        this.graph = new Graphics();
        this.graph.moveTo(this.vertices[0].x, this.vertices[0].y).lineStyle(10, 0x666666)
        this.vertices.slice(1).forEach(vertex => this.graph.lineTo(vertex.x, vertex.y))

        this.game.viewport.addChild(this.graph);
    }
    render() {
        this.graph.clear()
        this.graph.moveTo(this.vertices[0].x, this.vertices[0].y).lineStyle(10, 0x666666)
        this.vertices.slice(1).forEach(vertex => this.graph.lineTo(vertex.x, vertex.y))
    }
}

export default ClientWall