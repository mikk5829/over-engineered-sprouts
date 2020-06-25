/**
 * Generates the world
 * @namespace SproutWorld
 * @author Benjamin Starostka & Laura Hansen & Wictor Jensen
 * */

import {CollisionGrid} from "./CollisionGrid.js";

const SEL_POINT_COLOR = 'Yellow';
const HOVER_POINT_COLOR = 'CornflowerBlue';
const STROKE_COLOR = 'Indigo';

const POINT_SIZE = 5;
export {SEL_POINT_COLOR, HOVER_POINT_COLOR, STROKE_COLOR}

export class SproutWorld {

    /**
     * World constructor
     * @constructor
     * @memberof SproutWorld
     * @param simulation
     * @param groups
     * @param sprout_configuration
     **/

    constructor(simulation = false) {

        this.pointColor = getCookie('pointColor') !== null ? getCookie('pointColor') : 'Indigo';
        this.pathGroup = new paper.Group(); // The paths that have been drawn so far
        this.points = [];
        this.simulation = simulation;

        this.dragEnabled = false;
        this.dragSelection = false; // Whether or not a path is currently being drawn
        this.clickSelection = false; // Whether or not the drawing should be updated right now
        this.source = null; // Source node of the current path
        this.target = null; // Target node of the current path

        this.hoveredPoint = null; // A legal point that the mouse hovers on
        this.selectedPoints = []; // The points which are currently selected/pressed
        this.currentPath = null; // The path currently being drawn by the player
        this.suggestedPath = null; // Path that has been suggested by the server
        this.collisionGrid = new CollisionGrid(POINT_SIZE, this, new paper.Size(750, 472))

    }

    /**
    * A point can be selected either by clicking on it or drawing a path over it.
     * @memberOf SproutWorld
    * */
    select(point) {

        if (point.data.connections >= 3) return;
        if (!this.source) { // New selection - start drawing path
            this.source = point;
            if (!this.clickSelection) {
                this.currentPath = new paper.Path({
                    segments: [point.position],
                    strokeColor: STROKE_COLOR,
                    strokeCap: 'round',
                    strokeJoin: 'round'
                });
                this.currentPath.sendToBack();
            }
        } else if (!this.target) this.target = point;
    }

    resetSelection() {
        console.log("Resetting selection");
        this.source = null;
        this.target = null;
        this.dragSelection = false;
        this.dragEnabled = false;
        this.clickSelection = false;
        this.selectedPoints = [];
        if (this.currentPath) this.currentPath.remove();
    }

    submitSelection(simulation = false) {
        if (!simulation && (this.currentPath.segments.length <= 2 || (!this.source || !this.target))) {
            this.resetSelection();
            return false;
        }

        // Trim the path underneath the points
        let path = this.currentPath;
        if (!simulation) {
            let sourcePoint = path.getCrossings(this.source)[0];
            let i = this.source === this.target ? 1 : 0;
            let targetPoint = path.getCrossings(this.target)[i];
            path.curves[0].point1 = sourcePoint.point;
            path.curves[path.curves.length - 1].point2 = targetPoint.point;
        }

        if (simulation) {
            let from = this.source.data.id;
            let to = this.target.data.id;
            socket.emit('submitSimPath', path.exportJSON(), this.source.data.id, this.target.data.id, function (pathIsLegal) {
                if (!pathIsLegal) $('#status-header').text(`Illegal move from ${from} to ${to}.`);
            });
        } else {
            // Send to server for validation
            socket.emit('submitPath', path.exportJSON(), this.source.data.id, this.target.data.id, function (pathIsLegal) {
                if (!pathIsLegal) $('#status-header').text(`Path illegal, try again.`);
            });
        }
        this.resetSelection();
    }


