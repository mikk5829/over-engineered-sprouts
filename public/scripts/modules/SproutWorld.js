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

        this.pathGroup = new paper.Group(); // The paths that have been drawn so far
        this.points = [];

        this.dragEnabled = false;
        this.dragSelection = false; // Whether or not a line is currently being drawn
        this.clickSelection = false; // Whether or not the drawing should be updated right now
        this.source = null; // Source node of the current line
        this.target = null; // Target node of the current line

        this.hoveredPoint = null; // A legal point that the mouse hovers on
        this.selectedPoints = []; // The points which are currently selected/pressed
        this.currentPath = null; // The path currently being drawn by the player
        this.suggestedPath = null; // Path that has been suggested by the server

    }

    /*
    * A point can be selected either by clicking on it or drawing a path over it.
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

    submitSelection() {
        if (this.currentPath.segments.length <= 2 && (!this.source || !this.target)) {
            console.log("diddly")
            this.resetSelection();
            return false;
        }

        // Trim the path underneath the points
        let path = this.currentPath;
        let sourcePoint = path.getCrossings(this.source)[0];
        let i = this.source === this.target ? 1 : 0;
        let targetPoint = path.getCrossings(this.target)[i];
        path.curves[0].point1 = sourcePoint.point;
        path.curves[path.curves.length - 1].point2 = targetPoint.point;

        // Send to server for validation
        socket.emit('submitPath', path.exportJSON(), this.source.data.id, this.target.data.id, function (pathIsLegal, intersections = []) {
            if (pathIsLegal) console.log("Path legal");
            else console.log("Path illegal");
        });
        this.resetSelection();
    }


    addPoint(id, center, connections) {
        let point = new paper.Path.Circle({
            center: center,
            radius: POINT_SIZE,
            fillColor: POINT_COLOR,
        });
        point.data = {
            id: id,
            edges: [], // fixme
            connections: connections,
        };

        // Shows the point's ID on top of the point
        let pointText = new paper.PointText({
            point: point.position,
            justification: 'center',
            fillColor: 'white',
            content: id,
            locked: true,
        })

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
            if (_this.dragEnabled) _this.currentPath.add(e.point);
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
            console.log(`Point ${point.data.id}, ${point.data.connections} connections`);
            if (!_this.source) _this.clickSelection = true;
            if (_this.clickSelection) _this.select(point);
        };

        point.onMouseEnter = function () {
            // Highlights this point if it is possible to draw a line to/from it
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
                /* FIXME: If the user draws a line quickly, onMouseLeave is called before onMouseDrag,
                    which means a line won't be drawn. (doesn't break anything, it's just not optimal) */

                if (_this.dragEnabled) { // Stop drawing the line once the second point has been selected
                    _this.select(point);
                    _this.dragEnabled = false;
                } else if (!_this.target) {
                    /* Only start drawing when leaving the source point
                        = the part of the line within the point's radius won't be drawn */
                    _this.dragEnabled = true;
                }
            }
        };
        return point;
    }
}