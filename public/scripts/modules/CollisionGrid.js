// The idea is that tiles are like buckets. Buc7kets are associated with keys and/or several keys
// connects with a set of objects.
import {SproutWorld} from './SproutWorld.js';

export class CollisionGrid {
    constructor(cell_size, gridSize = null) {
        console.log("CollisionGrid Created!");
        this.cell_size = cell_size;
        this.contents = {};
        this.gridSize = gridSize;
    }

// Return position of tile from point (Hash function)
    t_return(point) {
        return Math.floor(point.x / this.cell_size) + ";" + Math.floor(point.y / this.cell_size);
    }

    t_pointToTile(point) {
        return { x: Math.floor(point.x / this.cell_size), y: Math.floor(dot.y / this.cell_size) };
    }
    t_tileToPoint(tile) {
        return { x: Math.floor(tile.x * this.cell_size), y: Math.floor(tile.y * this.cell_size) };
    }

    randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // Random Dot Placement (Dots may overlap)
    t_randomTiles(dot_count) {
        let safeSpace = 4;
        let permuted = [];
        let totalTiles = Math.floor(this.gridSize.width / this.cell_size) * Math.floor(this.gridSize.height / this.cell_size);
        let tries = 0;

        if (dot_count > totalTiles) {
            console.log("dot_count > totalTiles... t_random won't be able to find enough random tiles!");
        }

        let notInPermuted = (dot) => {
            if (permuted.length === 0) return true;
            for (var i = 0; i < permuted.length; i++) {
                if (i === (permuted.length - 1) && (permuted[i].x, permuted[i].y) !== (dot.x, dot.y)) {
                    return true;
                }
                if ((permuted[i].x, permuted[i].y) === (dot.x, dot.y)) {
                    return false;
                }
            }
        }

        while (permuted.length < dot_count && tries < 100) {
            var x = this.randomIntFromInterval(safeSpace, Math.floor(this.gridSize.width / this.cell_size) - safeSpace);
            var y = this.randomIntFromInterval(safeSpace, Math.floor(this.gridSize.height / this.cell_size) - safeSpace);
            var tile_coord = { x: x, y: y };
            var dot = new Point(x * this.cell_size, y * this.cell_size);
            if (notInPermuted(dot)) {
                permuted.push(dot);
            }
            tries++;
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
    t_insert_point(point, object) {
        let tile = this.t_return(point);
        if (this.contents[tile] === undefined) {
            this.contents[tile] = new Set();
        }
        this.contents[tile].add({object: object, visualized: false});
    }

// Insert object from rectangle - Intended for use with hitboxes
    t_insert_rectangle(rectangle, object) {
        // Min and Max corners of rectangle
        let min = rectangle.topLeft;
        let max = rectangle.bottomRight;
        // Iterate over area and add objects to tiles/buckets
        for(let x = min.x; x < max.x; x++) {
            for(let y = min.y; y < max.y; y++) {
                this.t_insert_point({x: x,y: y}, object);
            }
        }
    }

    t_insert_line(curves, object) {
        console.log("curves");
        console.log(curves);
        for (let i = 0; i < curves.length; i++) {
            for (let j = 0; j < curves[i].length; j++) {
                let location = curves[i].getLocationAt(j);
                this.t_insert_point(location.point, object);
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