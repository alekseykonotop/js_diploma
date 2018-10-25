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
            throw "Можно прибавлять к вектору только вектор типа Vector"
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

