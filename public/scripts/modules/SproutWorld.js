/**
 * Generates the world
 * @namespace SproutWorld
 * */
const POINT_COLOR = 'Indigo';
const SEL_POINT_COLOR = 'Yellow';
const HOVER_POINT_COLOR = 'CornflowerBlue';
const STROKE_COLOR = 'Indigo';

const POINT_SIZE = 10;

export {POINT_COLOR, SEL_POINT_COLOR, HOVER_POINT_COLOR, STROKE_COLOR, POINT_SIZE}


export class SproutWorld {

    /**
     * World constructor
     * @constructor
     * @memberof SproutWorld
     * @param groups
     * @param sprout_configuration
     **/

    constructor(groups = [], sprout_configuration = null) {
        this.sprout_configuration = sprout_configuration;
        this.groups = groups;
        this.lineGroup = new paper.Group();
        this.points = [];

        this.dragEnabled = false;
        this.dragSelection = false; // Whether or not a line is currently being drawn
        this.clickSelection = false; // Whether or not the drawing should be updated right now
        this.source = null; // Source node of the current line
        this.target = null; // Target node of the current line


        this.hoveredPoint = null; // A legal point that the mouse hovers on
        this.selectedPoints = []; // The points which are currently selected/pressed
        this.currentLine = null; // The line currently being drawn by the player
    }

    /**
     * Generates the map
     * @memberof SproutWorld
     * */
    initializeMap(points) {
        for (let point of points) {
            console.log(point);
            this.addPoint(point, location, point.connections);
        }
    }

    select(point) {
        if (point.connections >= 3) return;
        if (!this.source) {
            this.source = point.data.id;
            if (!this.clickSelection) {
                this.currentLine = new paper.Path({
                    segments: [point.position],
                    strokeColor: STROKE_COLOR,
                    strokeCap: 'round',
                    strokeJoin: 'round'
                });
                this.currentLine.sendToBack();
            }
        } else if (!this.target) {
            this.target = point.data.id;
        }
    }

    resetSelection() {
        this.source = null;
        this.target = null;
        this.dragSelection = false;
        this.dragEnabled = false;
        this.clickSelection = false;
        this.selectedPoints = [];
        if (this.currentLine) this.currentLine.remove();
    }

    legalMove(startPoint, endPoint, newLine) {
        if (startPoint === endPoint && startPoint.connections >= 2) return false;
        else if (startPoint.connections >= 3 || endPoint.connections >= 3) return false;

        for (let line of this.lineGroup.getItems({type: 'path'})) {
            if (newLine.getIntersections(line).length > 0) {
                console.log("c", newLine.getIntersections(line).length);
                return false;
            }
        }

        return newLine.getIntersections(newLine).length <= 0;
    }

    submitSelection() {
        if (this.currentLine.segments.length <= 2) {
            this.resetSelection();
            return false;
        }
        console.log("source:", typeof this.source, this.source);
        console.log("target:", typeof this.target, this.target);
        let line = this.currentLine;
        let source = this.points[this.source];
        let target = this.points[this.target];

        // Trim the path underneath the points
        let sourcePoint = line.getCrossings(source)[0];
        let i = source === target ? 1 : 0;
        let targetPoint = line.getCrossings(target)[i];
        line.curves[0].point1 = sourcePoint.point;
        line.curves[line.curves.length - 1].point2 = targetPoint.point;

        // Send to server for validation
        console.log("submitpath segments:", line.segments);
        socket.emit('submitPath', line.exportJSON(), this.source, this.target, function (response) {
            console.log(response);
        });
        this.resetSelection();
    }


    eventStatus(point) {
        // For debugging purposes
        let source = !this.source ? "null" : this.source;
        let target = !this.target ? "null" : this.source;
        return `\nPoint: ${point.data.id}, source: ${source}, target: ${target}, dragEnabled: ${this.dragEnabled}, clickSelection: ${this.clickSelection}`;
    }

