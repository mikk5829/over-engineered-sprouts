/**
 * Generates the world
 * @namespace SproutWorld
 * */
import {CollisionGrid} from './CollisionGrid.js';

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
     * @param {paper.PaperScope()} scope
     * @param canvas
     * @param groups
     * @param sprout_configuration
     * @param points
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

        this.collisionGrid = null; // Holds an instance of an collisionGrid object
    }

    /**
     * Generates the map
     * @memberof SproutWorld
     * */
    initializeMap(map_configuration = null, amount = null) {
        // Generate initial points
        for (let i = 0; i < amount; i++) {
            this.addPoint(this.randomPointPosition())
        }
        this.collisionGrid = new CollisionGrid(8);
        this.collisionGrid.u_initObstacles(this);
        this.collisionGrid.v_update();
    }

    select(point) {
        if (point.data.connections >= 3) return;
        if (!this.source) {
            this.source = point;
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
            this.target = point;
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
        if (startPoint === endPoint && startPoint.data.connections >= 2) return false;
        else if (startPoint.data.connections >= 3 || endPoint.data.connections >= 3) return false;

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

        let line = this.currentLine;
        let source = this.source;
        let target = this.target;

        // Trim the path underneath the points
        let sourcePoint = line.getCrossings(source)[0];
        let i = source === target ? 1 : 0;
        let targetPoint = line.getCrossings(target)[i];
        line.curves[0].point1 = sourcePoint.point;
        line.curves[line.curves.length - 1].point2 = targetPoint.point;
        line.simplify(3);

        // Save the path if it is a legal path
        if (source && target && this.legalMove(source, target, line)) {
            this.addPoint(line.getPointAt(line.length / 2), 2);
            this.addLine(source, target, line);
            // CollisionGrid handling and updating
            this.collisionGrid.t_insert_line(line.curves, line);
            this.collisionGrid.v_update();
        } else {
            this.resetSelection();
            return false;
        }
        this.resetSelection();
        return true;
    }

    addLine(source, target, line) {
        source.data.connections += 1;
        target.data.connections += 1;
        line.copyTo(this.lineGroup);
    }

    eventStatus(point) {
        // For debugging purposes
        let source = !this.source ? "null" : this.source.id;
        let target = !this.target ? "null" : this.source.id;
        return `\nPoint: ${point.id}, source: ${source}, target: ${target}, dragEnabled: ${this.dragEnabled}, clickSelection: ${this.clickSelection}`;
    }

    addPoint(location, connections = 0) {
        let point = new paper.Path.Circle({
            center: location,
            radius: POINT_SIZE,
            fillColor: POINT_COLOR
        });
        point.data.connections = connections;
        this.points.push(point);
        let _this = this;
        if (this.collisionGrid != null) {
            this.collisionGrid.t_insert_rectangle(point.bounds, point);
        }

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
            if (point.data.connections < 3) {
                _this.selectedPoints.push(point);
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
            if ((point.data.connections < 3) && !(_this.source && _this.target)) _this.hoveredPoint = point;
            if (_this.dragEnabled && _this.source && !_this.target) {
                // If ending on the point is illegal, reset the selection
                if ((_this.source === point && point.data.connections >= 2) || (point.data.connections >= 3)) {
                    _this.resetSelection();
                    _this.dragEnabled = false;
                } else { // Select the point
                    _this.dragEnabled = false;
                    _this.currentLine.add(point.position);
                    _this.select(point);
                    _this.selectedPoints.push(point);
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
}