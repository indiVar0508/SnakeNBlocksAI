const WINDOW_SIZE = 550;

class Circle {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.speed = 0;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  }

  moveX(x) {
    if (!x) {
      return;
    }

    if (x - this.radius <= 0) {
      x = this.radius;
    } else if (x + this.radius >= WINDOW_SIZE) {
      x = WINDOW_SIZE - this.radius;
    }

    this.speed = Math.floor((x - this.x) / 5);
    this.x += this.speed;
  }
}

class Snake {
  constructor(size = 4) {
    this.size = size;
    this.startPoint = 400;
    this.circleRadius = 10;
    this.isAlive = true;
    this.snakeCircles = [];
    this.colorCode = 160;
    this.snakeColor = `rgb(${this.colorCode}, ${this.colorCode}, ${this.colorCode})`;
    let i = 0;
    while (i < this.size) {
      this.addCircle();
      i += 1;
    }
  }

  addCircle() {
    const snakeLength = this.snakeCircles.length;
    this.snakeCircles.push(
      new Circle(
        WINDOW_SIZE / 2,
        this.startPoint + 2 * snakeLength * this.circleRadius,
        this.circleRadius,
        this.snakeColor
      )
    );
  }

  drawSnake() {
    this.snakeCircles.forEach((circle) => {
      circle.draw();
    });
  }

  move(x) {
    // shift x coordintate downwards
    for (var i = this.snakeCircles.length - 1; i > 0; i--) {
      this.snakeCircles[i].x = this.snakeCircles[i - 1].x;
    }
    // now move the head
    this.snakeCircles[0].moveX(x);
  }
}

let snake = new Snake();

function moveSnake(evt) {
  var rect = canvas.getBoundingClientRect();
  // ref: https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
  snake.move((canvasObj.width / rect.width) * (evt.clientX - rect.left));
}

function showSnake() {
  // FIXME: something missing here snake gets stuck sometimes :/!?
  snake.drawSnake();
}
