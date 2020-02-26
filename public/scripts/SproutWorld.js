export default class SproutWorld {
  static POINT_SIZE = 3;
  static POINT_COLOR = "black";

  constructor(sprout_configuration = null) {
    this.sprout_configuration = sprout_configuration;
    this.points = [];
    this.circles = [];
    this.paths = [];
  }

  generateWorld(map_configuration = null, amount = null) {
    // Generate points and draw their graphics from amount argument
    if (amount > 0) {
      for (let i = 0; i < amount; i++) {
        let generated_point = null;
        var valid = false;
        while (!valid) {
          if (generated_point == null) {
            generated_point = this.generatePoint;
            let point = generated_point.point;
            let point_path = generated_point.point_path;
            valid = false;
          }
          if (this.points.some(point)) {
            generated_point = this.generatePoint();
            valid = false;
          }
          if (this.conflicts(point_path, this.circles)) {
            generated_point = this.generatedPoint();
            valid = false;
          }
          valid = true;
        }
        this.points.push(generated_point.point);
        this.circles.push(generated_point.point_path);
      }
    }
  }

  generatePoint() {
    let point = new Point(view.size.width, view.size.height) * Point.random();
    let rounded = point.rounded();
    let point_path = new Path.Circle(rounded, POINT_SIZE);
    point_path.fillColor = POINT_COLOR;
    return { point: rounded, path: point_path };
  }

  // Test if there is conflicts between a path and a list of paths
  conflicts(path, pathList) {
    pathList.foreach(elem => {
      if (!path.getIntersections(elem).empty()) {
        return true;
      }
    });
    return false;
  }
}
