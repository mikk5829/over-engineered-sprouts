// import {SproutWorld} from '../public/scripts/modules/SproutWorld.js';

/**
 * Generates the world
 * @namespace SproutWorld
 * */

export class CollisionGrid {
    /**
     * Collisiongrid constructor
     * @constructor
     * @memberof CollisionGrid
     * @param cell_size The initial size of the cells in the grid
     * @param world The world the grid is connected to
     * @param gridSize The size of the game area in standard pixel measurements.
     **/

    constructor(cell_size, world, gridSize) {
        this.world = world;
        this.cell_size = cell_size;
        this.contents = {};
        this.gridSize = gridSize;
    }

    /**
     * Converts a paper Point object to a CollisionGrid tile format
     * @memberof CollisionGrid
     * @param point The point from the game map
     * @returns {string} A string representation of the corresponding tile on the CollisionGrid
     **/
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

    /**
     * Return tile indices overlapping hitbox (Hash function)
     * @param rectangle
     * @memberOf Collision Grid
     */
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
    /**
     * Associates a tile with an object
     * @memberof CollisionGrid
     * @param tile The tile on the CollisionGrid to insert the object
     * @param object The object to associate with the tile
     **/

    t_insert_point(tile, object) {
        if (this.contents[tile] === undefined) {
            this.contents[tile] = new Set();
        }
        this.contents[tile].add({object: object, visualized: false});
    }

// Insert object from rectangle - Intended for use with hitboxes
    /**
     * Associates a group of tiles with an object
     * @memberof CollisionGrid
     * @param rectangle The area on the game map containing the object
     * @param object The object to associate with the tiles
     **/

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

    /**
     * Associates a series of tiles with a Path object
     * @memberof CollisionGrid
     * @param curves The curves denoting the path to follow and convert
     * @param object The object to associate with the tiles
     **/

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
            if (o.object === obj)
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

    u_valid_point(n, start, goal, best_pick, grid){
        let unexplored = grid[n] === undefined;
        let legal = (this.contents[n] === undefined || this.u_object_of(n, start) || this.u_object_of(n, goal));
        let inside = ((best_pick.dist > 3) || this.world.possibleMove(this.u_middle(n), goal.center));
        let in_map = this.u_middle(n).x < this.gridSize.width && this.u_middle(n).x > 0 && this.u_middle(n).y < this.gridSize.height && this.u_middle(n).y > 0;
        return unexplored && in_map && inside && legal;
    }

    /**
     * Finds and returns a path between two points
     * @memberof CollisionGrid
     * @param start The starting point of the algorithm
     * @param goal The end point of the algorithm
     * @returns {Object}
     **/

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
                if (this.u_valid_point(n, start, goal, best_pick, grid)) {
                    horizon.push({
                        tile: n,
                        f: this.u_dist(n, goal_tile),
                        parent: best_pick.tile,
                        dist: best_pick.dist + 1.0
                    });
                }
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

        return null;
    }

}
