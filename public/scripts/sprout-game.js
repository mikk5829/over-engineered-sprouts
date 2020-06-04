import {SproutWorld} from "./modules/SproutWorld.js";
import {POINT_COLOR, SEL_POINT_COLOR, HOVER_POINT_COLOR, STROKE_COLOR, POINT_SIZE} from "./modules/SproutWorld.js";


function getCanvas() {
    return document.getElementById("sproutGameCanvas");
}

paper.install(window); // Make the paper scope global
window.onload = function () {
    paper.setup(getCanvas());

    // Draw background layer
    let rect = new paper.Path.Rectangle({
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

    tool.onMouseUp = function onMouseUp(e) {
        if (!world.clickSelection) {
            // Reset point colors
            for (let p of world.points) p.fillColor = POINT_COLOR;
            if (world.points.includes(e.item)) e.item.fillColor = HOVER_POINT_COLOR;

            // Reset the selection
            if (world.target) world.submitSelection();
            else if (world.source) world.resetSelection();
            // world.resetSelection(); evt hernede?

        } else if (world.clickSelection) {
            if (world.source && world.target) {
                console.log(`Selection: source ${world.source.id}, target ${world.target.id}`);
                if (world.possibleMove(world.source, world.target, true))
                    world.findPath(world.source, world.target, true);
                // The user has clicked on two points.
                // TODO: Check if a path exists between these points
                world.resetSelection();
            } else if (!world.points.includes(e.item)) {
                world.resetSelection();
            }
        }
    };

    paper.view.onFrame = function () {
        // Update the colors of the points
        for (let point of world.points) {
            point.fillColor = POINT_COLOR;
            for (let path of point.edges){
                //path.strokeColor = "black";
            }
        }

        if (world.hoveredPoint) world.hoveredPoint.fillColor = HOVER_POINT_COLOR;

        for (let point of world.selectedPoints) {
            point.fillColor = SEL_POINT_COLOR;
        }

        if (world.source) world.source.fillColor = SEL_POINT_COLOR;

    }
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