    addPoint(id, center, connections) {
        let point = new paper.Path.Circle({
            center: center,
            radius: POINT_SIZE,
            fillColor: this.pointColor,
        });
        point.data = {
            id: id,
            edges: [],
            connections: connections,
        };

        // Shows the point's ID on top of the point
        let pointText = new paper.PointText({
            point: point.position,
            justification: 'center',
            fillColor: 'white',
            content: id,
            locked: true,
        });
        pointText.fontSize=6;
        pointText.fontFamily='courant';
        pointText.fontWeight=0;
        pointText.position.y=pointText.position.y+3;

        this.points[id] = point;
        let _this = this;

        point.onMouseDrag = function (e) {
            // When first starting to draw a path, reset the current selection
            if (!_this.dragSelection) {
                if (!point.hitTest(e.point)) return false;
                _this.resetSelection();
                _this.select(point);
                _this.dragSelection = true;
            }
            if (_this.dragEnabled) _this.currentPath.add(e.point);
        };

        point.onMouseDown = function () {
            if (point.data.connections < 3) _this.selectedPoints.push(point);
        };

        point.onMouseUp = function (e) {
            if (!_this.clickSelection && !_this.dragEnabled) _this.selectedPoints = [];
            else if (_this.clickSelection) {
                point.onClick(e);
                e.stop();
            }
        };

        point.onClick = function () {
            console.log(`Point ${point.data.id}, ${point.data.connections} connections`);
            if (!_this.source) _this.clickSelection = true;
            if (_this.clickSelection) _this.select(point);
        };

        point.onMouseEnter = function () {
            // Highlights this point if it is possible to draw a path to/from it
            if ((point.data.connections < 3) && !(_this.source && _this.target)) _this.hoveredPoint = point;

            if (_this.dragEnabled && _this.source && !_this.target) {
                // If ending on the point is illegal, reset the selection
                if ((_this.source === point && point.data.connections >= 2) || (point.data.connections >= 3)) {
                    _this.resetSelection();
                    _this.dragEnabled = false;
                } else { // Select the point
                    _this.dragEnabled = false;
                    _this.currentPath.add(point.position);
                    _this.select(point);
                    _this.selectedPoints.push(point);
                }
            }
        };

        point.onMouseLeave = function () {
            _this.hoveredPoint = null;
            if (_this.dragSelection) {
                if (_this.dragEnabled) { // Stop drawing the path once the second point has been selected
                    _this.select(point);
                    _this.dragEnabled = false;
                } else if (!_this.target) {
                    /* Only start drawing when leaving the source point
                        = the part of the path within the point's radius won't be drawn */
                    _this.dragEnabled = true;
                }
            }
        };

        point.dfs = function (toFind) {
            point.data.status = "seeking";
            // Run DFS on all neighbors
            for (let e of point.data.edges) {
                let p = e.data.vertices.find(x => x !== point);
                if (e !== point.data.rootEdge && p !== undefined) {
                    // If a neighbor is seeking or done, find all links to the neighbor and add list to cycles
                    if (p.data.status === "") {
                        p.data.root = point;
                        p.data.rootEdge = e;
                        if (!(e.data.vertices[0] === p)) {
                            e.reverse();
                            e.data.vertices.reverse();
                        }
                        p.dfs(toFind);
                    } else if (p.data.status === "done") {
                        toFind.push(e);
                    }
                }
            }
            point.data.status = "done";
        };
        return point;
    }

    /**
     * Get all cycles as array of Path objects
     * @memberof SproutWorld
     * @returns {Array} All cycles gathered into singular Path objects
     **/
    getCycles() {
        let toFind = [];
        for (let p of this.points) {
            p.data.root = p;
            p.data.rootEdge = null;
            p.data.status = "";
        }
        for (let p of this.points) {
            if (p.data.status !== "done") {
                p.data.root = p;
                p.dfs(toFind);
            }
        }
        let cycles = [];

        for (let t of toFind) {
            let paths0 = [];
            let paths1 = [];
            let loop = [t];
            let p0 = t.data.vertices[0];
            let p1 = t.data.vertices[1];
            while (p0.data.root !== p0) {
                paths0.push(p0.data.rootEdge);
                p0 = p0.data.root;
            }
            while (p1.data.root !== p1) {
                paths1.push(p1.data.rootEdge);
                p1 = p1.data.root;
            }
            let difference = paths0.filter(x => !paths1.includes(x)).concat(paths1.filter(x => !paths0.includes(x)));
            loop = loop.concat(difference);
            cycles.push([...loop]);
        }
        return cycles;
    }


    /**
     * Determines if a move between p1 and p2 is possible
     * @param p1 First point to check
     * @param p2 Second point to check
     * @memberof SproutWorld
     * @returns {boolean} Determines whether there can be a path between the two points
     **/
    possibleMove(p1, p2) {
        let cycles = this.getCycles();
        for (let c of cycles) {
            let total = new paper.Path();
            for (let p of c) {
                for (let s of p.segments)
                    total.add(s);
            }

            if (((total.contains(p1) && total.getLocationOf(p1) === null) && !total.contains(p2)) ||
                ((total.contains(p2) && total.getLocationOf(p2) === null) && !total.contains(p1)))
                return false;
        }
        return true;
    }

    /**
     * Suggests a path between the given points
     * @param p1 Starting point of the suggested path
     * @param p2 Goal point of the suggested path
     * @memberof SproutWorld
     * @returns {Object} A path between p1 and p2
     **/
    suggestPath(p1, p2) {
        if (this.suggestedPath)
            this.suggestedPath.remove();
        let initCellSize = this.collisionGrid.cell_size;
        let cellSize = initCellSize;
        let suggest = this.collisionGrid.u_Astar(p1, p2);
        while (!suggest) {
            cellSize = cellSize / 2;
            this.collisionGrid = new CollisionGrid(cellSize, this, new paper.Size(750, 472));
            for (let path of this.pathGroup.children) {
                this.collisionGrid.t_insert_path(path.curves, path);
            }
            for (let point of this.points) {
                this.collisionGrid.t_insert_rectangle(point.bounds, point);
            }
            suggest = this.collisionGrid.u_Astar(p1, p2);
        }
        this.collisionGrid = new CollisionGrid(initCellSize, this, new paper.Size(750, 472));
        for (let path of this.pathGroup.children) {
            this.collisionGrid.t_insert_path(path.curves, path);
        }

        for (let point of this.points) {
            this.collisionGrid.t_insert_rectangle(point.bounds, point);
        }
        suggest.strokeColor = "red";
        this.suggestedPath = suggest;
    }
}
