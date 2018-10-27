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
        return "actor";
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
        // let check = objActor instanceof Actor;
        if (objActor instanceof Actor && objActor !== undefined) {
            if (this === objActor) {
                return false; // если вторым объектом передан сам 1-ый объект
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


// code check
const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);
























