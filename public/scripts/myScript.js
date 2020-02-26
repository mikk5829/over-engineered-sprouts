var path = new Path();
var paths = [];

function onMouseDown(event) {
    path = new Path();
    path.strokeColor = "black";
}

function onMouseDrag (event) {
    path.add(event.point);
}

function onMouseUp (event) {
    path.simplify();
    var intersects = [];

    // TODO: Check for intersections with self (path)
    // TODO: Don't push line to paths if there are any intersections
    // TODO: Continuously check for intersections while dragging line

    paths.forEach(function(item, index){
        intersects = intersects.concat(path.getIntersections(item));
    });

    intersects.forEach(function(item, index){
        new Path.Circle({
            center: item.point,
            radius: 5,
            fillColor: '#009dec'
        });
    });
    paths.push(path);
}

/*
function onMouseUp (event) {
    path.simplify();
    var intersects = [];
    paths.forEach(function(item, index){
        path.getIntersections(item).forEach(item => intersects.push(item))
    });
    intersects.forEach(function(item, index){
        new Path.Circle({
            center: item.point,
            radius: 5,
            fillColor: '#009dec'
        });
    });
    paths.push(path);
}
*/