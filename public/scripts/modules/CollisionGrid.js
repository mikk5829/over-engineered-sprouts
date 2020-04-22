// The idea is that tiles are like buckets. Buckets are associated with keys and several keys/buckets
// connects with a set of objects.
export class CollisionGrid {
    constructor(cell_size) {
        this.cell_size = cell_size;
        this.contents = {};
        //this.tile_matrix = math.matrix(); this.tile_matrix.resize([cell_size, cell_size], null); // May not be needed
    }

// Return position of tile from point (Hash function)
    t_return(point) {
        let key = Math.floor(point.x/this.cell_size)+";"+Math.floor(point.y/this.cell_size);
        return key;
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
        this.contents[tile].add(object);
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

}