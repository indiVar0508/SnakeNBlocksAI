function startGame() {
  const scoreObj = document.getElementById("score");
  const bestScoreObj = document.getElementById("best_score");
  const attemptNumObj = document.getElementById("attempt_num");
  const snakeSizeObj = document.getElementById("snake_size");
  let score = 0;
  let bestScore = 0;
  let attemptNumber = 1;

  // window.addEventListener("mousemove", moveSnake, true);
  // canvasObj.addEventListener("mousemove", moveSnake, true);
  draw = function () {
    // Render Logic
    ctx.clearRect(0, 0, canvasObj.width, canvasObj.height);
    showBlock();
    showSnake();
    state = getState()
    action = agent.act(tf.tensor([state])).argMax(-1).dataSync()[0]
    if (action == 0) {
      snakeObj.moveLeft()
    } else if (action == 1) {
      snakeObj.moveRight()
    } else {
      console.error("Unknown action")
    }
    // Handle Movement
    moveBlock();
    // Collision
    let reward = handleCollision(snakeObj);
    score += reward;
    next_state = getState()
    attemptNumObj.innerHTML = attemptNumber;
    bestScoreObj.innerHTML = bestScore;
    scoreObj.innerHTML = score;
    snakeSizeObj.innerHTML = snakeObj.snakeCircles.length;
    // Is Game still on!?
    if (!snakeObj.isAlive()) {
  
      if (agent.memory.buffer == 8000) {
        // Once agent has 80% max buffer size train
        agent.learn()

      }
      attemptNumber++;
      snakeObj = new Snake();
      snakeBoostersObj.resetFood();
      blocks.reset();
      if (score > bestScore) {
        bestScore = score;
      }
      score = 0;
    }
    agent.remember(state, action, reward, next_state);

    // something related to canvas
    requestAnimationFrame(draw);
  };

  draw();
}

function getState() {
  
  function rgbToGrayscaleWeighted(r, g, b) {
    // Function by ChatGPT BaWa __/\__
    return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  let image = ctx.getImageData(0, 0, canvasObj.width, canvasObj.height);
  let aiFrame = [];
  let row = [];
  var colCounter = 0;
  var rowCounter = 0;
  for (let i = 0; i < image.data.length; i += 4) {
    const r = image.data[i];
    const g = image.data[i + 1];
    const b = image.data[i + 2];

    const gray = rgbToGrayscaleWeighted(r, g, b);

    // Set grayscale value to R, G, and B channels
    image.data[i] = gray; // Red
    image.data[i + 1] = gray; // Green
    image.data[i + 2] = gray; // Blue
    row.push([gray / 255]);
    colCounter++;
    if (colCounter == canvasObj.width) {
      if( rowCounter % 2 == 0) {
        let rowsToStore = row.filter(function(value, index, Arr) {
          // Store every second pixel
          return index % 2 == 0;
        })
        aiFrame.push(rowsToStore);

        for(var x = 0; x < aiWidth; x++) {
            var pos = ((rowCounter / 2) * aiWidth + x) * 4;
            buffer[pos  ] = 255 * rowsToStore[x][0];
            buffer[pos+1] = 255 * rowsToStore[x][0];
            buffer[pos+2] = 255 * rowsToStore[x][0];
            buffer[pos+3] = 125;
          }
      }

      row = [];
      colCounter = 0;
      rowCounter++;
    }
    // Alpha channel remains unchanged
  }
  idata.data.set(buffer);
  ctx3.putImageData(idata, 0, 0);
  ctx2.putImageData(image, 0, 0);
  return aiFrame
}