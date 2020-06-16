// The idea is that tiles are like buckets. Buc7kets are associated with keys and/or several keys
// connects with a set of objects.
// import {SproutWorld} from '../public/scripts/modules/SproutWorld.js';

var math = require('mathjs');
var paper = require('paper');


 class CollisionGrid {
    constructor(cell_size, world, gridSize) {
        console.log("CollisionGrid Created!");
        this.world = world;
        this.cell_size = cell_size;
        this.contents = {};
        this.gridSize = gridSize;
    }

// Return position of tile from point (Hash function)
    t_return(point) {
        return Math.floor(point.x / this.cell_size) + ";" + Math.floor(point.y / this.cell_size);
    }

    t_pointToTile(point) {
        return { x: Math.floor(point.x / this.cell_size), y: Math.floor(point.y / this.cell_size) };
    }
    t_tileToPoint(tile) {
        return { x: Math.floor(tile.x * this.cell_size), y: Math.floor(tile.y * this.cell_size) };
    }

    randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    g_randomPoints(dot_count, tile_size) {
        let totalTiles = Math.floor(this.gridSize.width / tile_size) * Math.floor(this.gridSize.height / tile_size);
        let tile_matrix = math.zeros(Math.floor(this.gridSize.width / tile_size), Math.floor(this.gridSize.height / tile_size), 'sparse');

        // Set edge tiles to 1 to prevent dots being placed partially outside game canvas
        let tile_matrix_width = Math.floor(this.gridSize.width / tile_size);
        let tile_matrix_height = Math.floor(this.gridSize.height / tile_size);
        tile_matrix.subset(math.index(0,math.range(0,tile_matrix_height)),math.ones(tile_matrix_height));
        tile_matrix.subset(math.index(tile_matrix_width-1,math.range(0,tile_matrix_height)),math.ones(tile_matrix_height));
        tile_matrix.subset(math.index(math.range(0,tile_matrix_width),0),math.ones(tile_matrix_width));
        tile_matrix.subset(math.index(math.range(0,tile_matrix_width),tile_matrix_height-1),math.ones(tile_matrix_width));

        if (dot_count > totalTiles) {
            console.log("dot_count > totalTiles... t_random won't be able to find enough random tiles!");
        }

        let getIndices = (value) => {
            var indices = [];
            tile_matrix.forEach( (val, index, matrix) => {
                if (val === value) {
                    indices.push(index);
                }
            });
            return indices;
        }

        let updateMatrix = (index, value) => {
            tile_matrix = tile_matrix.set(index, value);
        }

        let getRandomIndex = (value) => {
            var indices = getIndices(value);
            var randomIndex = Math.floor(Math.random() * indices.length);
            updateMatrix(indices[randomIndex], 1);
            return indices[randomIndex];
        }

        let permuted = [];
        for (var i = 0; i < dot_count; i++) {
            let random_index = getRandomIndex(0);
            var dot_point = new paper.Point(random_index[0] * tile_size, random_index[1] * tile_size);
            permuted.push(dot_point);
        }
        return permuted;
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

    t_getNeighbours(tile){
        tile = tile.split(";")
        let N = [(parseInt(tile[0])+1)+";"+tile[1], (parseInt(tile[0])-1)+";"+tile[1], tile[0]+";"+(parseInt(tile[1])+1), tile[0]+";"+(parseInt(tile[1])-1)];
        return N;
    }

    u_dist(tile_1, tile_2){
        tile_1 = tile_1.split(";");
        tile_2 = tile_2.split(";");
        return Math.sqrt((tile_2[0]-tile_1[0])**2+(tile_2[1]-tile_1[1])**2)
    }

    u_object_of(key, obj){
        for (let o of this.contents[key]){
            if (o.object.center === obj.center)
                return true;
        }
        return false;
    }

    u_middle(tile){
        let x = tile.split(";")[0];
        let y = tile.split(";")[1];
        x = x*this.cell_size;
        x += 0.5*this.cell_size;
        y = y*this.cell_size;
        y += 0.5*this.cell_size;
        return new paper.Point(x, y);
    }

    u_Astar(start, goal){
        let grid = {};
        let goal_tile = this.t_return(goal.position);
        let start_tile = this.t_return(start.position);
        let horizon = [{tile: start_tile, f: this.u_dist(start_tile, goal_tile), parent: start_tile, dist: 0.0}];

        while (grid[goal_tile] === undefined && horizon.length !== 0){
            //Get closest to goal
            let best_pick = horizon[0];
            for (let tile of horizon){
                if (this.u_dist(best_pick.tile, goal_tile)+best_pick.dist > this.u_dist(tile.tile, goal_tile)+tile.dist)
                    best_pick = tile;
            }
            //Remove the element
            horizon = horizon.filter(item => item.tile !== best_pick.tile);
            //If it is already explored, ignore it
            if (horizon[best_pick.tile] !== undefined)
                continue;
            //Otherwise, add it to explored
            grid[best_pick.tile] = best_pick;
            //For each neighbour, if it is traversible and unexplored, add it
            for (let n of this.t_getNeighbours(best_pick.tile)){
                if (grid[n] === undefined && (this.contents[n] === undefined || this.u_object_of(n, start) || this.u_object_of(n, goal)) && (best_pick.dist > 3 || this.world.possibleMove(this.u_middle(n), goal.center)))
                    horizon.push({tile: n, f:this.u_dist(n, goal_tile), parent: best_pick.tile, dist: best_pick.dist + 1.0});
            }
        }
        if (grid[goal_tile] !== undefined) {
            let t = grid[goal_tile];
            let path = new paper.Path();
            while (t.parent !== t.tile){
                t = grid[t.parent];
                path.add(this.u_middle(t.tile));
            }
            return path;
        }

        return false;
    }

}

/*
 
         let randomFromAllowedRange = () => {
            let possible = [];
            allowedRanges.forEach((range) => {
                let random_x = this.randomIntFromInterval(range.x_range.from, range.x_range.to);
                let random_y = this.randomIntFromInterval(range.y_range.from, range.y_range.to);
                possible.push({ x: random_x, y: random_y });
            });
            let randomIndex = Math.floor(Math.random() * possible.length);
            return possible[randomIndex];
        }

        let occupyRange = (tile_coord) => {
            let x_range = {
                from: (tile_coord.x - safeSpace),
                to: (tile_coord.x + safeSpace)
            };
            let x_range = {
                from: (tile_coord.y - safeSpace),
                to: (tile_coord.y + safeSpace)
            };
            return { x_range: x_range, y_range: y_range};
        }


        let notInUsedRanges = (occ_range) => {
            if (occRanges.includes(occ_range)) {
                return false;
            } else {
                return true;
            }
        }


let randomFromMatrix = () => {
            tile_matrix.forEach(function (value, index, matrix) {
                console.log(index);
                if (math.isZero(value)) {
                    indices.push(index);
                    console.log(indices);
                }
            });
            if (indices.length === 0) console.log("No available places to put new dot..");
            return indices[Math.floor(Math.random() * indices.length)];
        }

        let updateMatrix = (tile_coord) => {
            let x_range = math.range(tile_coord.x - safeSpace, tile_coord.x + safeSpace);
            let y_range = math.range(tile_coord.y - safeSpace, tile_coord.y + safeSpace);

            let inRange = (range, check) => {
                range.forEach(val => {
                    if (val === check) {
                        return true;
                    }
                });
                return false;
            }

            tile_matrix.forEach(function (value, index, matrix) {
                indices = [];
                if (inRange(x_range, index[0]) && inRange(y_range, index[1])) {
                    value = 1;
                }
            });
            //matrix = matrix.set(math.index(math.range(tile_coord.x - safeSpace, tile_coord.x + safeSpace), math.range(tile_coord.y - safeSpace, tile_coord.y + safeSpace)), 1);
        }
 
 
 
 */

module.exports=CollisionGrid;