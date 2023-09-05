var canvas = document.getElementById("snake");
var ctx = canvas.getContext("2d");
var score = document.getElementById("score");
var width = 500;
var height = 500;
var apples = 0;
var Field = /** @class */ (function () {
    function Field(w, h, cell) {
        this.width = w;
        this.height = h;
        this.cell = cell;
        canvas.width = this.width;
        canvas.height = this.height;
        this.quantityRectWidth = Math.floor(this.width / cell);
        this.quantityRectHeight = Math.floor(this.height / cell);
        this.coordApples = [];
        this.createApple();
        // field
        if (ctx) {
            for (var i = 0; i < this.quantityRectWidth; i++) {
                var y = cell * (i);
                for (var j = 0; j < this.quantityRectHeight; j++) {
                    var x = cell * (j);
                    ctx.strokeRect(x, y, cell, cell);
                }
            }
        }
    }
    // creating apple
    Field.prototype.createApple = function () {
        this.coordApples.push({ x: Math.floor(Math.random() * this.quantityRectWidth), y: Math.floor(Math.random() * this.quantityRectHeight) });
        for (var i = 0; i < this.coordApples.length; i++) {
            if (ctx) {
                this.fillPixel(this.coordApples[i].x, this.coordApples[i].y, 'red');
            }
        }
    };
    // pixel to color
    Field.prototype.fillPixel = function (cellX, cellY, color) {
        if (this.quantityRectHeight >= cellY && this.quantityRectWidth >= cellX) {
            var x = cellX * this.cell;
            var y = cellY * this.cell;
            if (ctx) {
                ctx.fillStyle = color;
                ctx.fillRect(x + 1, y + 1, this.cell - 2, this.cell - 2);
            }
        }
    };
    // pixel to white
    Field.prototype.removePixel = function (cellX, cellY) {
        if (this.quantityRectHeight >= cellY && this.quantityRectWidth >= cellX) {
            var x = cellX * this.cell;
            var y = cellY * this.cell;
            if (ctx) {
                ctx.clearRect(x + 1, y + 1, this.cell - 2, this.cell - 2);
                ctx.fillStyle = 'white';
                ctx.fillRect(x + 1, y + 1, this.cell - 2, this.cell - 2);
            }
        }
    };
    return Field;
}());
var Snake = /** @class */ (function () {
    function Snake(long, velocity, field) {
        var _this = this;
        this.long = long;
        this.field = field;
        this.snake = [];
        this.direction = { x: -1, y: 0 };
        this.initSnake();
        // keyboard Events
        document.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowUp')
                _this.direction = _this.direction.y === 1 ? _this.direction : { x: 0, y: -1 };
            if (e.key === 'ArrowDown')
                _this.direction = _this.direction.y === -1 ? _this.direction : { x: 0, y: 1 };
            if (e.key === 'ArrowRight')
                _this.direction = _this.direction.x === -1 ? _this.direction : { x: 1, y: 0 };
            if (e.key === 'ArrowLeft')
                _this.direction = _this.direction.x === 1 ? _this.direction : { x: -1, y: 0 };
        });
        // frames
        setInterval(function () {
            _this.move(_this.direction.x, _this.direction.y);
        }, 1000 / velocity);
    }
    // init snake
    Snake.prototype.initSnake = function () {
        for (var i = 0; i < this.long; i++) {
            var x = Math.floor(this.field.quantityRectWidth / 2) + i - 1;
            var y = Math.floor(this.field.quantityRectHeight / 2) - 1;
            this.field.fillPixel(x, y, 'green');
            this.snake.push({ x: x, y: y });
        }
        this.snake = this.snake.reverse();
    };
    Snake.prototype.lose = function () {
        var _this = this;
        this.snake.forEach(function (item) {
            _this.field.removePixel(item.x, item.y);
        });
        this.snake = [];
        this.long = 2;
        this.initSnake();
    };
    Snake.prototype.move = function (x, y) {
        // direction
        var coordX = this.snake[this.snake.length - 1].x + x, coordY = this.snake[this.snake.length - 1].y + y;
        if (this.snake[this.snake.length - 1].x === -1) {
            coordX = this.field.quantityRectWidth - 1;
            coordY = this.snake[this.snake.length - 1].y;
        }
        if (this.snake[this.snake.length - 1].x === this.field.quantityRectWidth) {
            coordX = 0;
            coordY = this.snake[this.snake.length - 1].y;
        }
        if (this.snake[this.snake.length - 1].y === -1) {
            coordX = this.snake[this.snake.length - 1].x;
            coordY = this.field.quantityRectHeight - 1;
        }
        if (this.snake[this.snake.length - 1].y === this.field.quantityRectHeight) {
            coordX = this.snake[this.snake.length - 1].x;
            coordY = 0;
        }
        var newPixel = {
            x: coordX,
            y: coordY,
        };
        // Apple
        var apple = false;
        var _loop_1 = function (i) {
            if (this_1.field.coordApples[i].x === newPixel.x && this_1.field.coordApples[i].y === newPixel.y) {
                this_1.field.removePixel(this_1.field.coordApples[i].x, this_1.field.coordApples[i].y);
                this_1.field.coordApples = this_1.field.coordApples.filter(function (_, j) { return j != i; });
                this_1.field.createApple();
                apples++;
                score.innerHTML = "Apples: ".concat(apples);
                apple = true;
            }
        };
        var this_1 = this;
        for (var i = 0; i < this.field.coordApples.length; i++) {
            _loop_1(i);
        }
        if (!apple) {
            this.field.removePixel(this.snake[0].x, this.snake[0].y);
            this.snake.splice(0, 1);
        }
        // lose
        var lose = false;
        for (var i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === newPixel.x && this.snake[i].y === newPixel.y) {
                this.lose();
                lose = true;
                apples = 0;
                score.innerHTML = "Apples: ".concat(apples);
                break;
            }
        }
        // move
        if (!lose) {
            this.snake.push(newPixel);
            this.field.fillPixel(newPixel.x, newPixel.y, 'green');
        }
    };
    return Snake;
}());
var f = new Field(width, height, 25);
var s = new Snake(2, 5, f);
