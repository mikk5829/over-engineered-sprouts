import {SproutWorld} from "./modules/SproutWorld.js";
import {getCookieValue, getResolutionFromCookie, worldInLocalStorage} from "./modules/Utility.js"
import {POINT_COLOR, SEL_POINT_COLOR, HOVER_POINT_COLOR, STROKE_COLOR, POINT_SIZE} from "./modules/SproutWorld.js";

function getCanvas() {
    return document.getElementById("sproutGameCanvas");
    // return $('#sproutGameCanvas'); //fixme virker ikke?
}

function reset() {
    paper.setup(getCanvas());
}

paper.install(window); // Make the paper scope global
$(function() {
    socket.on('updateGame', function(data) {
        console.log("updateGame",data);
        let newLine = new paper.Path(data);
    });

    //Adds a new chat message to the chatlog
    socket.on('updateChat', function (timestamp, sender, msg) {
        let time = new Date(timestamp).toTimeString().slice(0, 5);
        let sent = `(${time}) ${sender}:`;
        $('#messages > tbody:last-child').append('<tr> <th class="w3-left-align">' + sent + '</th><th class="w3-right-align">' + msg + ' </th></tr>');
    });

    // FIXME
    // let game_resolution = getResolutionFromCookie("gameResolution");
    // ${'.gameContainer'}.css({"width": str(game_resolution.res_x + "px"),"height":str(game_resolution.res_y + "px")});
    // $gameDiv.style.width = game_resolution.res_x + "px"; $gameDiv.style.height = game_resolution.res_y + "px";

    paper.setup(getCanvas());

    let world = new SproutWorld();

    let map_configuration = worldInLocalStorage();
    world.initializeMap(map_configuration, 10);

    let tool = new paper.Tool();
    tool.onMouseUp = function onMouseUp(e) {
        if (!world.clickSelection) {
            // Reset point colors
            for (let p of world.points) p.fillColor = POINT_COLOR;
            if (world.points.includes(e.item)) e.item.fillColor = HOVER_POINT_COLOR;

            // Reset the selection
            if (world.target) world.submitSelection();
            else if (world.source) world.resetSelection();

        } else if (world.clickSelection) {
            if (world.source && world.target) {
                console.log(`Selection: source ${world.source.id}, target ${world.target.id}`);
                if (world.possibleMove(world.source, world.target))
                    world.findPath(world.source, world.target);
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
});


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