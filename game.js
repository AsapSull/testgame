const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

let bird = { x: 50, y: 200, velocity: 0 };
let gravity = 0.5;
let pipes = [];
let score = 0;

document.addEventListener("keydown", () => {
  bird.velocity = -8;
});

function spawnPipe() {
  let height = Math.random() * 300 + 50;
  pipes.push({ x: 400, y: height });
}

setInterval(spawnPipe, 2000);

function update() {
  bird.velocity += gravity;
  bird.y += bird.velocity;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillRect(bird.x, bird.y, 20, 20);

  pipes.forEach(pipe => {
    pipe.x -= 2;

    ctx.fillRect(pipe.x, 0, 40, pipe.y);
    ctx.fillRect(pipe.x, pipe.y + 150, 40, 600);

    if (
      bird.x < pipe.x + 40 &&
      bird.x + 20 > pipe.x &&
      (bird.y < pipe.y || bird.y + 20 > pipe.y + 150)
    ) {
      alert("Game Over! Score: " + score);
      document.location.reload();
    }

    if (pipe.x === 50) score++;
  });

  requestAnimationFrame(update);
}

update();
