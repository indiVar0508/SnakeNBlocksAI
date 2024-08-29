const DROP_SPEED = 5;

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
    this.dropSpeed = DROP_SPEED;
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

  isHurdleOutsideWindow() {
    return this.hurdles[0].y > canvasObj.height;
  }

  drop() {
    this.hurdles.forEach((hurdle) => {
      hurdle.drop();
    });
  }
}

class PipeBlocks {
  constructor() {
    this.pipes = [];
    this.dropSpeed = DROP_SPEED;
    this.possibleXCord = [];
    for (var i = 1; i < 5; i++) {
      this.possibleXCord.push((i * WINDOW_SIZE) / 5);
    }
  }

  addPipe() {
    // If more than 8 pipes its already noisy stop
    if (this.pipes.length > 8) return;
    // 50% chance you ask for a pipe and you get a pipe
    if (Math.random() > 0.5) return;

    this.pipes.push(
      new Rectange(
        this.possibleXCord[
          Math.floor(Math.random() * this.possibleXCord.length)
        ],
        -500, // FIXME: don't hardcode
        10,
        (Math.floor(Math.random() * 5) + 1) * 100,
        "rgb(0,0,0)"
      )
    );
  }

  drop() {
    this.pipes.forEach((pipe) => {
      pipe.y += this.dropSpeed;
    });
  }

  removePipesOutsideWindow() {
    for (var i = 0; i < this.pipes.length; i++) {
      if (this.pipes[i].y > canvasObj.height) {
        // pipe is outside window, need to get rid of it
        this.pipes.splice(i, 1);
        // adjust the pointer
        i--;
      }
    }
  }

  draw() {
    this.pipes.forEach((pipe) => {
      pipe.draw();
    });
  }
}

hurdleBlockObj = new HurdleBlocks();
pipesBlockObj = new PipeBlocks();

function handleOutofWindow() {
  if (hurdleBlockObj.isHurdleOutsideWindow()) {
    // If hurdle has gone outside the window then just reset it.
    hurdleBlockObj.resetHurdles();
    for (var i = 0; i < Math.floor(Math.random() * 10); i++) {
      pipesBlockObj.addPipe();
    }
  }
  pipesBlockObj.removePipesOutsideWindow();
}

function showBlock() {
  pipesBlockObj.draw();
  hurdleBlockObj.draw();
}

function moveBlock() {
  hurdleBlockObj.drop();
  pipesBlockObj.drop();
  handleOutofWindow();
}
