'use strict'

class Vector {
    constructor( x=0, y=0 ) {
        this.x = x;
        this.y = y
    }

    plus(vector) {
        if (vector.constructor != Vector) {
            throw new Error("Можно прибавлять к вектору только вектор типа Vector");
        }

        let newX = this.x + vector.x;
        let newY = this.y + vector.y;

        return new Vector(newX, newY);
    }

    times(factor) {
      return new Vector(this.x * factor, this.y * factor);
    }
}


class Actor {
    constructor(
        pos = new Vector(0, 0),
        size = new Vector(1, 1),
        speed = new Vector(0, 0),
        ) {

        if (pos.constructor !== Vector ||
            size.constructor !== Vector ||
            speed.constructor !== Vector) {
            throw new Error("Можно передавать только объект типа Vector");
        }
        
        this.pos = pos;
        this.size = size;
        this.speed = speed;
    }

    get type() {
        return 'actor';
    }

    get left() {
        return this.pos.x;
    }

    get top() {
        return this.pos.y;
    }

    get right() {
        return this.pos.plus(this.size).x;
    }

    get bottom() {
        return this.pos.plus(this.size).y;
    }

    act() {

    }

    isIntersect(actor) {
        if ((actor instanceof Actor) == false) {
            throw new Error("Можно передавать только объект типа Actor");
        }

        if (this === actor) {
            return false;
        }

        if (this.pos.x == actor.pos.x && this.pos.y == actor.pos.y) {
            if (actor.size.x < 0 && actor.size.y < 0) {
                return false;
            }
        }

        if ((this.left == actor.right && this.left >= actor.left) ||
            (this.right == actor.left && this.right <= actor.right) ||
            (this.top == actor.bottom && this.top >= actor.top) ||
            (this.bottom == actor.top && this.bottom <= actor.bottom)) {
            return false;
           }

        if ((actor.left >= this.left &&  actor.left <= this.right) || 
            (actor.right <= this.right &&  actor.right >= this.left)) {
            if ((actor.top >= this.top && actor.top <= this.bottom) ||
                (actor.bottom >= this.top && actor.bottom <= this.bottom)) {
                return true;
            }
        }
        
        return false;
    }
 }


class Level {
    constructor(grid, actors) {
        this.grid = (grid instanceof Array) ? grid : [],
        this.actors = (actors instanceof Array) ? actors : [],
        this.status = null,
        this.finishDelay = 1
    }

    get player() {
        if (this.actors) {
            for (let actor of this.actors) {
                if (actor.type === 'player') {
                    return actor;
                }
            }
        }
    }

    get height() {
        
        return this.grid.length;
    }

    get width() {
        let maxWidth = 0;
        
        for (let line of this.grid ) {
            if (line.length > maxWidth) {
                maxWidth = line.length;
            }
        }
        
        return maxWidth;
    }

    isFinished() {
        return this.status !== null && this.finishDelay < 0;
    }

    actorAt(actor) {
        if (actor instanceof Actor == false) {
                throw new Error("Можно передавать только объект типа Actor");
            }

        for (let essence of this.actors) {
            if (actor.isIntersect(essence)) {
                return essence;
            }
        }
    }

    
    obstacleAt(pos, size) {

        if (pos.constructor != Vector && size.constructor != Vector) {
            throw new Error("Можно передавать только объекты типа Vector");
        }

        var xStart = Math.floor(pos.x);
        var xEnd = Math.ceil(pos.x + size.x);
        var yStart = Math.floor(pos.y);
        var yEnd = Math.ceil(pos.y + size.y);

        if (Math.ceil(yEnd) > this.height) {
            return 'lava';
        }
        if (yStart < 0 || xStart < 0 || xEnd > this.width) {
            return 'wall';
        }

        const upperLeftCorner = this.grid[Math.floor(yStart)][Math.floor(xStart)];
        const upperRightCorner = this.grid[Math.floor(yStart)][Math.ceil(xEnd)-1];
        const lowerLeftCorner = this.grid[Math.ceil(yEnd)-1][Math.floor(pos.x)];
        const lowerRightCorner = this.grid[Math.ceil(yEnd)-1][Math.ceil(xEnd)-1];
        
        const corners = [upperLeftCorner, upperRightCorner, lowerLeftCorner, lowerRightCorner];
        
        for (let corner of corners) {
            if (corner === 'lava') {
                return corner;
            }
        }

        for (var y = yStart; y < yEnd; y++) {
            for (var x = xStart; x < xEnd; x++) {
                var fieldType = this.grid[y][x];
                if (fieldType) {
                    return fieldType;
                }
            }
        }
    }

