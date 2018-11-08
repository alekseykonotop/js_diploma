'use strict'

const stack = [];

class Vector {
    constructor( x=0, y=0 ) {
        this.x = x;
        this.y = y
    }

    plus(objVector) {
        if (objVector instanceof Vector) {
            let newX = this.x + objVector.x;
            let newY = this.y + objVector.y;
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

    isIntersect(objActor) {
        if ( objActor !== undefined && objActor instanceof Actor ) {
            if (this === objActor) {
                return false;
            }

            if (this.pos.x == objActor.pos.x && this.pos.y == objActor.pos.y) {
                if (objActor.size.x < 0 && objActor.size.y < 0) {
                    return false;
                }
            }

            if ((this.left == objActor.right && this.left >= objActor.left) ||
               (this.right == objActor.left && this.right <= objActor.right) ||
               (this.top == objActor.bottom && this.top >= objActor.top) ||
               (this.bottom == objActor.top && this.bottom <= objActor.bottom)) {
                return false;
               }

            if ((objActor.left >= this.left &&  objActor.left <= this.right) || 
                (objActor.right <= this.right &&  objActor.right >= this.left)) {
                if ((objActor.top >= this.top && objActor.top <= this.bottom) ||
                    (objActor.bottom >= this.top && objActor.bottom <= this.bottom)) {
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

    actorAt(objActor) {
        if (this.grid === undefined && this.actors === undefined) {
            return undefined;
        }

        if ( objActor !== undefined && objActor instanceof Actor ) {
            for (let actor of this.actors) {
                if (objActor.isIntersect(actor)) {
                    return actor;
                }
            }
            
            return undefined;
        } else {
            throw new Error("Можно передавать только объект типа Actor");
        }
    }


    obstacleAt(posVec, sizeVec) {
        if (posVec instanceof Vector && sizeVec instanceof Vector) {
            const resVec = posVec.plus(sizeVec);

            if (Math.ceil(resVec.y) > this.height) {
                return 'lava';
            } else if (posVec.y < 0 || posVec.x < 0 || resVec.x > this.width) {
                return 'wall';
            }

            const valueInBasePos = this.grid[Math.floor(posVec.y)][Math.floor(posVec.x)];
            const valueInUpRightPos = this.grid[Math.floor(posVec.y)][Math.ceil(resVec.x)-1];
            const valueInlowLeftPos = this.grid[Math.ceil(resVec.y)-1][Math.floor(posVec.x)];
            const valueInResVecPos = this.grid[Math.ceil(resVec.y)-1][Math.ceil(resVec.x)-1];

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

    removeActor(objActor) {
        if (this.actors.indexOf(objActor) >= 0) {
            this.actors.splice(this.actors.indexOf(objActor), 1);
        }
    }

    noMoreActors(typeObj) {
        if (this.actors === undefined || this.actors.length === 0) {
            return true;
        }

        for (let actor of this.actors) {
            if (actor.type === typeObj) {
                return false;
            }
        }
        return true; 
    }

    playerTouched(typeObj, objActor) {
        if (this.status === null) {
            if (typeObj === 'lava' || typeObj === 'fireball') {
                this.status = 'lost';
            } else if (typeObj === 'coin') {
                this.removeActor(objActor);
                if (this.noMoreActors(typeObj)) {
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

    createGrid(arrayStr) {
        let grid = [];

        for (let line of arrayStr) {
            let sectionGrid = [];
            for (let char of line) {
                sectionGrid.push(this.obstacleFromSymbol(char));
            }
            grid.push(sectionGrid);
        }
        
        return grid;
    }

    createActors(plan) {
        let actors = [];

        if (plan.length == 0 || this.dict === undefined) {
            return actors;
        }
        
        for (let i = 0; i <= plan.length -1; i++) {
            for (let j = 0; j <= plan[i].length - 1; j++) {
                if (plan[i][j] in this.dict) {
                    let tempClass = this.actorFromSymbol(plan[i][j]);
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

    parse(strArray) {
        let grid = this.createGrid(strArray);
        let actors = this.createActors(strArray);

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
        let nextPos = this.getNextPosition(time);
        this.pos = nextPos;
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


const schemas = [
  [
    '         ',
    '         ',
    '   =     ',
    '       o ',
    ' @   !xxx',
    '  o      ',
    'xxx!     ',
    '         '
  ],
  [
    '      v  ',
    '       v ',
    '  v      ',
    '        o',
    '        x',
    '@   x    ',
    'x        ',
    '         '
  ]
];
const actorDict = {
  '@': Player,
  'v': FireRain,
  '=': HorizontalFireball,
  'o': Coin,
  '|': VerticalFireball,
}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => alert('Вы выиграли приз!'));








