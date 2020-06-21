import {SproutWorld} from "./modules/SproutWorld.js";
import {getCookieValue, getResolutionFromCookie, worldInLocalStorage} from "./modules/Utility.js"
import {POINT_COLOR, SEL_POINT_COLOR, HOVER_POINT_COLOR, STROKE_COLOR, POINT_SIZE} from "./modules/SproutWorld.js";

function openGame() {

}

let world;
let remainingMoves;

function getCanvas() {
    return document.getElementById("sproutGameCanvas");
}

function reset() {
    paper.setup(getCanvas());
}


paper.install(window); // Make the paper scope global
$(function () {

        $.submitMove = function () {
            console.log("remaining:", remainingMoves)
            // Submits the next move in the list
            if (remainingMoves.length === 0) return;
            let move = remainingMoves.shift();
            console.log("move:", move);
            let p1 = world.points[move.dot1 - 1];
            let p2 = world.points[move.dot2 - 1];

            socket.emit('possiblePath', p1.data.id, p2.data.id, function (possible) {
                if (possible) { // Server giver lov
                    console.log("Possible")
                    world.source = p1;
                    world.target = p2;
                    world.suggestPath(p1, p2);
                    world.currentPath = world.suggestedPath.clone();
                    world.submitSelection(true);

                } else { // Server giver ikke lov
                    console.log("Impossible");
                    world.resetSelection();
                }
            });
        };

        $.startSimulation = function (initialPoints, moves) {
            paper.setup(getCanvas());
            paper.project.activeLayer.locked = status !== playerNum;
            world = new SproutWorld();
            for (let i = 0; i < initialPoints.length; i++) {
                let pos = new paper.Point(initialPoints[i][1], initialPoints[i][2]);
                let p = world.addPoint(i, pos, 0);
                world.collisionGrid.t_insert_rectangle(p.bounds, p);
            }
            // remainingMoves = localStorage.getItem("FileResultPaths");
            remainingMoves = moves;
            console.log(remainingMoves)
            console.log(remainingMoves.length)
            /*for (let move of remainingMoves) {
                $.submitMove(move);
            }*/
            $.submitMove();
        };

        socket.on("startGame", function (initialPoints, status) {
            paper.setup(getCanvas());
            paper.project.activeLayer.locked = status !== playerNum;
            world = new SproutWorld();

            for (let i = 0; i < initialPoints.length; i++) {
                let pos = new paper.Point(initialPoints[i][1], initialPoints[i][2]);
                let p = world.addPoint(i, pos, 0);
                world.collisionGrid.t_insert_rectangle(p.bounds, p);
            }

            $.disableOverlay();
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
            if (status) paper.project.activeLayer.locked = status !== playerNum;

            console.log("Received game update from server");

            let path = new paper.Path().importJSON(pathJson);
            path.strokeColor = STROKE_COLOR;
            path.strokeCap = 'round';
            path.strokeJoin = 'round';
            path.addTo(world.pathGroup);
            world.collisionGrid.t_insert_line(path.curves, path);

            world.points[fromId].data.connections++;
            world.points[toId].data.connections++;

            let pos = new paper.Point(pointData.center[1], pointData.center[2]);
            let p = world.addPoint(pointData.id, pos, 2)
            world.collisionGrid.t_insert_rectangle(p.bounds, p);
            $.submitMove();
        });

        socket.on('gameOver', function (winner) {
            if (playerNum === winner) alert('You won!');
            else alert('You lost...');
            paper.project.activeLayer.removeChildren();
            paper.view.remove();
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
                    let p1 = world.source;
                    let p2 = world.target;
                    let from = p1.data.id;
                    let to = p2.data.id;

                    // Ask server to suggest a valid path between the selected points
                    socket.emit('possiblePath', from, to, function (possible) {

                        if (possible) {
                            world.suggestPath(p1, p2);
                        } else console.log("Impossible");

                    });
                    world.resetSelection();
                } else if (!world.points.includes(e.item)) world.resetSelection(); // Cancel click-selection
            }
        };
    }
);