    removeActor(actor) {
        if (this.actors.indexOf(actor) >= 0) {
            this.actors.splice(this.actors.indexOf(actor), 1);
        }
    }

    noMoreActors(type) {
        return this.actors.every((actor) => actor.type !== type);
    }

    playerTouched(type, actor) {
        if (this.status === null) {
            if (type === 'lava' || type === 'fireball') {
                this.status = 'lost';
            } else if (type === 'coin') {
                this.removeActor(actor);
                if (this.noMoreActors(type)) {
                    this.status = 'won';
                }
            }
        }
    }
}


class LevelParser {
    constructor(dict) {
        this.dict = dict;
    }

    actorFromSymbol(symbol) {
        if (symbol && symbol in this.dict) {
            return this.dict[symbol];
        } 
    }

    obstacleFromSymbol(symbol) {
        const obstacle = {
            'x': 'wall',
            '!': 'lava'
        }
        
        return obstacle[symbol];
    }

    createGrid(planLevels) {
        let grid = [];

        for (let line of planLevels) {
            let sectionGrid = [];
            for (let char of line) {
                sectionGrid.push(this.obstacleFromSymbol(char));
            }
            grid.push(sectionGrid);
        }
        
        return grid;
    }

    createActors(planActors) {
        let actors = [];

        if (planActors.length && this.dict) {
            for (let i = 0; i <= planActors.length -1; i++) {
                for (let j = 0; j <= planActors[i].length - 1; j++) {
                    if (planActors[i][j] in this.dict) {
                        let actorClass = this.actorFromSymbol(planActors[i][j]);
                        if (typeof(actorClass) === 'function') {
                            let actor = new actorClass(new Vector(j, i));
                            if (actor instanceof Actor) {
                               actors.push(actor); 
                            }
                        }
                    }
                }
            }
        }
        
        return actors;
    }

    parse(fieldPlan) {
        let grid = this.createGrid(fieldPlan);
        let actors = this.createActors(fieldPlan);

        return new Level(grid, actors);
    }
}


class Fireball extends Actor {
    constructor(pos, speed) {
        super(pos, undefined, speed);
    }

    get type() {
        return 'fireball';
    }

    getNextPosition(time = 1) {
        let distance = this.speed.times(time);
        let newPos = this.pos.plus(distance);
        
        return newPos;
    }

    handleObstacle() {
         this.speed = this.speed.times(-1);
    }

    act(time, grid) {
        let nextPosition = this.getNextPosition(time);

        if (grid.obstacleAt(nextPosition, this.size)) {
            this.handleObstacle();
        } else {
            this.pos = nextPosition;
        }
    }
}


class HorizontalFireball extends Fireball {
    constructor(pos) {
        super(pos, new Vector(2, 0));
    }
}


class VerticalFireball extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 2));
    }
}


class FireRain extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 3));
        this.startingPos = pos;
    }

    handleObstacle() {
        this.pos = this.startingPos;
    }
}


class Coin extends Actor {
    constructor(pos) {
        super(pos, new Vector(0.6, 0.6), undefined);
        this.basePos = this.pos;
        this.pos = this.pos.plus(new Vector(0.2, 0.1));
        this.spring = 2 * Math.random() * Math.PI;
        this.springSpeed = 8;
        this.springDist = 0.07;
    }

    get type() {
        return 'coin';
    }

    updateSpring(time = 1) {
        this.spring += this.springSpeed * time;
    }

    getSpringVector() {
        let y = Math.sin(this.spring) * this.springDist;
        
        return new Vector(0, y);
    }

    getNextPosition(time = 1) {
        this.updateSpring(time);

        return new Coin(this.basePos).pos.plus(this.getSpringVector());
    }

    act(time) {
        let nextPosition = this.getNextPosition(time);
        this.pos = nextPosition;
    } 
}

class Player extends Actor {
    constructor(pos) {
        super(pos, new Vector(0.8, 1.5), undefined);
        this.pos = this.pos.plus(new Vector(0, -0.5));
    }

    get type() {
        return 'player';
    }
}


const actorDict = {
  '@': Player,
  'v': FireRain,
  '=': HorizontalFireball,
  'o': Coin,
  '|': VerticalFireball,
}

const parser = new LevelParser(actorDict);


loadLevels()
    .then(schema => runGame(JSON.parse(schema), parser, DOMDisplay))
    .then(() => alert('Victory. You won!'));