    addPoint(id, center, connections) {

        console.log("addpoint at", center);
        let point = new paper.Path.Circle({
            center: center,
            radius: POINT_SIZE,
            fillColor: POINT_COLOR,
            selected: true,
            connections: connections,
        });

        // ID has to be .data.id, because .id is read-only property of paper.js items
        point.data.id = id;

        // Used for pathfinding - move serverside
        point.status = "";
        point.root = point;
        point.rootEdge = null;
        this.points[id] = point;

        let _this = this;

        point.onMouseDrag = function (e) {
            // When first starting to draw a line, reset the current selection
            if (!_this.dragSelection) {
                if (!point.hitTest(e.point)) return false;
                _this.resetSelection();
                _this.select(point);
                _this.dragSelection = true;
            }
            if (_this.dragEnabled) _this.currentLine.add(e.point);
        };

        point.onMouseDown = function () {
            if (point.connections < 3) {
                _this.selectedPoints.push(point.data.id);
            }
        };

        point.onMouseUp = function (e) {
            if (!_this.clickSelection && !_this.dragEnabled) {
                _this.selectedPoints = [];
            } else if (_this.clickSelection) {
                point.onClick(e);
                e.stop();
            }
        };

        point.onClick = function () {
            if (!_this.source) _this.clickSelection = true;
            if (_this.clickSelection) _this.select(point);
        };

        point.onMouseEnter = function () {
            if ((point.connections < 3) && !(_this.source && _this.target)) _this.hoveredPoint = point;
            if (_this.dragEnabled && _this.source && !_this.target) {
                // If ending on the point is illegal, reset the selection
                if ((_this.source === point && point.connections >= 2) || (point.connections >= 3)) {
                    _this.resetSelection();
                    _this.dragEnabled = false;
                } else { // Select the point
                    _this.dragEnabled = false;
                    _this.currentLine.add(point.position);
                    _this.select(point);
                    _this.selectedPoints.push(point.data.id);
                }
            }
        };

        point.onMouseLeave = function () {
            _this.hoveredPoint = null;
            if (_this.dragSelection) { // The user is drawing a line
                // TODO: If the user draws a line quickly, onMouseLeave is called before onMouseDrag
                // which means a line won't be drawn. (doesn't break anything, it's just not optimal)
                if (_this.dragEnabled) { // Stop drawing the line once the second point has been selected
                    _this.select(point);
                    _this.dragEnabled = false;
                } else if (!_this.target) { // Start drawing when leaving the source point
                    _this.dragEnabled = true;
                }
            }
        };

        point.commonEdges = function (p2) {
            let inCommon = [];
            for (let edge of point.edges) {
                if (edge.vertices.includes(point) && edge.vertices.includes(p2))
                    inCommon.push(edge);
            }
            return inCommon;
        };

        point.dfs = function (toFind) {
            //Marker som søgende
            point.status = "seeking";
            //Kør dfs på alle naboer
            for (let e of point.edges) {
                let p = e.vertices.find(x => x !== point);
                if (e !== point.rootEdge && p !== undefined) {
                    //Er en nabo søgende eller færdig, find alle links op til nabo og tilføj liste til cycles[]
                    if (p.status === "") {
                        //Sæt parent til dette point
                        p.root = point;
                        p.rootEdge = e;
                        if (!(e.vertices[0] === p)) {
                            e.reverse();
                            e.vertices.reverse();
                        }
                        p.dfs(toFind);
                    } else if (p.status === "done") {
                        toFind.push(e);
                    }
                }
            }
            //Marker som færdig
            point.status = "done";
        };

        return point;
    }

    // TODO: Check for point intersections, when spawning random points and when spawning point on a line

    randomPointPosition() {
        // FIXME: Point's center needs to be at least one point's distance from the game border
        const x = Math.floor(Math.random() * paper.view.size.width);
        const y = Math.floor(Math.random() * paper.view.size.height);
        const point = new paper.Point(x, y);
        return point.round();
    }

    exportWorld() {
        //alert("Exporting feature not done");
        for (const group of this.groups) {
            console.log(group.exportJSON());
        }
    }

    importWorld() {
        alert("Importing feature not done");
        for (const group of this.groups) {
            alert("NOT DONE");
        }
    }

    getCycles() {
        //TODO: Sørg for at alle edges "vender" rigtigt
        //TODO: Ikke alle kanter i et loop bliver tilføjet selv om loopet er opdaget
        let toFind = [];
        for (let p of this.points) {
            p.root = p;
            p.rootEdge = null;
            p.status = "";
        }
        for (let p of this.points) {
            if (p.status !== "done") {
                p.root = p;
                p.dfs(toFind);
            }
        }
        let cycles = [];

        for (let t of toFind) {
            let paths0 = [];
            let paths1 = [];
            let loop = [t];
            let p0 = t.vertices[0];
            let p1 = t.vertices[1];
            while (p0.root !== p0) {
                paths0.push(p0.rootEdge);
                p0 = p0.root;
            }
            while (p1.root !== p1) {
                paths1.push(p1.rootEdge);
                p1 = p1.root;
            }
            let difference = paths0.filter(x => !paths1.includes(x)).concat(paths1.filter(x => !paths0.includes(x)));
            loop = loop.concat(difference);
            cycles.push([...loop]);
        }
        return cycles;
    }

