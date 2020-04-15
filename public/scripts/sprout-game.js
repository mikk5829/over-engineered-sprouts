import {SproutWorld} from "./modules/SproutWorld.js";
import {getCookieValue, getResolutionFromCookie} from "./modules/Utility.js"
import {POINT_COLOR, SEL_POINT_COLOR, HOVER_POINT_COLOR, STROKE_COLOR, POINT_SIZE} from "./modules/SproutWorld.js";

function getCanvas() {
    return document.getElementById("sproutGameCanvas");
}

function generateTileMap(resolution, detail, world) {
    let tile_x = resolution.res_x/detail; let tile_y = resolution.res_y/detail;
    console.log("tile_x: " + tile_x + " " + "tile_y: " + tile_y);
    let matrix = math.zeros(detail, detail);
    let tile_matrix = math.matrix(); tile_matrix.resize([detail, detail], null);
    let tile_size = tile_x;

    // Get obstacles, that is, things that stand in the way making their position invalid for search
    let obstacles = [...world.points]; // ToDo - add ,...world.paths later

    let tile_shapes = [];
    // Setup initial tileShape-grid needed to check for collisions
    matrix.forEach(function (value, index) {
        let x = index[0] * tile_size;
        let y = index[1] * tile_size;

        let size = new Size(tile_size, tile_size);

        let rect = new Rectangle(new Point(x, y), size);
        tile_matrix.set(index, rect, null); // Load tiles into tile_matrix
        let rect_shape = new Shape.Rectangle(rect);
        tile_shapes.push(rect_shape);
    });

    // Draw grid to visualize stuff
    let tile_shape_group = new paper.Group(tile_shapes);
    tile_shape_group.style = {
        strokeColor: 'black',
        strokeWidth: 0.5,
        strokeCap: 'round'
    };

    // Collect nearby tiles around obstacle objects
    let temp_tiles = [];
    obstacles.forEach(function (obstacle, obst_index, obst_array) {
        let obstacle_point = obstacle.position;
        let tile_distance = [math.round(obstacle_point.x/tile_size), math.round(obstacle_point.y/tile_size)];

        let surroundings = getSurroundings(tile_matrix, tile_distance[0], tile_distance[1]);
        surroundings.forEach(function (consider, cons_index) {
            temp_tiles.push(tile_matrix.get([consider.x,consider.y]));
        });
    });

    // Check if collected tiles intersect with obstacles
    let surrounding_tiles_group = new paper.Group(temp_tiles);

    //let tile_hit = nearby_tiles.hitTestAll(obstacle_point);

    //let intersections = obstacle.getIntersections();

    //console.log(nearby_tiles.children);
    //nearby_tiles.fillColor = 'red';

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

    generateTileMap(game_resolution, 64, world);
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