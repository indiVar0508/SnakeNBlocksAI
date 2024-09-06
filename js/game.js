function startGame() {
  const scoreObj = document.getElementById("score");
  const bestScoreObj = document.getElementById("best_score");
  const attemptNumObj = document.getElementById("attempt_num");
  const snakeSizeObj = document.getElementById("snake_size");
  let score = 0;
  let bestScore = 0;
  let attemptNumber = 1;

  function rgbToGrayscaleWeighted(r, g, b) {
    // Function by ChatGPT BaWa __/\__
    return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  window.addEventListener("mousemove", moveSnake, true);
  // canvasObj.addEventListener("mousemove", moveSnake, true);
  draw = function () {
    // Render Logic
    ctx.clearRect(0, 0, canvasObj.width, canvasObj.height);
    showBlock();
    showSnake();
    // Handle Movement
    moveBlock();
    // Collision
    score += handleCollision(snakeObj);
    attemptNumObj.innerHTML = attemptNumber;
    bestScoreObj.innerHTML = bestScore;
    scoreObj.innerHTML = score;
    snakeSizeObj.innerHTML = snakeObj.snakeCircles.length;
    // Is Game still on!?
    if (!snakeObj.isAlive()) {
      attemptNumber++;
      snakeObj = new Snake();
      snakeBoostersObj.resetFood();
      blocks.reset();
      if (score > bestScore) {
        bestScore = score;
      }
      score = 0;
    }
    let image = ctx.getImageData(0, 0, canvasObj.width, canvasObj.height);
    let aiFrame = [];
    for (let i = 0; i < image.data.length; i += 4) {
      const r = image.data[i];
      const g = image.data[i + 1];
      const b = image.data[i + 2];

      const gray = rgbToGrayscaleWeighted(r, g, b);

      // Set grayscale value to R, G, and B channels
      image.data[i] = gray; // Red
      image.data[i + 1] = gray; // Green
      image.data[i + 2] = gray; // Blue
      aiFrame.push(gray);
      // Alpha channel remains unchanged
    }
    ctx2.putImageData(image, 0, 0);
    // something related to canvas
    requestAnimationFrame(draw);
  };

  draw();
}
