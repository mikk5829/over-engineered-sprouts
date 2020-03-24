import {SproutWorld} from "./modules/SproutWorld.js";
import {POINT_COLOR, SEL_POINT_COLOR, HOVER_POINT_COLOR, STROKE_COLOR, POINT_SIZE} from "./modules/SproutWorld.js";


function getCanvas() {
    return document.getElementById("sproutGameCanvas");
}

paper.install(window); // Make the paper scope global
window.onload = function () {
    paper.setup(getCanvas());

    var rect = new paper.Path.Rectangle({
        point: [0, 0],
        size: [getCanvas().clientWidth, getCanvas().clientHeight],
        fillColor: 'lavender'
    });
    rect.sendToBack();
    let backgroundLayer = new paper.Layer(rect);
    paper.project.insertLayer(0, backgroundLayer);


    let world = new SproutWorld();
    world.initializeMap(null, 10);

    let tool = new paper.Tool();

    /*tool.onMouseDown = function onMouseDown(e) {
        if (world.points.includes(e.item)) {
            if (e.item.data.connections < 3) {
                e.item.fillColor = SEL_POINT_COLOR;
                world.select(e.item);
            }
        }
    };*/

    tool.onMouseDrag = function onMouseDrag(e) {
        if (world.drag) world.currentCurve.add(e.point);
    };

    tool.onMouseUp = function onMouseUp(e) {
        // Reset point colors
        for (let p of world.points) p.fillColor = POINT_COLOR;
        if (world.points.includes(e.item)) e.item.fillColor = HOVER_POINT_COLOR;

        // Reset the selection
        if (world.target) world.submitSelection();
        else if (world.source) world.resetSelection();
    };
};

// DON'T Remove commented code yet
/*
window.onload = function() {

    let canvas = document.getElementById('sproutGameCanvas');

    const sprout_scope = new paper.PaperScope();

    const world = new SproutWorld(sprout_scope, canvas);

    // Check if user has loaded a map from file
    let loaded_game = localStorage.getItem("loaded-game");
    if (loaded_game != null) {
      let parsed = JSON.parse(loaded_game);
      world.generateWorld(null,parsed.init_points);
      localStorage.removeItem("loaded-game"); // Cleaning up local storage
    } else {
      world.generateWorld(null,15);
    }

};
*/