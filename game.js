'use strict'

// Реализовать базовые классы игры: Vector, Actor и Level

// базовый класс Vector

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


// code check
const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);



// базовый класс Actor
 
 class Actor {
    constructor(
        pos = new Vector(0, 0),
        size = new Vector(1, 1),
        speed = new Vector(0, 0),
        ) {
        if ((pos instanceof Vector) && (size instanceof Vector) && (speed instanceof Vector)) {
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
        return this.pos.x + this.size.x;
    }
    get bottom() {
        return this.pos.y + this.size.y;
    }

    act() {

    }

    isIntersect(objActor) {
        if (objActor instanceof Actor && objActor !== undefined) {
            if (this === objActor) {
                return false;
            } else if (this.left === objActor.left &&
                       this.top === objActor.top &&
                       this.right === objActor.right &&
                       this.bottom === objActor.bottom) {
                return true;
            } else {
                for (let i = this.left + 1; i <= this.right - 1; i++) {
                    if (i >= objActor.left && i <= objActor.right) {
                        for (let j = this.top + 1; j <= this.bottom - 1; j++) {
                            if (j >= objActor.top && j <= objActor.bottom) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        } else {
            throw new Error("Можно передавать только объект типа Actor");
        }
        
    }
 }

 Object.defineProperty(Actor, 'type', {
    writable: false,
    value: 'actor'
 });


// code check
// const items = new Map();
// const player = new Actor();
// items.set('Игрок', player);
// items.set('Первая монета', new Actor(new Vector(10, 10)));
// items.set('Вторая монета', new Actor(new Vector(15, 5)));

// function position(item) {
//   return ['left', 'top', 'right', 'bottom']
//     .map(side => `${side}: ${item[side]}`)
//     .join(', ');  
// }

// function movePlayer(x, y) {
//   player.pos = player.pos.plus(new Vector(x, y));
// }

// function status(item, title) {
//   console.log(`${title}: ${position(item)}`);
//   if (player.isIntersect(item)) {
//     console.log(`Игрок подобрал ${title}`);
//   }
// }

// items.forEach(status);
// movePlayer(10, 10);
// items.forEach(status);
// movePlayer(5, -5);
// items.forEach(status);



// базовый класс Level

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
        return (this.status !== 1 && this.finishDelay < 0) ? true : false;
    }

    actorAt(objActor) {
        if (this.grid === undefined && this.actors === undefined) {
            return undefined;
        }
        if (objActor instanceof Actor && objActor !== undefined) {
            for (let actor of this.actors) {
                if (actor.isIntersect(objActor)) {
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
            // my logic
            let resVec = posVec.plus(sizeVec);
            let resX = Math.floor(resVec.x - 1);
            let resY = Math.floor(resVec.y - 1);
            
            if (((posVec.x % 1 != 0 || posVec.y % 1 != 0) || // если объект имеет не целочисленные координаты
                (sizeVec.x % 1 != 0 || sizeVec.y % 1 != 0)) && // если объект имеет не целочисленный размер
                ((this.grid[Math.floor(posVec.y)][Math.floor(posVec.x)] === 'wall') || // если площадь пересекается со стеной в начальной точке
                (this.grid[resY][resX] === 'wall'))) {  // если площадь пересекается со стеной в конечной точке
                
                return 'wall';
            }

            // проверяем выходит ли объект за пределы поля
            if (resY >= this.height - 1) {
                return 'lava';
            } else if (posVec.y < 0 || posVec.x < 0 || resX > this.width - 1) {
                return 'wall';
            }
            
            return this.grid[resY][resX] ? this.grid[resY][resX] : undefined;
        } else {
            throw new Error("Можно передавать только объекты типа Vector");
        }
    }

    removeActor(objActor) {
        for (let i = 0; i <= this.actors.length - 1; i++) {
            if (this.actors[i] === objActor) {
                this.actors.splice(i, 1);
                return;
            }
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
            } 
            if (typeObj === 'coin' && objActor instanceof Actor) {
                this.removeActor(objActor);
                if (this.noMoreActors(typeObj)) {
                    this.status = 'won';
                }
            }
        }
    }
}


// code check
// const grid = [
//   [undefined, undefined],
//   ['wall', 'wall']
// ];

// function MyCoin(title) {
//   this.type = 'coin';
//   this.title = title;
// }
// MyCoin.prototype = Object.create(Actor);
// MyCoin.constructor = MyCoin;

// const goldCoin = new MyCoin('Золото');
// const bronzeCoin = new MyCoin('Бронза');
// const player = new Actor();
// const fireball = new Actor();

// const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

// level.playerTouched('coin', goldCoin);
// level.playerTouched('coin', bronzeCoin);

// if (level.noMoreActors('coin')) {
//   console.log('Все монеты собраны');
//   console.log(`Статус игры: ${level.status}`);
// }

// const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
// if (obstacle) {
//   console.log(`На пути препятствие: ${obstacle}`);
// }

// const otherActor = level.actorAt(player);
// if (otherActor === fireball) {
//   console.log('Пользователь столкнулся с шаровой молнией');
// }




// класс LevelParser

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
}


// code check
const plan = [
  ' @ ',
  'x!x'
];

const actorsDict = Object.create(null);
actorsDict['@'] = Actor;

const parser = new LevelParser(actorsDict);
const level = parser.parse(plan);

level.grid.forEach((line, y) => {
  line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
});

level.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));















