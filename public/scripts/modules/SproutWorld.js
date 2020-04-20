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
    }

    select(point) {
        if (point.connections >= 3) return;
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

        let line = this.currentLine;
        let source = this.source;
        let target = this.target;

        // Trim the path underneath the points
        let sourcePoint = line.getCrossings(source)[0];
        let i = source === target ? 1 : 0;
        let targetPoint = line.getCrossings(target)[i];
        line.curves[0].point1 = sourcePoint.point;
        line.curves[line.curves.length - 1].point2 = targetPoint.point;


        // Save the path if it is a legal path
        if (source && target && this.legalMove(source, target, line)) {
            let newPoint = this.addPoint(line.getPointAt(line.length / 2), 0);
            source.neighbours.push(newPoint);
            let line2 = line.splitAt(line.length/2);
            let line1 = line.clone();
            line1.vertices = [];
            line2.vertices = [];
            line1.simplify(3);
            line2.simplify(3);
            this.addLine(source, newPoint, line1);
            this.addLine(newPoint, target, line2);
        } else {
            this.resetSelection();
            return false;
        }
        this.resetSelection();
        return true;
    }

    addLine(source, target, line) {
        source.connections += 1;
        source.edges.push(line);
        source.neighbours.push(target);
        target.connections += 1;
        target.edges.push(line);
        target.neighbours.push(source);
        line.vertices = [source, target];
        line.addTo(this.lineGroup);
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
        point.center = location;
        point.connections = connections;
        point.edges = [];
        point.neighbours = [];
        point.status = "";
        point.root = point;
        this.points.push(point);
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

        point.commonEdges = function (p2) {
            let inCommon = [];
            for (let edge of point.edges) {
                if (edge.vertices.includes(point) && edge.vertices.includes(p2))
                    inCommon.push(edge);
            }
            return inCommon;
        };

        point.dfs = function (toFind) {
            //OMSKRIV TIL AT VIRKE PÅ EDGES I STEDET
            //Marker som søgende
            point.status = "seeking";
            //Kør dfs på alle naboer
            for (let e of point.edges) {
                let p = e.vertices.find(x => x !== point);
                if (p !== point.root && p !== undefined) {
                    //Er en nabo søgende eller færdig, find alle links op til nabo og tilføj liste til cycles[]
                    if (p.status === "") {
                        //Sæt parent til dette point
                        p.root = point;
                        p.dfs(toFind);
                    } else if (p.status === "done") {
                        toFind.push([p, point]);
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
        /*
        PROBLEM lige nu er at to punkter med 2 paths mellem sig ikke bliver godkendt, da den ene er den andens root. DFS skal ændres til at tjekke alle edges i stedet
        passer den traverserede edge ned så den ikke tjekkes to gange
         */
        let toFind = [];
        //Reset alle punkter til ikke at have nogen root, status eller branches
        for (let p of this.points) {
            p.root = null;
            p.status = "";
        }
        //For hver node, tjek om den allerede er blevet kørt dfs på. ellers, gør det
        for (let p of this.points){
            if (p.status !== "done"){
                p.root = p;
                p.dfs(toFind);
            }
        }
        let loops = [];
        //For hvert element i toFind
        for (let t of toFind){
            //For det første element i toFind, følg træet til roden
            let r1 = t[0];
            let paths = [];
            let p1 = [];
            let p2 = [];
            while (r1.root !== r1) {
                p1.push(r1);
                r1 = r1.root;
            }
            p1.push(r1);
            //For andet element i toFind, følg træet til roden
            let r2 = t[1];
            while (r2.root !== r2) {
                p2.push(r2);
                r2 = r2.root;
            }
            p2.push(r2);
            //Start fra t[0], arbejd opad indtil en fællesnode mellem t[0] og t[1] findes. Slet alt derefter i begge.
            for (let i = 0; i < p1.length; i++){
                if (p2.includes(p1[i])) {
                    p1.splice(i, p1.length);
                    break;
                }
            }
            //Fjern alt efter første fælles element
            for (let i = 0; i < p2.length; i++){
                if (p1.includes(p2[i])) {
                    p2.splice(i, p2.length);
                    break;
                }
            }
            for (let v of p1) { //tilføj  alle edges op til v1's rod
                if(v.root !== v)
                    paths.push(v.edges.find(e => e.vertices.includes(v.root)));
                if (p2.includes(v))
                    break;
            }
            //paths.concat(p1[p1.length-1].commonEdges(p2[p2.length-1]));
            paths.push(p1[p1.length-1].edges.find(e => e.vertices.includes(p2[p2.length-1])));

            for (let i = p2.length-1; i >= 1; i--){ //tilføj  alle edges op til v2's rod
                let v = p2[i];
                paths.push(v.edges.find(e => e.vertices.includes(p2[i-1])));
            }

            //Tilføj deres fælles edge
            paths.push(t[0].edges.find(e => (e.vertices.includes(t[1]))));
            //Gem eller returner ruten
            loops.push(paths);
        }
        return loops;
    }

    possibleMove(p1, p2, debug = false) {
        for (let c of this.getCycles()){
            let total = new paper.Path();
            for (let p of c){
                if (p !== undefined) {//TODO: dont add undefined to cycles
                for (let s of p.segments)
                    total.add(s);
                }
            }
            if (debug)
                total.fillColor = "green";
            total.opacity = 0.5;
            if ((total.contains(p1.center) && !total.contains(p2.center)) || (total.contains(p2.center) && !total.contains(p1.center)))
                return false;
            //total.fillColor = "green";
            /*var area = new paper.CompoundPath(c);
            area.closed = true;
            area.fillColor = 'red';
            area.closePath();
            c[0].fillColor = 'blue';*/
        }
        return true;
    }
}