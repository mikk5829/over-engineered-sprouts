import {SproutWorld} from "./modules/SproutWorld.js";
import {getCookieValue, getResolutionFromCookie} from "./modules/Utility.js"
import {POINT_COLOR, SEL_POINT_COLOR, HOVER_POINT_COLOR, STROKE_COLOR, POINT_SIZE} from "./modules/SproutWorld.js";
import {CollisionGrid} from "./modules/CollisionGrid.js";

function getCanvas() {
    return document.getElementById("sproutGameCanvas");
}

function visualizeObstacles(collisionGrid, sproutWorld) {
    let cell_size = collisionGrid.cell_size;
    // Get initial obstacles
    let circle_obstacles = [...sproutWorld.points];
    // ToDo - paths and curves are also considered obstacles

    // Let's add them to our collisionGrid aka. spatialHash
    circle_obstacles.forEach(obst => collisionGrid.t_insert_rectangle(obst.bounds, obst));

    // DEBUGGING - Now let's draw those tiles that overlap with hitboxes
    let tile_shape_group = new paper.Group();
    for(let [key, set] of Object.entries(collisionGrid.contents)){
        let tile_pos = key.split(';');
        let x = tile_pos[0]*cell_size; let y = tile_pos[1]*cell_size;
        // Creating rectangle shape to visualize collided tile
        let rect = new Rectangle(new Point(x, y), cell_size);
        let rect_shape = new Shape.Rectangle(rect);
        rect_shape.opacity = 0.35;
        tile_shape_group.addChild(rect_shape);
    }
    tile_shape_group.style = {
        fillColor: 'red',
        strokeColor: 'black',
        strokeWidth: 1
    };


}

// ToDo put into Utility Class and create direction data-structure ignoring corners
// Distance let you control what level-out you want to search - NOT DONE
function getSurroundings(matrix, x, y, distance= 1) {
    let directions = [
        [-1,-1], [-1, 0], [-1, 1],
        [0,-1],           [0, 1],
        [1,-1],  [1, 0],  [1, 1],
    ];

    directions.forEach(function (dir, index) {
        dir[0] *= distance; dir[1] *= distance;
    });

    let neighbors = [];
    directions.forEach(function (direction, index) {
        let nrow = x + direction[0];
        let ncol = y + direction[1];
        if (nrow >= 0 && nrow < matrix._size[0] && ncol >= 0 && ncol < matrix._size[1]) {
            neighbors.push({x: nrow, y: ncol});
        }
    });
    return neighbors;
}

paper.install(window); // Make the paper scope global
window.onload = function () {
    let game_resolution = getResolutionFromCookie("gameResolution");
    let game_div = document.getElementById("game-container");
    game_div.style.width = game_resolution.res_x + "px"; game_div.style.height = game_resolution.res_y + "px";
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
    let collisionGrid = new CollisionGrid(16);
    visualizeObstacles(collisionGrid, world);


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
        }

        if (world.hoveredPoint) world.hoveredPoint.fillColor = HOVER_POINT_COLOR;

        for (let point of world.selectedPoints) {
            point.fillColor = SEL_POINT_COLOR;
        }

        if (world.source) world.source.fillColor = SEL_POINT_COLOR;

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