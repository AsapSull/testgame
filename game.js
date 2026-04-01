const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const finalScoreEl = document.getElementById("finalScore");

const startOverlay = document.getElementById("startOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const GROUND_HEIGHT = 90;

const bird = {
  x: 95,
  y: 220,
  width: 34,
  height: 26,
  velocity: 0,
  gravity: 0.42,
  flapPower: -7.2,
  rotation: 0
};

let pipes = [];
let score = 0;
let bestScore = Number(localStorage.getItem("flappyPoopBest") || 0);
let gameStarted = false;
let gameOver = false;
let pipeTimer = 0;
let animationId = null;

bestScoreEl.textContent = bestScore;

function resetGame() {
  bird.y = 220;
  bird.velocity = 0;
  bird.rotation = 0;
  pipes = [];
  score = 0;
  pipeTimer = 0;
  gameStarted = false;
  gameOver = false;
  scoreEl.textContent = "0";
  finalScoreEl.textContent = "0";
}

function startGame() {
  resetGame();
  startOverlay.classList.remove("visible");
  startOverlay.classList.add("hidden");
  gameOverOverlay.classList.remove("visible");
  gameOverOverlay.classList.add("hidden");
  gameStarted = true;
}

function endGame() {
  gameOver = true;
  gameStarted = false;
  finalScoreEl.textContent = String(score);

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("flappyPoopBest", String(bestScore));
    bestScoreEl.textContent = String(bestScore);
  }

  gameOverOverlay.classList.remove("hidden");
  gameOverOverlay.classList.add("visible");
}

function flap() {
  if (!gameStarted || gameOver) return;
  bird.velocity = bird.flapPower;
}

function spawnPipe() {
  const gap = 155;
  const minTop = 60;
  const maxTop = GAME_HEIGHT - GROUND_HEIGHT - gap - 60;
  const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;

  pipes.push({
    x: GAME_WIDTH + 50,
    width: 68,
    topHeight,
    gap,
    counted: false
  });
}

function update() {
  if (!gameStarted || gameOver) return;

  bird.velocity += bird.gravity;
  bird.y += bird.velocity;
  bird.rotation = Math.max(-0.5, Math.min(1.2, bird.velocity * 0.08));

  pipeTimer += 1;
  if (pipeTimer > 95) {
    spawnPipe();
    pipeTimer = 0;
  }

  for (let i = pipes.length - 1; i >= 0; i--) {
    const pipe = pipes[i];
    pipe.x -= 2.3;

    if (!pipe.counted && pipe.x + pipe.width < bird.x) {
      pipe.counted = true;
      score += 1;
      scoreEl.textContent = String(score);
    }

    const hitsPipe =
      bird.x + bird.width > pipe.x &&
      bird.x < pipe.x + pipe.width &&
      (bird.y < pipe.topHeight ||
        bird.y + bird.height > pipe.topHeight + pipe.gap);

    if (hitsPipe) {
      endGame();
    }

    if (pipe.x + pipe.width < -20) {
      pipes.splice(i, 1);
    }
  }

  const hitTop = bird.y <= 0;
  const hitGround = bird.y + bird.height >= GAME_HEIGHT - GROUND_HEIGHT;

  if (hitTop) {
    bird.y = 0;
    bird.velocity = 0;
  }

  if (hitGround) {
    bird.y = GAME_HEIGHT - GROUND_HEIGHT - bird.height;
    endGame();
  }
}

function drawBackground() {
  ctx.fillStyle = "#72d7ff";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(70, 100, 28, 0, Math.PI * 2);
  ctx.arc(95, 100, 22, 0, Math.PI * 2);
  ctx.arc(120, 100, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(300, 150, 24, 0, Math.PI * 2);
  ctx.arc(323, 150, 19, 0, Math.PI * 2);
  ctx.arc(345, 150, 22, 0, Math.PI * 2);
  ctx.fill();
}

function drawGround() {
  ctx.fillStyle = "#cbbd63";
  ctx.fillRect(0, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, GROUND_HEIGHT);

  ctx.fillStyle = "#a89b48";
  for (let i = 0; i < GAME_WIDTH; i += 22) {
    ctx.fillRect(i, GAME_HEIGHT - GROUND_HEIGHT + 14, 12, 8);
  }

  ctx.fillStyle = "#8f7d33";
  ctx.fillRect(0, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, 12);
}

function drawPipes() {
  pipes.forEach(pipe => {
    const bottomY = pipe.topHeight + pipe.gap;

    ctx.fillStyle = "#4cb648";
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
    ctx.fillRect(pipe.x, bottomY, pipe.width, GAME_HEIGHT - bottomY - GROUND_HEIGHT);

    ctx.fillStyle = "#3f973d";
    ctx.fillRect(pipe.x - 4, pipe.topHeight - 18, pipe.width + 8, 18);
    ctx.fillRect(pipe.x - 4, bottomY, pipe.width + 8, 18);
  });
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.rotate(bird.rotation);

  ctx.fillStyle = "#ffd34d";
  ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);

  ctx.fillStyle = "#ff9d00";
  ctx.fillRect(2, -2, 16, 8);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(8, -8, 10, 10);

  ctx.fillStyle = "#111";
  ctx.fillRect(13, -4, 4, 4);

  ctx.fillStyle = "#ff7a00";
  ctx.fillRect(bird.width / 2 - 2, -2, 10, 6);

  ctx.restore();
}

function drawStartHint() {
  if (!gameStarted && !gameOver) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Press Start", GAME_WIDTH / 2, 260);
  }
}

function draw() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  drawBackground();
  drawPipes();
  drawGround();
  drawBird();
  drawStartHint();
}

function loop() {
  update();
  draw();
  animationId = requestAnimationFrame(loop);
}

function userAction() {
  if (gameOver) return;
  if (!gameStarted) return;
  flap();
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    userAction();
  }
});

canvas.addEventListener("pointerdown", userAction);
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

resetGame();
draw();
loop();
