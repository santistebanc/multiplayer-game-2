export function keyboard(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
        if (event.key === key.value) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    //The `upHandler`
    key.upHandler = event => {
        if (event.key === key.value) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener(
        "keydown", downListener, false
    );
    window.addEventListener(
        "keyup", upListener, false
    );

    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };

    return key;
}

export default (game) => {

    const interaction = game.app.renderer.plugins.interaction;

    //wasd keys
    const up = keyboard('w');
    const left = keyboard('a');
    const down = keyboard('s');
    const right = keyboard('d');

    let prevMouseX = null;
    let prevMouseY = null;
    let prevKey = 0;

    return {
        getArrows: () => {
            let key = 0;
            if (up.isDown) {
                key += 1
            }
            if (down.isDown) {
                key += 2
            }
            if (left.isDown) {
                key += 4
            }
            if (right.isDown) {
                key += 8
            }
            prevKey = key

            return { key, prevKey, arrows: !!key ? key : undefined }
        },
        getPointer: () => {
            const mouse_loc = game.viewport.toWorld(interaction.mouse.global.x, interaction.mouse.global.y);

            const mouseX = +mouse_loc.x.toFixed(4);
            const mouseY = +mouse_loc.y.toFixed(4);

            const pos = { x: mouseX, y: mouseY }
            const prevPos = { x: prevMouseX, y: prevMouseY }
            const changed = (Number.isFinite(mouseX) && mouseX !== prevMouseX) || (Number.isFinite(mouseY) && mouseY !== prevMouseY)
            prevMouseX = mouseX;
            prevMouseY = mouseY;

            return { pos, prevPos, pointer: changed ? pos : undefined }
        }
    }

}