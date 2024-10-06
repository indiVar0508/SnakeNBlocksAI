const DROP_SPEED = 3;
const COLLISION_TYPE = Object.freeze({
  BOTTOM: 0,
  LEFT: 1,
  RIGHT: 2,
  NO_COLLISION: -1,
});

let possibleXCord = [];
for (var i = 1; i < 5; i++) {
  possibleXCord.push((i * WINDOW_SIZE) / 5 - 5);
}

// ChatGPT Bawa __/\__
function valueToColor(normalizedValue) {
  // Map normalized value to a color scale, here we use a gradient from blue to red
  const r = Math.floor(255 * normalizedValue); // Red channel
  const g = Math.floor(255 * (1 - normalizedValue)); // green channel
  const b = 0; // blue channel remains 0 for simplicity
  return `rgb(${r}, ${g}, ${b})`;
}

// ChatGPT Bawa __/\__
function normalizeArray(arr) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  return arr.map((value) => (value - min) / (max - min));
}

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
  // some kind of friend function of circle!?:/
  collisionWithCircle(circle) {
    let snakeLeftBound = circle.x - circle.radius;
    let snakeRightBound = circle.x + circle.radius;

    if (circle.y >= this.y && circle.y <= this.y + this.height) {
      if (
        snakeLeftBound >= this.x &&
        snakeLeftBound <= this.x + this.width &&
        snakeRightBound >= this.x &&
        snakeRightBound <= this.x + this.width
      ) {
        return COLLISION_TYPE.BOTTOM;
      } else if (
        snakeLeftBound >= this.x &&
        snakeLeftBound <= this.x + this.width
      ) {
        return COLLISION_TYPE.LEFT;
      } else if (
        snakeRightBound >= this.x &&
        snakeRightBound <= this.x + this.width
      ) {
        return COLLISION_TYPE.RIGHT;
      }
    }
    return -1;
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
    this.resetHurdles();
  }

  addHurdle(x, y, width, height, color = "rgb(0, 0, 0)", number = -1) {
    this.hurdles.push(new Hurdle(x, y, width, height, color, number));
  }

  resetHurdles() {
    this.hurdles = [];
    for (var i = 0; i < 5; i++) {
      this.addHurdle(
        (i * WINDOW_SIZE) / 5,
        -(WINDOW_SIZE / 5),
        WINDOW_SIZE / 5,
        WINDOW_SIZE / 5
      );
    }
    let numbers = [
      // FIXME: need better logic to generate numbers
      Math.max(Math.floor(Math.random() * snakeObj.snakeCircles.length * 5), 1),
      Math.max(Math.floor(Math.random() * snakeObj.snakeCircles.length * 5), 1),
      Math.max(Math.floor(Math.random() * snakeObj.snakeCircles.length * 5), 1),
      Math.max(Math.floor(Math.random() * snakeObj.snakeCircles.length * 5), 1),
      Math.max(Math.floor(Math.random() * snakeObj.snakeCircles.length * 5), 1),
    ];
    let randomSolvableIdx = Math.floor(Math.random() * 5);
    let number;
    for (var i = 0; i < 5; i++) {
      if (i == randomSolvableIdx) {
        // For solution block get a value less than snake length
        number = Math.max(
          1,
          Math.floor(Math.random() * snakeObj.snakeCircles.length - 1)
        );
        numbers[i] = number;
      } else {
        number = numbers[i];
      }
      this.hurdles[i].color = `rgb(0, 0, 0)`;
      this.hurdles[i].number = number;
      this.hurdles[i].y = -(WINDOW_SIZE / 5);
    }
    const normalizedValues = normalizeArray(numbers);
    const colors = normalizedValues.map(valueToColor);
    for (var i = 0; i < 5; i++) {
      this.hurdles[i].color = colors[i];
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
  }

  addPipe() {
    // If more than 8 pipes its already noisy stop
    if (this.pipes.length > 3) return;
    // 50% chance you ask for a pipe and you get a pipe
    if (Math.random() > 0.4) return;

    this.pipes.push(
      new Rectange(
        possibleXCord[Math.floor(Math.random() * possibleXCord.length)],
        -500 - (Math.floor(Math.random() * 5) + 1) * 100, // FIXME: don't hardcode
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

class RandomHurdle extends HurdleBlocks {
  constructor() {
    super();
    // we reset items from super
    this.hurdles = [];
    this.dropSpeed = 5;
  }

  addRandomBlocks() {
    // No more than 5 random hurdle at a time
    if (this.hurdles.length > 5) return;
    // 30% change of being created
    if (Math.random() > 0.3) return;
    let number =
      Math.floor(Math.random() * snakeObj.snakeCircles.length * 5) +
      (snakeObj.snakeCircles.length - 2);
    this.addHurdle(
      // Random X cordinate
      (Math.floor(Math.random() * 5) * WINDOW_SIZE) / 5,
      // Random Y cordinate
      -(WINDOW_SIZE / 5) * (Math.floor(Math.random() * 5) + 1),
      WINDOW_SIZE / 5,
      WINDOW_SIZE / 5,
      `rgb(${this.scaleNumberToColor(number)}, 0, 0)`,
      number
    );
  }

  removeBlocksOutsideWindow() {
    for (var i = 0; i < this.hurdles.length; i++) {
      if (this.hurdles[i].y > canvasObj.height) {
        this.hurdles.splice(i, 1);
        i--;
      }
    }
  }
}

class SnakeFood extends Rectange {
  constructor(x, y, width, height, color, number) {
    super(x, y, width, height, color);
    this.number = number;
    this.dropSpeed = DROP_SPEED;
  }

  drop() {
    this.y += this.dropSpeed;
    if (this.y > canvasObj.height) {
      // reset food location
      this.reset();
    }
  }

  reset() {
    let numbers = [
      Math.max(1, Math.floor(Math.random() * snakeObj.snakeCircles.length)),
      Math.max(
        1,
        Math.floor(
          Math.random() * snakeObj.snakeCircles.length +
            Math.floor(Math.random() * 10)
        )
      ),
      Math.max(
        1,
        Math.floor(
          Math.random() * snakeObj.snakeCircles.length +
            Math.floor(Math.random() * 20)
        )
      ),
      Math.max(
        1,
        Math.floor(
          Math.random() * snakeObj.snakeCircles.length +
            Math.floor(Math.random() * 5)
        )
      ),
      Math.max(
        1,
        Math.floor(
          Math.random() * snakeObj.snakeCircles.length +
            Math.floor(Math.random() * 4)
        )
      ),
    ];
    this.x = possibleXCord[Math.floor(Math.random() * possibleXCord.length)];
    this.y = -5 * (Math.floor(Math.random() * 5) + 1) * 100;
    this.number = numbers[Math.floor(Math.random() * numbers.length)];
  }

  draw() {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, this.width / 2 + 3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.font = "20px serif";
    // FIXME: arbitary values hardcoded
    ctx.fillText(`${this.number}`, this.x, this.y);
  }
}

class SnakeBooster {
  constructor() {
    this.resetFood();
  }

  resetFood() {
    this.foods = [];
    for (var i = 0; i < 7; i++) {
      let food = new SnakeFood(0, 0, 25, 25, "rgb(0,0,0)", 0);
      food.reset();
      this.foods.push(food);
    }
  }

  draw() {
    this.foods.forEach((food) => {
      food.draw();
    });
  }

  drop() {
    this.foods.forEach((food) => {
      food.drop();
    });
  }

  checkConsumedFood() {
    var foodScore = 0;
    this.foods.forEach((food) => {
      let collision = food.collisionWithCircle(snakeObj.snakeCircles[0]);
      if (collision != COLLISION_TYPE.NO_COLLISION) {
        foodScore += food.number;
        while (food.number > 0) {
          snakeObj.addCircle();
          food.number--;
        }
        food.reset();
      }
    });
    return foodScore;
  }
}

class Blocks {
  constructor() {
    this.hurdleBlockObj = new HurdleBlocks();
    this.pipesBlockObj = new PipeBlocks();
    this.randomHurdleObj = new RandomHurdle();
  }

  handleOutofWindow() {
    if (this.hurdleBlockObj.isHurdleOutsideWindow()) {
      // If hurdle has gone outside the window then just reset it.
      this.hurdleBlockObj.resetHurdles();
      for (var i = 0; i < Math.floor(Math.random() * 10); i++) {
        this.pipesBlockObj.addPipe();
      }
      for (var i = 0; i < Math.floor(Math.random() * 10); i++) {
        this.randomHurdleObj.addRandomBlocks();
      }
      // Remove blocks overlapping main hurdle block
      this.hurdleBlockObj.hurdles.forEach((mainHurdle) => {
        for (var i = 0; i < this.randomHurdleObj.hurdles.length; i++) {
          if (
            // Y co-ordinate and x coordinate match at time of creation which means there is overlap
            mainHurdle.y - this.randomHurdleObj.hurdles[i].y == 0 &&
            mainHurdle.x - this.randomHurdleObj.hurdles[i].x == 0
            // FIXME: need to look into vertically aligned ones as well
          ) {
            this.randomHurdleObj.hurdles.splice(i, 1);
          }
        }
      });
    }
    this.pipesBlockObj.removePipesOutsideWindow();
    this.randomHurdleObj.removeBlocksOutsideWindow();
  }

  draw() {
    this.randomHurdleObj.draw();
    this.pipesBlockObj.draw();
    this.hurdleBlockObj.draw();
  }

  reset() {
    this.randomHurdleObj.hurdles = [];
    this.hurdleBlockObj.resetHurdles();
    this.pipesBlockObj.pipes = [];
  }

  drop() {
    this.hurdleBlockObj.drop();
    this.pipesBlockObj.drop();
    this.randomHurdleObj.drop();
  }

  freeze() {
    // Hurdle Block
    this.hurdleBlockObj.hurdles.forEach((block) => {
      block.dropSpeed *= -1;
      block.drop();
      block.dropSpeed *= -1;
    });
    this.randomHurdleObj.hurdles.forEach((block) => {
      block.dropSpeed *= -1;
      block.drop();
      block.dropSpeed *= -1;
    });

    this.pipesBlockObj.dropSpeed *= -1;
    this.pipesBlockObj.drop();
    this.pipesBlockObj.dropSpeed *= -1;

    snakeBoostersObj.foods.forEach((food) => {
      food.dropSpeed *= -1;
      food.drop();
      food.dropSpeed *= -1;
    });
  }

  collision(snake) {
    // Deal only with snake head
    let snakeHead = snake.snakeCircles[0];
    // Pipecollision handling
    this.pipesBlockObj.pipes.forEach((pipe) => {
      let collision = pipe.collisionWithCircle(snakeHead);
      if (collision === COLLISION_TYPE.NO_COLLISION) {
        return;
      }
      if (collision === COLLISION_TYPE.LEFT) {
        // Handle Left direction
        snakeObj.snakeCircles[0].x = pipe.x + pipe.width + snakeHead.radius;
      } else if (collision === COLLISION_TYPE.RIGHT) {
        // Handle Right direction
        snakeObj.snakeCircles[0].x = pipe.x - snakeHead.radius;
      } else if (collision === COLLISION_TYPE.BOTTOM) {
        // push to left!?!
        // FIXME: so this does not work :(
        snakeObj.snakeCircles[0].x = pipe.x - snakeHead.radius;
      }
    });
    // restrict snake when it hits number block
    // based on number on block, block also stops falling
    // everything stops falling
    // 3 scenerios!?
    // if snake hits bottom somethings happen
    //  - all blocks & snake are frozen
    //  - number decreases in block collinding
    //  - ??
    // if snake hits sidewise it gets restrickted
    var score = 0;
    // Handle random block collision
    for (var i = 0; i < this.randomHurdleObj.hurdles.length; i++) {
      let hurdle = this.randomHurdleObj.hurdles[i];
      let collision = hurdle.collisionWithCircle(snakeHead);
      if (collision === COLLISION_TYPE.LEFT) {
        // Handle Left direction
        snakeObj.snakeCircles[0].x = hurdle.x + hurdle.width + snakeHead.radius;
      } else if (collision === COLLISION_TYPE.RIGHT) {
        // Handle Right direction
        snakeObj.snakeCircles[0].x = hurdle.x - snakeHead.radius;
      } else if (collision === COLLISION_TYPE.BOTTOM) {
        // freeze everything in screen
        this.freeze();
        // reduce snake size
        snakeObj.snakeCircles.pop();
        // reduce block number
        hurdle.number -= 1;
        score++;
        if (hurdle.number < 0) {
          // Remove the hurdle
          this.randomHurdleObj.hurdles.splice(i, 1);
        }
      }
    }

    // handle main block
    for (var i = 0; i < this.hurdleBlockObj.hurdles.length; i++) {
      let hurdle = this.hurdleBlockObj.hurdles[i];
      let collision = hurdle.collisionWithCircle(snakeHead);
      if (collision === COLLISION_TYPE.LEFT) {
        // Handle Left direction
        snakeObj.snakeCircles[0].x = hurdle.x + hurdle.width + snakeHead.radius;
      } else if (collision === COLLISION_TYPE.RIGHT) {
        // Handle Right direction
        snakeObj.snakeCircles[0].x = hurdle.x - snakeHead.radius;
      } else if (collision === COLLISION_TYPE.BOTTOM) {
        // freeze everything in screen
        this.freeze();
        // reduce snake size
        snakeObj.snakeCircles.pop();
        // reduce block number
        hurdle.number -= 1;
        score++;
        if (hurdle.number < 1) {
          // Remove the hurdle
          this.hurdleBlockObj.hurdles.splice(i, 1);
        }
      }
    }
    return score;
  }
}

blocks = new Blocks();
snakeBoostersObj = new SnakeBooster();

function showBlock() {
  snakeBoostersObj.draw();
  blocks.draw();
}

function moveBlock() {
  blocks.drop();
  blocks.handleOutofWindow();
  snakeBoostersObj.drop();
}

function handleCollision(snake) {
  snakeBoostersObj.checkConsumedFood(snake);
  var score = blocks.collision(snake);
  return score;
}
