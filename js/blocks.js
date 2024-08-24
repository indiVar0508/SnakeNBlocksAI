class Rectange {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 10);
    ctx.closePath();
    ctx.fill();
  }
}

class Hurdle extends Rectange {
  constructor(x, y, width, height, color, number) {
    super(x, y, width, height, color);
    this.dropSpeed = 5;
    this.number = number;
  }

  drop() {
    this.y += this.dropSpeed;
  }

  draw() {
    super.draw();
    ctx.fillStyle = "white";
    ctx.font = "48px serif";
    // FIXME: arbitary values hardcoded
    ctx.fillText(`${this.number}`, this.x + 25, this.y + this.height / 2 + 10);
  }
}

class HurdleBlocks {
  constructor() {
    this.hurdles = [];
    for (var i = 0; i < 5; i++) {
      this.hurdles.push(
        new Hurdle(
          (i * WINDOW_SIZE) / 5,
          -100,
          WINDOW_SIZE / 5,
          WINDOW_SIZE / 5,
          // # FIXME: comback for better way to color the blocks
          `rgb(0, 0, 0)`,
          -1
        )
      );
    }
    this.resetHurdles();
  }

  resetHurdles() {
    let numbers = [
      // Intentionally add most of the length to ensure not having multiple solutions
      Math.floor(Math.random() * snake.snakeCircles.length * 5) +
        (snake.snakeCircles.length - 2),
      Math.floor(Math.random() * snake.snakeCircles.length * 5) +
        (snake.snakeCircles.length - 2),
      Math.floor(Math.random() * snake.snakeCircles.length * 5) +
        (snake.snakeCircles.length - 2),
      Math.floor(Math.random() * snake.snakeCircles.length * 5) +
        (snake.snakeCircles.length - 2),
      Math.floor(Math.random() * snake.snakeCircles.length * 5) +
        (snake.snakeCircles.length - 2),
    ];
    let randomSolvableIdx = Math.floor(Math.random() * 5);
    let number;
    for (var i = 0; i < 5; i++) {
      if (i == randomSolvableIdx) {
        // For solution block get a value less than snake length
        number = Math.max(
          0,
          Math.floor(Math.random() * snake.snakeCircles.length - 1)
        );
      } else {
        number = numbers[i];
      }
      this.hurdles[i].color = `rgb(${this.scaleNumberToColor(number)}, 0, 0)`;
      this.hurdles[i].number = number;
      this.hurdles[i].y = -100;
    }
  }

  scaleNumberToColor(num) {
    return 255 - Math.min(255, num);
  }

  draw() {
    this.hurdles.forEach((hurdle) => {
      hurdle.draw();
    });
  }

  drop() {
    this.hurdles.forEach((hurdle) => {
      hurdle.drop();
    });
    if (this.hurdles[0].y > canvasObj.height) {
      this.resetHurdles();
    }
  }
}

hurdleBlockObj = new HurdleBlocks();

function showBlock() {
  hurdleBlockObj.draw();
}

function moveBlock() {
  hurdleBlockObj.drop();
}
