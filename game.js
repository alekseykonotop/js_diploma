'use strict'

const stack = [];

class Vector {
    constructor( x=0, y=0 ) {
        this.x = x;
        this.y = y
    }

    plus(vector) {
        if (vector instanceof Vector) {
            let newX = this.x + vector.x;
            let newY = this.y + vector.y;
            return new Vector(newX, newY);
        } else {
            throw new Error("Можно прибавлять к вектору только вектор типа Vector");
        }
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
        if ((pos instanceof Vector) && 
            (size instanceof Vector) && 
            (speed instanceof Vector)) {
            this.pos = pos;
            this.size = size;
            this.speed = speed;
        } else {
            throw new Error("Можно передавать только объект типа Vector");
        }
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
        if (actor !== undefined && actor instanceof Actor) {
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
        
        } else {
            throw new Error("Можно передавать только объект типа Actor");
        }
    }
 }


class Level {
    constructor(grid, actors) {
        this.grid = grid,
        this.actors = actors,
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
        if (this.grid === undefined) {
            return 0;
        } else {
            return this.grid.length;
        } 
    }

    get width() {
        if (this.grid === undefined) {
            return 0;
        } else {
            let maxWidth = 0;
            for (let line of this.grid ) {
                if (line.length > maxWidth) {
                    maxWidth = line.length;
                }
            }
            
            return maxWidth;
        } 
    }

    isFinished() {
        return (this.status !== null && this.finishDelay < 0) ? true : false;
    }

    actorAt(actor) {
        if (this.grid === undefined && this.actors === undefined) {
            return undefined;
        }

        if (actor !== undefined && actor instanceof Actor) {
            for (let essence of this.actors) {
                if (actor.isIntersect(essence)) {
                    return essence;
                }
            }
            
            return undefined;
        } else {
            throw new Error("Можно передавать только объект типа Actor");
        }
    }


    obstacleAt(pos, size) {
        if (pos instanceof Vector && size instanceof Vector) {
            const endPos = pos.plus(size);

            if (Math.ceil(endPos.y) > this.height) {
                return 'lava';
            } else if (pos.y < 0 || pos.x < 0 || endPos.x > this.width) {
                return 'wall';
            }

            const valueInBasePos = this.grid[Math.floor(pos.y)][Math.floor(pos.x)];
            const valueInUpRightPos = this.grid[Math.floor(pos.y)][Math.ceil(endPos.x)-1];
            const valueInlowLeftPos = this.grid[Math.ceil(endPos.y)-1][Math.floor(pos.x)];
            const valueInResVecPos = this.grid[Math.ceil(endPos.y)-1][Math.ceil(endPos.x)-1];

            if (valueInBasePos === 'lava' ||
                valueInUpRightPos === 'lava' ||
                valueInlowLeftPos === 'lava' ||
                valueInResVecPos === 'lava') {
                return 'lava';
            }
            if (valueInBasePos === 'wall' ||
                valueInUpRightPos === 'wall' ||
                valueInlowLeftPos === 'wall' ||
                valueInResVecPos === 'wall') {
                return 'wall';
            }

            return undefined;

        } else {
            throw new Error("Можно передавать только объекты типа Vector");
        }
    }

    removeActor(actor) {
        if (this.actors.indexOf(actor) >= 0) {
            this.actors.splice(this.actors.indexOf(actor), 1);
        }
    }

    noMoreActors(type) {
        if (this.actors === undefined || this.actors.length === 0) {
            return true;
        }

        for (let actor of this.actors) {
            if (actor.type === type) {
                return false;
            }
        }
        return true; 
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
        } else {
            return undefined;
        }
    }

    obstacleFromSymbol(symbol) {
        if (symbol === 'x') {
            return 'wall';
        } else if (symbol === '!') {
            return 'lava';
        } else {
            return undefined;
        }
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

        if (planActors.length == 0 || this.dict === undefined) {
            return actors;
        }
        
        for (let i = 0; i <= planActors.length -1; i++) {
            for (let j = 0; j <= planActors[i].length - 1; j++) {
                if (planActors[i][j] in this.dict) {
                    let tempClass = this.actorFromSymbol(planActors[i][j]);
                    if (typeof(tempClass) === 'function') {
                        let actor = new tempClass(new Vector(j, i));
                        if (actor instanceof Actor) {
                           actors.push(actor); 
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
        
        if (grid.obstacleAt(nextPosition, this.size) === undefined) {
            this.pos = nextPosition;
        } else {
            this.handleObstacle();
        }
    }
}


class HorizontalFireball extends Fireball {
    constructor(pos) {
        super(pos, undefined, undefined);
        this.speed = new Vector(2, 0);
    }
}


class VerticalFireball extends Fireball {
    constructor(pos) {
        super(pos, undefined, undefined);
        this.speed = new Vector(0, 2);
    }
}


class FireRain extends Fireball {
    constructor(pos) {
        super(pos, undefined, undefined);
        this.speed = new Vector(0, 3);
        this.startingPos = pos;
    }

    handleObstacle() {
        this.pos = this.startingPos;
    }
}


class Coin extends Actor {
    constructor(pos) {
        super(pos, undefined, undefined);
        this.basePos = this.pos;
        this.pos = this.pos.plus(new Vector(0.2, 0.1));
        this.size = new Vector(0.6, 0.6);
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
    .then(() => alert('YOU ARE WON!'));


