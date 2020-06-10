// The idea is that tiles are like buckets. Buckets are associated with keys and/or several keys
// connects with a set of objects.
import {SproutWorld} from "./SproutWorld.js";

export class CollisionGrid {
    constructor(cell_size) {
        console.log("CollisionGrid Created!");
        this.cell_size = cell_size;
        this.contents = {};
        //this.tile_matrix = math.matrix(); this.tile_matrix.resize([cell_size, cell_size], null); // May not be needed
    }

// Return position of tile from point (Hash function)
    t_return(point) {
        return Math.floor(point.x / this.cell_size) + ";" + Math.floor(point.y / this.cell_size);
    }

// Return tile indices overlapping hitbox (Hash function)
    t_rectangle_return(rectangle) {
        let tile_objects = new Set();
        // Min and Max corners of rectangle
        let min = this.t_return(rectangle.bottomLeft);
        let max = this.t_return(rectangle.topRight);

        // Iterate over area and add objects to tiles/buckets
        for(let x = min.x; x < max.x; x++) {
            for(let y = min.y; x < max.y; y++) {
                tile_objects.add(this.t_return({x: x, y: y}));
            }
        }
        return tile_objects;
    }

// Insert object at "tile from point" to dictionary
    t_insert_point(tile, object) {
        if (this.contents[tile] === undefined) {
            this.contents[tile] = new Set();
        }
        this.contents[tile].add({object: object, visualized: false});
    }

// Insert object from rectangle - Intended for use with hitboxes
    t_insert_rectangle(rectangle, object) {
        // Min and Max corners of rectangle
        let min = this.t_return(rectangle.topLeft).split(";");
        let max = this.t_return(rectangle.bottomRight).split(";");
        // Iterate over area and add objects to tiles/buckets
        for(let x = min[0]; x <= max[0]; x++) {
            for(let y = min[1]; y <= max[1]; y++) {
                this.t_insert_point(x+";"+y, object);
            }
        }
    }

    t_insert_line(curves, object) {
        console.log("curves");
        console.log(curves);
        for (let i = 0; i < curves.length; i++) {
            for (let j = 0; j < curves[i].length; j++) {
                let location = curves[i].getLocationAt(j);
                this.t_insert_point(this.t_return(location.point), object);
            }
            //this.t_insert_point(curves[i].segment1.point, object);
            //this.t_insert_point(curves[i].segment2.point, object);
        }
    }

    v_update() {
        let cell_size = this.cell_size;
        let tile_shape_group = new paper.Group();
        for(let [key, obj] of Object.entries(this.contents)) {
            if (!obj.visualized) {
                let tile_pos = key.split(';');
                let x = tile_pos[0]*cell_size; let y = tile_pos[1]*cell_size;
                // Creating rectangle shape to visualize collided tile
                let rect = new Rectangle(new Point(x, y), cell_size);
                let rect_shape = new Shape.Rectangle(rect);
                rect_shape.opacity = 0.35;
                tile_shape_group.addChild(rect_shape);
                this.contents[key].visualized = true;
            }
            tile_shape_group.sendToBack();
            tile_shape_group.style = {
                fillColor: 'red',
                strokeColor: 'black',
                strokeWidth: 1
            };
        }
    }

    u_initObstacles(sproutWorld) {
        let cell_size = this.cell_size;
        // Get initial obstacles
        let circle_obstacles = [...sproutWorld.points];

        // Let's add them to our collisionGrid aka. spatialHash
        circle_obstacles.forEach(obst => this.t_insert_rectangle(obst.bounds, obst));
    }

    t_getNeighbours(point){
        let N = [];
        for (let p of [new paper.Point(point.x+this.cell_size, point.y), new paper.Point(point.x-this.cell_size, point.y),
            new paper.Point(point.x, point.y+this.cell_size), new paper.Point(point.x, point.y-this.cell_size)])
            N.push(this.t_return(p));
        console.log(this.contents);
        return N;
    }

    u_dist(tile_1, tile_2){
        tile_1 = tile_1.split(";");
        tile_2 = tile_2.split(";");
        return (tile_2[0]-tile_1[0])**2+(tile_2[1]-tile_1[1])**2
    }

    u_Astar(start, goal){
        let grid = {};
        let goal_tile = this.t_return(goal);
        grid[this.t_return(start)] = (goal.x-start.x)**2+(goal.y-start.y)**2;
        let horizon = this.t_getNeighbours(start);
        //TODO: Giv parents til hver tile.
        //TODO: implementer A*
    }

}