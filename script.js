const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let keys = {};
let bullets = [];
let enemies = [];
let powerUps = [];
let achievements = [];
let score = 0;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let lives = 3;
let level = 1;
let isPaused = false;
let gameRunning = false;

document.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Escape") togglePause();
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

canvas.addEventListener("click", () => {
  if (!gameRunning) startGame();
});

function startGame() {
  document.getElementById("mainMenu").style.display = "none";
  gameRunning = true;
  lives = 3;
  score = 0;
  level = 1;
  bullets = [];
  enemies = [];
  powerUps = [];
  achievements = [];
  spawnPlayer();
  requestAnimationFrame(gameLoop);
}

function togglePause() {
  if (!gameRunning) return;
  isPaused = !isPaused;
  document.getElementById("pauseMenu").style.display = isPaused ? "block" : "none";
  if (!isPaused) requestAnimationFrame(gameLoop);
}
const player = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  width: 40,
  height: 20,
  speed: 5,
  shootCooldown: 0,
};

function spawnPlayer() {
  player.x = canvas.width / 2;
  player.y = canvas.height - 60;
  player.shootCooldown = 0;
}

function shoot() {
  if (player.shootCooldown <= 0) {
    bullets.push({ x: player.x + player.width / 2 - 2, y: player.y, width: 4, height: 10 });
    player.shootCooldown = 10;
  }
}

function spawnEnemy() {
  const size = 30 + Math.random() * 20;
  enemies.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size,
    speed: 1 + level * 0.2,
  });
}

function spawnPowerUp() {
  powerUps.push({
    x: Math.random() * (canvas.width - 20),
    y: -20,
    width: 20,
    height: 20,
    speed: 2,
    type: "triple",
  });
}
function resumeGame() {
  isPaused = false;
  document.getElementById("pauseMenu").style.display = "none";
  requestAnimationFrame(gameLoop);
}
function gameLoop() {
  if (isPaused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Handle player movement
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += player.speed;

  // Shoot bullets
  if (keys["Space"]) shoot();
  player.shootCooldown--;

  // Spawn new enemies
  if (Math.random() < 0.03) spawnEnemy();

  // Spawn new power-ups
  if (Math.random() < 0.01) spawnPowerUp();

  // Move and draw bullets
  bullets.forEach((bullet, index) => {
    bullet.y -= 5;
    if (bullet.y < 0) bullets.splice(index, 1);
    else {
      ctx.fillStyle = "white";
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
  });

  // Move and draw enemies
  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed + level * 0.1;
    if (enemy.y > canvas.height) enemies.splice(index, 1);
    else {
      ctx.fillStyle = "red";
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }

    // Check for collisions with player
    if (checkCollision(player, enemy)) {
      lives--;
      enemies.splice(index, 1);
      if (lives <= 0) {
        endGame();
      }
    }
  });

  // Move and draw power-ups
  powerUps.forEach((powerUp, index) => {
    powerUp.y += powerUp.speed;
    if (powerUp.y > canvas.height) powerUps.splice(index, 1);
    else {
      ctx.fillStyle = "blue";
      ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    }

    // Check for collisions with player
    if (checkCollision(player, powerUp)) {
      powerUps.splice(index, 1);
      // Grant a power-up effect (e.g., triple shot)
      if (powerUp.type === "triple") {
        achievements.push("Triple Shot!");
      }
    }
  });

  // Update score, level, and render UI
  updateDifficulty();
  renderUI();

  // Continue the game loop
  requestAnimationFrame(gameLoop);
}

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function updateDifficulty() {
  if (score >= level * 1000) {
    level++;
  }
}

function renderUI() {
  // Draw score and lives
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Lives: ${lives}`, 10, 40);
  ctx.fillText(`Level: ${level}`, canvas.width - 100, 20);

  // Draw achievements
  if (achievements.length > 0) {
    ctx.fillText(`Achievements: ${achievements.join(", ")}`, 10, canvas.height - 20);
  }
}

function endGame() {
  gameRunning = false;
  if (score > highScore) {
    localStorage.setItem("highScore", score);
  }
  alert(`Game Over! Your Score: ${score}`);
  document.getElementById("mainMenu").style.display = "block";
}
