import {HOVER_POINT_COLOR, SEL_POINT_COLOR, SproutWorld, STROKE_COLOR} from "./modules/SproutWorld.js";

/**
 * Client socket handler
 * @namespace Socket
 * @author Laura Hansen & Benjamin Starostka
 * */


let world;
let remainingMoves;

/**
 * Make the paper scope global
 * @memberOf Socket
 */
paper.install(window);
$(function () {

        $.submitMove = function () {
            // Submits the next move in the list
            if (remainingMoves.length === 0) {
                $('#status-header').text('Simulation successful!');
                return;
            }
            let move = remainingMoves.shift();
            let p1 = world.points[move.dot1 - 1];
            let p2 = world.points[move.dot2 - 1];
            if (p1 === p2) alert("Warning - edge case when trying to simulate a loop");

            socket.emit('possiblePath', p1.data.id, p2.data.id, function (possible) {
                if (possible) { // Server approves submission
                    world.source = p1;
                    world.target = p2;
                    world.suggestPath(p1, p2);
                    world.currentPath = world.suggestedPath.clone();
                    world.submitSelection(true);

                } else { // Server doesn't approve submission
                    $('#status-header').text(`Illegal move from ${p1.data.id} to ${p1.data.id}.`);
                    world.resetSelection();
                }
            });
        };

        $("#game-back-btn").click(function () {
            paper.project.activeLayer.removeChildren();
            paper.view.remove();
            $.changeView("main_menu");
            world = undefined;
            location.reload();

        });

        $.startSimulation = function (initialPoints, moves) {
            $('#status-header').text('Simulation ongoing');
            paper.setup(getCanvas());
            paper.project.activeLayer.locked = status !== playerNum;
            world = new SproutWorld(true);
            for (let i = 0; i < initialPoints.length; i++) {
                let pos = new paper.Point(initialPoints[i][1], initialPoints[i][2]);
                let p = world.addPoint(i, pos, 0);
                world.collisionGrid.t_insert_rectangle(p.bounds, p);
            }
            remainingMoves = moves;
            $.submitMove();
        };

        socket.on("startGame", function (initialPoints, status) {
            if (status === playerNum) $('#status-header').text(`Your turn!`);
            else $('#status-header').text('Waiting for opponent to draw.');

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
                for (let point of world.points)  point.fillColor = world.pointColor;
                if (world.hoveredPoint) world.hoveredPoint.fillColor = HOVER_POINT_COLOR;
                for (let point of world.selectedPoints)point.fillColor = SEL_POINT_COLOR;
                if (world.source) world.source.fillColor = SEL_POINT_COLOR;
            };
        });

        socket.on('updateGame', function (fromId, toId, pathJson, pointData, status) {
            if (!world.simulation) {
                paper.project.activeLayer.locked = status !== playerNum;
                if (status === playerNum) $('#status-header').text(`Your turn!`);
                else $('#status-header').text('Waiting for opponent to draw.');
            }

            console.log("Received game update from server");
            let path = new paper.Path().importJSON(pathJson);
            path.strokeColor = STROKE_COLOR;
            path.strokeCap = 'round';
            path.strokeJoin = 'round';
            path.addTo(world.pathGroup);
            world.collisionGrid.t_insert_path(path.curves, path);

            world.points[fromId].data.connections++;
            world.points[toId].data.connections++;

            let pos = new paper.Point(pointData.center[1], pointData.center[2]);
            let p = world.addPoint(pointData.id, pos, 2);
            world.collisionGrid.t_insert_rectangle(p.bounds, p);
            if (world.simulation) $.submitMove();
        });

        socket.on('gameOver', function (winner) {
            paper.project.activeLayer.locked = true;
            if (playerNum === winner) $('#status-header').text('You won!');
            else $('#status-header').text('You lost...');
            paper.view.onFrame = null;
            world = undefined;
        });

        /**
         * Adds a new chat message to the chatlog
         * @memberOf Socket
         */
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
                for (let p of world.points) p.fillColor = world.pointColor;
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

function getCanvas() {
    return document.getElementById("sproutGameCanvas");
}