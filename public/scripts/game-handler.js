import {SproutWorld} from "./modules/SproutWorld.js";
import {getCookieValue, getResolutionFromCookie} from "./modules/Utility.js"
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
    socket.on("startGame", function (initialPoints) {
        console.log(getCanvas().width, getCanvas().height);
        console.log("startGame", initialPoints);

        paper.setup(getCanvas());
        world = new SproutWorld();

        // for (let point of initialPoints) {
        //     // let pos = new paper.Point(point.position[1], initialPoints[i][2]);
        //     let pos = new paper.Point(point.position);
        //     world.addPoint(point.id, pos, 0)
        // }

        for (let i = 0; i < initialPoints.length; i++) {
            let pos = new paper.Point(initialPoints[i][1], initialPoints[i][2]);
            world.addPoint(i, pos, 0)
        }

        paper.view.onFrame = function () {
            // Update the colors of the points
            for (let point of world.points) {
                point.fillColor = POINT_COLOR;
                /*for (let path of point.edges) {
                    //path.strokeColor = "black";
                }*/
            }

            if (world.hoveredPoint) world.hoveredPoint.fillColor = HOVER_POINT_COLOR;

            for (let pointId of world.selectedPoints) {
                world.points[pointId].fillColor = SEL_POINT_COLOR;
            }

            if (world.source) world.points[world.source].fillColor = SEL_POINT_COLOR;
        }


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

    /*  paper.setup(getCanvas());

      let world = new SproutWorld();
      world.initializeMap(null, 10);
  */
    socket.on('updateGame', function (fromId, toId, pathJson, pointData) {
        console.log("Received game update from server");

        let path = new paper.Path().importJSON(pathJson);
        path.strokeColor = STROKE_COLOR;
        path.strokeCap = 'round';
        path.strokeJoin = 'round';
        path.addTo(world.lineGroup);

        world.points[fromId].connections++;
        world.points[toId].connections++;

        let pos = new paper.Point(pointData.center[1], pointData.center[2]);
        world.addPoint(pointData.id, pos, 2)
    });

    socket.on('showIntersections', function (intersections) {
        console.log("showintersects", intersections);

        for (let pointData of intersections) {
            console.log(pointData);
            let pos = new paper.Point(pointData[1], pointData[2]);
            let point = new paper.Path.Circle(pos, POINT_SIZE);
            point.fillColor = 'red';
        }
    });


    let tool = new paper.Tool();
    tool.onMouseUp = function onMouseUp(e) {
        console.log("tool.onmouseup", world.eventStatus());
        if (!world.clickSelection) {
            // Reset point colors
            for (let p of world.points) p.fillColor = POINT_COLOR;
            if (world.points.includes(e.item)) e.item.fillColor = HOVER_POINT_COLOR;

            // Reset the selection
            if (world.target !== null) {
                console.log("submitselection", world.target);
                world.submitSelection();
            } else if (world.source !== null) {
                console.log("resetselection", world.source);
                world.resetSelection();
            }

            // TODO move to serverside, fix ids
        } else if (world.clickSelection) {
            if (world.source !== null && world.target !== null) {
                console.log(`Selection: source ${world.source.id}, target ${world.target.id}`);
                if (world.possibleMove(world.source, world.target))
                    world.findPath(world.source, world.target);
                // The user has clicked on two points.
                // TODO: Check if a path exists between these points
                console.log("resetselection clicksel", world.source, world.target);
                world.resetSelection();
            } else if (!world.points.includes(e.item)) {
                console.log("resetselection clicksel cancelled");
                world.resetSelection();
            }
        }
    };
});