    possibleMove(p1, p2, debug = false) {
        /*TODO: Known bugs
        Sometimes the "parent edge" from DFS will be reversed and create an area outside the cycle. Check if direction is correct?
        If one large cycle is also split into 2 smaller cycles, one of them will be able to access all points on the other, but not vice versa.
         */
        let cycles = this.getCycles();
        for (let c of cycles) {
            let total = new paper.Path();
            for (let p of c) {
                for (let s of p.segments)
                    total.add(s);
            }
            if (debug) {
                total.fillColor = "green";
                total.opacity = 0.1;
            }
            if (((total.contains(p1.center) && total.getLocationOf(p1.center) === null) && !total.contains(p2.center)) || ((total.contains(p2.center) && total.getLocationOf(p2.center) === null) && !total.contains(p1.center)))
                return false;
            //total.remove();
        }
        return true;
    }

    findPath(p1, p2, debug = false) {
        let nodes = [p1.center, p2.center];
        //Opdel alle streger efter segment-punkter og halvvejs mellem hver 2 segment-punkter
        //Sæt punkter på hver side af hver  streg vinkelret ift. stregen
        //10px væk hvis der er plads. Ellers halvdelen af afstanden til første kollision
        for (let line of this.lineGroup.children) {
            for (let segment of line.segments) {
                let tangent = new paper.Point(segment.handleOut.x - segment.handleIn.x, segment.handleOut.y - segment.handleIn.y);
                let normal = new paper.Point(-tangent.y, tangent.x);
                normal.x = normal.x / (Math.sqrt(normal.x ** 2 + normal.y ** 2));
                normal.y = normal.y / (Math.sqrt(normal.x ** 2 + normal.y ** 2));
                let s1 = new paper.Point(segment.point.x + (normal.x * 10.0), segment.point.y + (normal.y * 20.0));

                let s2 = new paper.Point(segment.point.x - (normal.x * 10.0), segment.point.y - (normal.y * 20.0));
                nodes.push(s1);
                nodes.push(s2);
                if (debug) {
                    let c1 = new paper.Path.Circle(s1, 2);
                    let c2 = new paper.Path.Circle(s2, 2);
                    c1.fillColor = "red";
                    c2.fillColor = "red";
                }
            }
        }
        //TODO: Sæt punkter langs kanten af spil-området. 1 pr. 100 pixels
        //Alle punkter, inklusiv p1 og p2, får explored = false
        for (let p of nodes)
            p.explored = false;

        let horizon = [p1.center];
        p1.explored = true;
        while (!p2.center.explored) {
            if (horizon.length === 0) {
                console.log("No path found");
                return
            }
            let newHorizon = [];
            //  for hvert element i horizon, find alle punkter hvor der kan gå en lige streg uden intersections og som ikke er explored
            for (let n of horizon) {
                for (let n1 of nodes) {
                    let ray = new paper.Path();
                    ray.add(n);
                    ray.add(n1);
                    ray.legal = true;
                    for (let p of this.lineGroup.children) {
                        if (n !== n1 && !n1.explored && p.getCrossings(ray).length === 0) {
                            for (let v of this.points) {
                                if ((v === p1 || v === p2) || v.getIntersections(ray).length === 0) {
                                    if (debug) {
                                        ray.strokeColor = "red";
                                        ray.opacity = 0.1;
                                    }
                                } else {
                                    ray.legal = false;
                                    ray.remove();
                                }
                            }
                        } else {
                            ray.remove();
                            ray.legal = false;
                        }
                    }
                    if (ray.legal) {
                        n1.explored = true;
                        n1.parentRay = n;
                        newHorizon.push(n1)
                    }
                }
            }
            horizon = [...newHorizon];
        }
        console.log("GOT IT");
        let suggestion = new paper.Path();
        let v = p2.center;
        suggestion.add(p2.center);
        while (v !== p1.center) {
            suggestion.add(v.parentRay);
            v = v.parentRay
        }
        suggestion.strokeColor = "black";
    }
}
