import {SproutWorld} from "./modules/SproutWorld.js";
import {getCookieValue, getResolutionFromCookie, worldInLocalStorage} from "./modules/Utility.js"
import {POINT_COLOR, SEL_POINT_COLOR, HOVER_POINT_COLOR, STROKE_COLOR, POINT_SIZE} from "./modules/SproutWorld.js";

function openGame() {

}

let world;

function getCanvas() {
    return document.getElementById("sproutGameCanvas");
    // return $('#sproutGameCanvas'); //fixme virker ikke?
}

function reset() {
    paper.setup(getCanvas());
}


paper.install(window); // Make the paper scope global
$(function () {
    socket.on("startGame", function (initialPoints, status) {
        console.log(getCanvas().width, getCanvas().height);
        console.log("startGame", initialPoints, status, playerNum);

        paper.setup(getCanvas());
        paper.project.activeLayer.locked = status !== playerNum;
        world = new SproutWorld();

        for (let i = 0; i < initialPoints.length; i++) {
            let pos = new paper.Point(initialPoints[i][1], initialPoints[i][2]);
            world.addPoint(i, pos, 0)
        }

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
    });

    socket.on('updateGame', function (fromId, toId, pathJson, pointData, status) {
        paper.project.activeLayer.locked = status !== playerNum;

        console.log("Received game update from server");

        let path = new paper.Path().importJSON(pathJson);
        path.strokeColor = STROKE_COLOR;
        path.strokeCap = 'round';
        path.strokeJoin = 'round';
        path.addTo(world.pathGroup);

        world.points[fromId].data.connections++;
        world.points[toId].data.connections++;

        let pos = new paper.Point(pointData.center[1], pointData.center[2]);
        world.addPoint(pointData.id, pos, 2)
    });

    socket.on('gameOver', function (winner, loser) {
        if (playerNum === winner) alert('You won!');
        else alert('You lost...');
        $.changeView("main_menu");
        world = undefined;
    });

    //Adds a new chat message to the chatlog
    socket.on('updateChat', function (timestamp, sender, msg) {
        let time = new Date(timestamp).toTimeString().slice(0, 5);
        let sent = `(${time}) ${sender}:`;
        console.log(`Received chat message: ${sent} ${msg}`);
        $('#messages > tbody:last-child').append('<tr> <th class="w3-left-align">' + sent + '</th><th class="w3-right-align">' + msg + ' </th></tr>');
    });

    let tool = new paper.Tool();

    tool.onMouseDown = function onMouseDown() {
        if (world.suggestedPath) world.suggestedPath.remove();
    };

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
                let from = world.source.data.id;
                let to = world.target.data.id;

                // Ask server to suggest a valid path between the selected points
                socket.emit('suggestPath', from, to, function (possible) {

                    if (possible) {
                        console.log("Possible");
                    } else console.log("Impossible");

                });
                world.resetSelection();
            } else if (!world.points.includes(e.item)) world.resetSelection(); // Cancel click-selection
        }
    };
});
