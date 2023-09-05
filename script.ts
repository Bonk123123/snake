let canvas = document.getElementById("snake") as HTMLCanvasElement;
let ctx = canvas.getContext("2d");
let score = document.getElementById("score") as HTMLSpanElement

const width = 500;
const height = 500;
let apples = 0


interface Point {
    x: number;
    y: number;
}


class Field {
    width: number;
    height: number;
    cell: number;
    quantityRectWidth: number;
    quantityRectHeight: number;
    coordApples: Point[];


    constructor(w: number, h: number, cell: number) {
        this.width = w;
        this.height = h;
        this.cell = cell;

        canvas.width = this.width;
        canvas.height = this.height;

        this.quantityRectWidth = Math.floor(this.width / cell);
        this.quantityRectHeight = Math.floor(this.height / cell);

        this.coordApples = []
        this.createApple()

        // field
        if (ctx) {
            for (let i = 0; i < this.quantityRectWidth; i++) {
                const y = cell * (i);
                for (let j = 0; j < this.quantityRectHeight; j++) {
                    const x = cell * (j);
                    ctx.strokeRect(x, y, cell, cell);
                }
                
            }

        }
    }


    // creating apple
    createApple() {
        this.coordApples.push({x: Math.floor(Math.random() * this.quantityRectWidth), y: Math.floor(Math.random() * this.quantityRectHeight)})
        for (let i = 0; i < this.coordApples.length; i++) {
            if (ctx) {
                this.fillPixel(this.coordApples[i].x, this.coordApples[i].y, 'red')
            }
        }
    }
     
    // pixel to color
    fillPixel(cellX: number, cellY: number, color: string) {
        if (this.quantityRectHeight >= cellY && this.quantityRectWidth >= cellX) {
            const x = cellX * this.cell;
            const y = cellY * this.cell;
            if (ctx) {
                ctx.fillStyle = color;
                ctx.fillRect(x + 1, y + 1, this.cell - 2, this.cell - 2);
            }
        }
    }

    // pixel to white
    removePixel(cellX: number, cellY: number) {
        if (this.quantityRectHeight >= cellY && this.quantityRectWidth >= cellX) {
            const x = cellX * this.cell;
            const y = cellY * this.cell;
            if (ctx) {
                ctx.clearRect(x + 1,y + 1, this.cell - 2, this.cell - 2);
                ctx.fillStyle = 'white';
                ctx.fillRect(x + 1, y + 1, this.cell - 2, this.cell - 2);
                
            }
        }
    }
}


class Snake {
    long: number;
    snake: Point[];
    field: Field;
    direction: Point;

    constructor(long: number, velocity: number, field: Field) {
        this.long = long;
        this.field = field;
        this.snake = [];
        
        this.direction = {x: -1, y: 0}

        this.initSnake()

        // keyboard Events
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if(e.key === 'ArrowUp') this.direction = this.direction.y === 1 ? this.direction : {x: 0, y: -1};
            if(e.key === 'ArrowDown') this.direction = this.direction.y === -1 ? this.direction : {x: 0, y: 1};
            if(e.key === 'ArrowRight') this.direction = this.direction.x === -1 ? this.direction : {x: 1, y: 0};
            if(e.key === 'ArrowLeft') this.direction = this.direction.x === 1 ? this.direction : {x: -1, y: 0};
        })

        // frames
        setInterval(() => {
            this.move(this.direction.x, this.direction.y);
        }, 1000 / velocity);
    }

    // init snake
    initSnake() {
        for (let i = 0; i < this.long; i++) {
            let x = Math.floor(this.field.quantityRectWidth / 2) + i - 1
            let y = Math.floor(this.field.quantityRectHeight / 2) - 1
            this.field.fillPixel(x, y, 'green');
            this.snake.push({x, y})
        }

        this.snake = this.snake.reverse()
    }

    lose() {
        this.snake.forEach(item => {
            this.field.removePixel(item.x, item.y);
        })
        this.snake = [];
        this.long = 2
        this.initSnake()
    }

    move(x: number, y: number) {
        
        // direction
        let coordX = this.snake[this.snake.length - 1].x + x, 
            coordY = this.snake[this.snake.length - 1].y + y;

        if(this.snake[this.snake.length - 1].x === -1) {
            coordX = this.field.quantityRectWidth - 1;
            coordY = this.snake[this.snake.length - 1].y;
        }

        if(this.snake[this.snake.length - 1].x === this.field.quantityRectWidth) {
            coordX = 0;
            coordY = this.snake[this.snake.length - 1].y;
        }

        if(this.snake[this.snake.length - 1].y === -1) {
            coordX = this.snake[this.snake.length - 1].x;
            coordY = this.field.quantityRectHeight - 1;
        }

        if(this.snake[this.snake.length - 1].y === this.field.quantityRectHeight) {
            coordX = this.snake[this.snake.length - 1].x;
            coordY = 0;
        }

        const newPixel: Point = {
            x: coordX,
            y: coordY,
        };

        
        // Apple
        let apple = false;

        for (let i = 0; i < this.field.coordApples.length; i++) {
            if (this.field.coordApples[i].x === newPixel.x && this.field.coordApples[i].y === newPixel.y) {
                this.field.removePixel(this.field.coordApples[i].x, this.field.coordApples[i].y);
                this.field.coordApples = this.field.coordApples.filter((_, j) => j != i);
                this.field.createApple();
                apples++;
                score.innerHTML = `Apples: ${apples}`
                apple = true;
            }
        }

        if (!apple) {
            this.field.removePixel(this.snake[0].x, this.snake[0].y);
            this.snake.splice(0, 1);
        }

        // lose
        let lose = false;

        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === newPixel.x && this.snake[i].y === newPixel.y) {
                this.lose();
                lose = true;
                apples = 0
                score.innerHTML = `Apples: ${apples}`
                break;
            }
        }
        
        
        // move
        if (!lose) {
            this.snake.push(newPixel);
            this.field.fillPixel(newPixel.x, newPixel.y, 'green');
        }
    }
}


let f = new Field(width, height, 25);
let s = new Snake(2, 5, f);



