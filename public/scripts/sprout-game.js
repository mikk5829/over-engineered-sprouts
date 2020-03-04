/**
 * Generates the world
 * @namespace SproutWorld
 * */
class SproutWorld {
  POINT_COLOR = 'black';
  POINT_SIZE = 5;
  STROKE_COLOR = 'red';

  /**
   * World constructor
   * @constructor
   * @memberof SproutWorld
   * @param {paper.PaperScope()} scope
   * @param canvas
   * @param groups
   * @param sprout_configuration
   **/
  constructor(scope, canvas, groups = [], sprout_configuration = null) {
    this.sprout_configuration = sprout_configuration;
    this.points = [];
    this.circles = [];
    this.scope = scope;
    this.canvas = canvas;
    this.groups = groups;
    this.scope.setup(canvas);
  }

  /**  Scope for this class
   * @memberof SproutWorld
   * */
  get paperInstance() {
    return this.scope;
  }

  /**
   * Generates the world
   * @memberof SproutWorld
   * */
  generateWorld(map_configuration = null, amount = null) {
    let circle_group = new paper.Group();
    let curves_group = new paper.Group();
    this.groups.push(circle_group, curves_group);

    if (amount > 0 && map_configuration == null) {
      // Generate Points
      for (let i = 0; i < amount; i++) {
        let point = this.generatePoint();
        let path = new paper.Path.Circle(point, this.POINT_SIZE);
        let intersect = false;
        // Look for intersections
        for (const item of circle_group.children) {
          if (path.intersects(item)) {
            i = i - 1;
            console.log("Intersect! Recalculating");
            path.remove(); // Remove path that results in intersect
            intersect = true;
          }
        }
        if (!intersect) {
          path.fillColor = this.POINT_COLOR;
          circle_group.addChild(path);
        }

      }

      let segments = [];
      // Generate Paths between points
      for (const path of circle_group.children) {
        let rnd_1 = Math.round(Math.random() * 100);
        let rnd_2 = Math.round(Math.random() * 100);
        let rnd_3 = Math.round(Math.random() * 100);
        let rnd_4 = Math.round(Math.random() * 100);

        let segment = new paper.Segment({
          point: path.position,
          handleIn: [rnd_1, rnd_2],
          handleOut: [rnd_3, rnd_4]
        });
        segments.push(segment);
      }

      // Connect segments
      for (let i = 0; i < Math.floor(segments.length/2); i++) {
        let j = segments.length - i - 1;
        let curve = new paper.Path({
          segments: [segments[i], segments[j]],
          strokeColor: this.STROKE_COLOR
        });
        curve.smooth();
        curves_group.addChild(curve);
      }

    }

    // Animate stuff
    this.scope.view.onFrame = function(event) {
      let curves = curves_group;
      for (let curve of curves.children) {
        curve.strokeColor.hue += 1;
      }
    }

  }

  generatePoint() {
    const x = Math.floor(Math.random() * this.scope.view.size.width);
    const y = Math.floor(Math.random() * this.scope.view.size.height);
    const point = new paper.Point(x, y);
    return point.round();
  }

  exportWorld() {
    //alert("Exporting feature not done");
    for (const group of this.groups) {
      console.log(group.exportJSON());
    }
  }

  importWorld(sprout_config) {
     this.scope.clear(); // Clear the scope
     for (const group of this.groups) {
       group.remove();
     }
     this.generateWorld(sprout_config);
  }

}

window.onload = function() {

    var canvas = document.getElementById('sproutGameCanvas');

    const sprout_scope = new paper.PaperScope();
    const world = new SproutWorld(sprout_scope, canvas);
    world.generateWorld(null, 15);
    world.exportWorld();

}
