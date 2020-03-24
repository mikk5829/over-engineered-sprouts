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
    this.curveGroup = new paper.Group();
    this.points = [];

    this.drag = false;
    this.source = null;
    this.target = null;
    this.currentCurve = null;
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
    console.log("Created map", this.points.toString());
  }

  legalMove(startPoint, endPoint, newCurve) {

    if (startPoint === endPoint && startPoint.data.connections >= 2) {
      console.log("a")
      return false;
    }
    if (startPoint.data.connections >= 3 || endPoint.data.connections >= 3) {
      console.log("b")
      return false;
    }

    // Check for intersections between existing curves and the new curve
    for (var curve of this.curveGroup.getItems({type: 'path'})) {
      if (newCurve.getIntersections(curve).length > 0) {
        console.log("c", newCurve.getIntersections(curve).length);
        return false;
      }
    }

    // Check for intersections on the curve itself
    /*console.log("d", newCurve.getIntersections(newCurve).length);
    new paper.Path.Circle({
        center: newCurve.getIntersections(newCurve)[0].point,
        radius: 5,
        strokeColor: 'white'
    });*/
    return newCurve.getIntersections(newCurve).length <= 0;
  }

  submitSelection() {
    let curve = this.currentCurve;
    let source = this.source;
    let target = this.target;

    // Trim the path underneath the points
    let sourcePoint = curve.getCrossings(source)[0];
    let i = source === target ? 1 : 0;
    let targetPoint = curve.getCrossings(target)[i];
    curve.curves[0].point1 = sourcePoint.point;
    curve.curves[curve.curves.length - 1].point2 = targetPoint.point;
    curve.simplify(3);

    // Save the path if it is a legal path
    if (source && target && this.legalMove(source, target, curve)) {
      this.addPoint(curve.getPointAt(curve.length / 2), 2);

      this.addCurve(source, target, curve)
    }
    this.resetSelection();
  }

  addCurve(source, target, curve) {
    source.data.connections += 1;
    target.data.connections += 1;
    curve.copyTo(this.curveGroup);
  }

  select(point) {
    if (!this.source) { //
      console.log("Set first selection", point.id);
      this.source = point;
      this.currentCurve = new paper.Path({
        segments: [point.position],
        strokeColor: STROKE_COLOR,
        strokeCap: 'round',
        strokeJoin: 'round'
      });
      // e.item.fillColor = SEL_POINT_COLOR;
      this.source = point;
      this.currentCurve.sendToBack();
    } else if (!this.target) {
      this.target = point;
    }
  }

  resetSelection() {
    // this.currentCurve.remove();
    this.source = null;
    this.target = null;
    this.drag = false;
    this.currentCurve.remove();
  }

  addPoint(location, connections = 0) {
    // let edges = parentEdge ? [parentEdge, parentEdge] : [];
    // let point = new Point(location, edges);
    let point = new paper.Path.Circle({
      center: location,
      radius: POINT_SIZE,
      fillColor: POINT_COLOR
    });
    point.data.connections = connections;
    this.points.push(point);
    let _this = this;

    point.onMouseDown = function () {
      if (point.data.connections < 3) {
        point.fillColor = SEL_POINT_COLOR;
        _this.select(point);
      }
    };

    point.onClick = function (e) {
    };

    point.onMouseEnter = function () {
      if (!_this.drag && _this.source && _this.target) {
        console.log("nop", _this.drag);
      } else if (_this.drag && _this.source && !_this.target) {
        // If ending on the point is illegal, reset the selection
        if ((_this.source === point && point.data.connections >= 2) || (point.data.connections >= 3)) {
          point.fillColor = HOVER_POINT_COLOR;
          _this.resetSelection();
        } else { // Else select the point
          _this.drag = false;
          _this.currentCurve.add(point.position);
          _this.select(point);
          point.fillColor = SEL_POINT_COLOR;
        }
      } else point.fillColor = HOVER_POINT_COLOR;
    };

    point.onMouseLeave = function (e) {
      if (_this.source) { // A point has been selected (game is ongoing)
        if (_this.drag) { // Stop drawing the curve once the second point has been selected
          _this.select(point);
          _this.drag = false;
        } else if (!_this.target) { // Leaving the initial point
          _this.drag = true;
        }
      } else {
        point.fillColor = POINT_COLOR;
      }
    };
    return point;
  }

  animate() {
    // Animate stuff
    paper.view.onFrame = function (event) {
      for (let curve of this.curveGroup) {
        curve.strokeColor.hue += 1;
      }

    }
  }

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