let activeRooms = [];

class Room {
    constructor(id) {
        this.id = id;
        this.playerCount = 0;
        this.maxCapacity = 2;
    }
}

export {activeRooms, Room}

var from = new paper.Point(20, 20);
var to = new paper.Point(80, 80);

// new path added to the active project
var path1 = new paper.Path.Line(to, from);

// creates new game project and activates it
let game2 = new paper.Project([400, 200]);

// this path is now added to the second project
var path2 = new paper.Path.Line(to + 5, from + 5);

// console.log(paper.projects);
console.log("path1 index", path1.project.index);
console.log("path2 index", path2.project.index);

console.log("hittest project 2", paper.project.hitTest(from));
console.log("project 2: path1 intersects path2?", path1.intersects(path2));

// activates the first project
paper.projects[0].activate();
console.log("hittest project 1", paper.project.hitTest(from));
console.log("project 1: path1 intersects path2?", path1.intersects(path2));

new paper.Path.Circle(to + 5, from + 5);
console.log("project 1 with circle children:", paper.project.activeLayer.children.length);
paper.projects[1].activate();
console.log("hittest project 1", paper.project.hitTest(from));