const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");
const enemiesEl = document.getElementById("enemies");
const overlay = document.getElementById("overlay");
const startButton = document.getElementById("startButton");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const TILE = 32;
const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const keys = new Set();
const touchActions = new Set();

let lastTime = 0;
let game;

function createGame() {
  return {
    running: false,
    paused: false,
    gameOver: false,
    wonLevel: false,
    score: 0,
    level: 1,
    lives: 3,
    spawnTimer: 0,
    player: createPlayer(),
    enemies: [],
    enemyQueue: 6,
    bullets: [],
    particles: [],
    walls: createWalls(),
    base: {
      x: WIDTH / 2 - TILE,
      y: HEIGHT - TILE * 1.8,
      w: TILE * 2,
      h: TILE * 1.2,
      alive: true,
    },
  };
}

function createPlayer() {
  return {
    x: WIDTH / 2 - 16,
    y: HEIGHT - TILE * 3,
    w: 30,
    h: 30,
    dir: "up",
    speed: 170,
    reload: 0,
    invincible: 1.6,
  };
}

function createWalls() {
  const walls = [];

  for (let x = 0; x < WIDTH; x += TILE) {
    walls.push(createWall(x, 0, "steel"));
    walls.push(createWall(x, HEIGHT - TILE, "steel"));
  }

  for (let y = TILE; y < HEIGHT - TILE; y += TILE) {
    walls.push(createWall(0, y, "steel"));
    walls.push(createWall(WIDTH - TILE, y, "steel"));
  }

  const brickBlocks = [
    [3, 3], [4, 3], [7, 3], [8, 3], [17, 3], [18, 3], [21, 3], [22, 3],
    [3, 4], [8, 4], [12, 4], [13, 4], [17, 4], [22, 4],
    [5, 7], [6, 7], [10, 7], [15, 7], [19, 7], [20, 7],
    [5, 8], [10, 8], [11, 8], [14, 8], [15, 8], [20, 8],
    [2, 11], [3, 11], [8, 11], [9, 11], [16, 11], [17, 11], [22, 11], [23, 11],
    [6, 14], [7, 14], [11, 14], [14, 14], [18, 14], [19, 14],
    [10, 16], [11, 16], [14, 16], [15, 16],
    [11, 17], [14, 17],
  ];

  const steelBlocks = [
    [12, 8], [13, 8], [12, 9], [13, 9],
    [6, 5], [19, 5], [6, 12], [19, 12],
  ];

  brickBlocks.forEach(([x, y]) => walls.push(createWall(x * TILE, y * TILE, "brick")));
  steelBlocks.forEach(([x, y]) => walls.push(createWall(x * TILE, y * TILE, "steel")));

  return walls;
}

function createWall(x, y, type) {
  return {
    x,
    y,
    w: TILE,
    h: TILE,
    type,
    hp: type === "brick" ? 2 : Infinity,
  };
}

function startGame() {
  game = createGame();
  game.running = true;
  overlay.classList.add("hidden");
  updateHud();
}

function showOverlay(title, message, buttonText = "重新开始") {
  overlay.querySelector("h2").textContent = title;
  overlay.querySelector("p").textContent = message;
  startButton.textContent = buttonText;
  overlay.classList.remove("hidden");
}

function update(time = 0) {
  const delta = Math.min((time - lastTime) / 1000 || 0, 0.033);
  lastTime = time;

  if (game?.running && !game.paused && !game.gameOver) {
    updatePlayer(delta);
    updateEnemies(delta);
    updateBullets(delta);
    updateParticles(delta);
    spawnEnemies(delta);
    checkLevelEnd();
    updateHud();
  }

  draw();
  requestAnimationFrame(update);
}

function updatePlayer(delta) {
  const player = game.player;
  player.reload = Math.max(0, player.reload - delta);
  player.invincible = Math.max(0, player.invincible - delta);

  const direction = readMoveDirection();
  if (direction) {
    player.dir = direction;
    moveTank(player, direction, player.speed * delta);
  }

  if ((keys.has(" ") || touchActions.has("fire")) && player.reload <= 0) {
    fireBullet(player, "player");
    player.reload = 0.32;
  }
}

function readMoveDirection() {
  if (keys.has("arrowup") || keys.has("w") || touchActions.has("up")) return "up";
  if (keys.has("arrowdown") || keys.has("s") || touchActions.has("down")) return "down";
  if (keys.has("arrowleft") || keys.has("a") || touchActions.has("left")) return "left";
  if (keys.has("arrowright") || keys.has("d") || touchActions.has("right")) return "right";
  return null;
}

function moveTank(tank, direction, distance) {
  const vector = DIRECTIONS[direction];
  const next = { ...tank, x: tank.x + vector.x * distance, y: tank.y + vector.y * distance };
  const blockers = [...game.walls, game.base, ...game.enemies.filter((enemy) => enemy !== tank)];

  if (tank !== game.player) {
    blockers.push(game.player);
  }

  if (!isBlocked(next, blockers)) {
    tank.x = next.x;
    tank.y = next.y;
    return true;
  }

  return false;
}

function isBlocked(rect, blockers) {
  if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > WIDTH || rect.y + rect.h > HEIGHT) {
    return true;
  }

  return blockers.some((blocker) => blocker.alive !== false && overlaps(rect, blocker));
}

function updateEnemies(delta) {
  for (const enemy of game.enemies) {
    enemy.reload = Math.max(0, enemy.reload - delta);
    enemy.turnTimer -= delta;

    if (enemy.turnTimer <= 0) {
      enemy.dir = pickEnemyDirection(enemy);
      enemy.turnTimer = 0.5 + Math.random() * 1.4;
    }

    const moved = moveTank(enemy, enemy.dir, enemy.speed * delta);
    if (!moved) {
      enemy.dir = pickEnemyDirection(enemy);
      enemy.turnTimer = 0.25;
    }

    const alignedWithPlayer =
      Math.abs(center(enemy).x - center(game.player).x) < 18 ||
      Math.abs(center(enemy).y - center(game.player).y) < 18;

    if (enemy.reload <= 0 && (alignedWithPlayer || Math.random() < 0.012)) {
      fireBullet(enemy, "enemy");
      enemy.reload = 0.85 + Math.random() * 0.5;
    }
  }
}

function pickEnemyDirection(enemy) {
  const playerCenter = center(game.player);
  const enemyCenter = center(enemy);

  if (Math.random() < 0.55) {
    if (Math.abs(playerCenter.x - enemyCenter.x) > Math.abs(playerCenter.y - enemyCenter.y)) {
      return playerCenter.x > enemyCenter.x ? "right" : "left";
    }
    return playerCenter.y > enemyCenter.y ? "down" : "up";
  }

  const dirs = Object.keys(DIRECTIONS);
  return dirs[Math.floor(Math.random() * dirs.length)];
}

function spawnEnemies(delta) {
  if (game.enemyQueue <= 0 || game.enemies.length >= Math.min(5, 2 + game.level)) {
    return;
  }

  game.spawnTimer -= delta;
  if (game.spawnTimer > 0) {
    return;
  }

  const spawnPoints = [
    { x: TILE * 2, y: TILE * 1.5 },
    { x: WIDTH / 2 - 15, y: TILE * 1.5 },
    { x: WIDTH - TILE * 3, y: TILE * 1.5 },
  ];

  const point = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  const enemy = {
    x: point.x,
    y: point.y,
    w: 30,
    h: 30,
    dir: "down",
    speed: 80 + game.level * 10,
    reload: 0.8,
    turnTimer: 0.5,
  };

  if (!isBlocked(enemy, [...game.walls, game.base, ...game.enemies, game.player])) {
    game.enemies.push(enemy);
    game.enemyQueue -= 1;
  }

  game.spawnTimer = 1.15;
}

function fireBullet(tank, owner) {
  const vector = DIRECTIONS[tank.dir];
  const origin = center(tank);

  game.bullets.push({
    x: origin.x + vector.x * 18 - 4,
    y: origin.y + vector.y * 18 - 4,
    w: 8,
    h: 8,
    dir: tank.dir,
    owner,
    speed: owner === "player" ? 430 : 330,
  });
}

function updateBullets(delta) {
  for (const bullet of game.bullets) {
    const vector = DIRECTIONS[bullet.dir];
    bullet.x += vector.x * bullet.speed * delta;
    bullet.y += vector.y * bullet.speed * delta;
  }

  for (const bullet of [...game.bullets]) {
    if (bullet.x < -12 || bullet.y < -12 || bullet.x > WIDTH + 12 || bullet.y > HEIGHT + 12) {
      removeBullet(bullet);
      continue;
    }

    const wall = game.walls.find((item) => overlaps(bullet, item));
    if (wall) {
      hitWall(wall);
      addSparks(center(bullet).x, center(bullet).y, wall.type === "steel" ? "#93c5fd" : "#f97316");
      removeBullet(bullet);
      continue;
    }

    if (game.base.alive && overlaps(bullet, game.base)) {
      game.base.alive = false;
      endGame(false);
      removeBullet(bullet);
      continue;
    }

    if (bullet.owner === "player") {
      const enemy = game.enemies.find((item) => overlaps(bullet, item));
      if (enemy) {
        destroyEnemy(enemy);
        removeBullet(bullet);
      }
    } else if (game.player.invincible <= 0 && overlaps(bullet, game.player)) {
      hitPlayer();
      removeBullet(bullet);
    }
  }
}

function hitWall(wall) {
  if (wall.type === "steel") {
    return;
  }

  wall.hp -= 1;
  if (wall.hp <= 0) {
    game.walls = game.walls.filter((item) => item !== wall);
  }
}

function destroyEnemy(enemy) {
  game.enemies = game.enemies.filter((item) => item !== enemy);
  game.score += 100;
  addExplosion(center(enemy).x, center(enemy).y, "#f97316");
}

function hitPlayer() {
  game.lives -= 1;
  addExplosion(center(game.player).x, center(game.player).y, "#67e8a5");

  if (game.lives <= 0) {
    endGame(false);
    return;
  }

  game.player = createPlayer();
}

function removeBullet(bullet) {
  game.bullets = game.bullets.filter((item) => item !== bullet);
}

function checkLevelEnd() {
  if (game.enemyQueue > 0 || game.enemies.length > 0 || game.wonLevel) {
    return;
  }

  game.wonLevel = true;
  game.level += 1;
  game.enemyQueue = 5 + game.level * 2;
  game.spawnTimer = 1.4;
  game.player.invincible = 1.8;
  addSparks(WIDTH / 2, HEIGHT / 2, "#facc15", 36);
  setTimeout(() => {
    if (game?.running && !game.gameOver) {
      game.wonLevel = false;
    }
  }, 1200);
}

function endGame(victory) {
  game.gameOver = true;
  game.running = false;
  showOverlay(
    victory ? "胜利！" : "游戏结束",
    victory ? `最终得分：${game.score}` : `基地失守或生命耗尽，最终得分：${game.score}`,
  );
}

function updateParticles(delta) {
  game.particles = game.particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * delta,
      y: particle.y + particle.vy * delta,
      life: particle.life - delta,
    }))
    .filter((particle) => particle.life > 0);
}

function addExplosion(x, y, color) {
  addSparks(x, y, color, 26, 150);
}

function addSparks(x, y, color, amount = 14, speed = 95) {
  for (let index = 0; index < amount; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * (0.35 + Math.random());
    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      color,
      size: 2 + Math.random() * 3,
      life: 0.25 + Math.random() * 0.45,
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBackground();

  if (!game) {
    return;
  }

  game.walls.forEach(drawWall);
  drawBase();
  game.bullets.forEach(drawBullet);
  drawTank(game.player, "#67e8a5", "#14532d");
  game.enemies.forEach((enemy) => drawTank(enemy, "#fb7185", "#7f1d1d"));
  game.particles.forEach(drawParticle);

  if (game.paused && game.running) {
    drawCenterText("已暂停", "按 P 继续");
  } else if (game.wonLevel) {
    drawCenterText(`第 ${game.level - 1} 关完成`, "下一波敌军来袭");
  }
}

function drawBackground() {
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= WIDTH; x += TILE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= HEIGHT; y += TILE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
}

function drawWall(wall) {
  if (wall.type === "steel") {
    ctx.fillStyle = "#64748b";
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(wall.x + 4, wall.y + 4, wall.w - 8, 5);
    ctx.fillRect(wall.x + 4, wall.y + wall.h - 9, wall.w - 8, 5);
    return;
  }

  ctx.fillStyle = wall.hp === 2 ? "#b45309" : "#92400e";
  ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(wall.x, wall.y + wall.h / 2);
  ctx.lineTo(wall.x + wall.w, wall.y + wall.h / 2);
  ctx.moveTo(wall.x + wall.w / 2, wall.y);
  ctx.lineTo(wall.x + wall.w / 2, wall.y + wall.h);
  ctx.stroke();
}

function drawBase() {
  const base = game.base;
  ctx.fillStyle = base.alive ? "#facc15" : "#52525b";
  ctx.fillRect(base.x, base.y, base.w, base.h);
  ctx.fillStyle = base.alive ? "#713f12" : "#27272a";
  ctx.fillRect(base.x + 14, base.y + 10, base.w - 28, base.h - 18);
  ctx.fillStyle = base.alive ? "#fde68a" : "#71717a";
  ctx.fillText("BASE", base.x + 14, base.y + 27);
}

function drawTank(tank, color, darkColor) {
  if (tank === game.player && tank.invincible > 0 && Math.floor(tank.invincible * 10) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(tank.x + tank.w / 2, tank.y + tank.h / 2);
  ctx.rotate(rotationFor(tank.dir));

  ctx.fillStyle = darkColor;
  ctx.fillRect(-15, -15, 8, 30);
  ctx.fillRect(7, -15, 8, 30);

  ctx.fillStyle = color;
  roundRect(-12, -12, 24, 24, 5);
  ctx.fill();

  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(-4, -22, 8, 18);
  ctx.fillStyle = darkColor;
  ctx.fillRect(-6, -6, 12, 12);
  ctx.restore();
}

function drawBullet(bullet) {
  ctx.fillStyle = bullet.owner === "player" ? "#fef08a" : "#fecdd3";
  ctx.beginPath();
  ctx.arc(bullet.x + bullet.w / 2, bullet.y + bullet.h / 2, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticle(particle) {
  ctx.globalAlpha = Math.max(0, particle.life * 2);
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawCenterText(title, subtitle) {
  ctx.save();
  ctx.fillStyle = "rgba(2, 6, 23, 0.72)";
  ctx.fillRect(0, HEIGHT / 2 - 58, WIDTH, 116);
  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "center";
  ctx.font = "700 34px system-ui";
  ctx.fillText(title, WIDTH / 2, HEIGHT / 2 - 8);
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "18px system-ui";
  ctx.fillText(subtitle, WIDTH / 2, HEIGHT / 2 + 28);
  ctx.restore();
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function rotationFor(direction) {
  if (direction === "right") return Math.PI / 2;
  if (direction === "down") return Math.PI;
  if (direction === "left") return -Math.PI / 2;
  return 0;
}

function center(rect) {
  return {
    x: rect.x + rect.w / 2,
    y: rect.y + rect.h / 2,
  };
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function updateHud() {
  scoreEl.textContent = game.score;
  livesEl.textContent = game.lives;
  levelEl.textContent = game.level;
  enemiesEl.textContent = game.enemyQueue + game.enemies.length;
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
    keys.add(key);
  }

  if (key === "p" && game?.running) {
    game.paused = !game.paused;
  }

  if (key === "r") {
    startGame();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

document.querySelectorAll("[data-action]").forEach((button) => {
  const action = button.dataset.action;

  const press = (event) => {
    event.preventDefault();
    touchActions.add(action);
  };

  const release = (event) => {
    event.preventDefault();
    touchActions.delete(action);
  };

  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("pointercancel", release);
});

startButton.addEventListener("click", startGame);

game = createGame();
updateHud();
draw();
requestAnimationFrame(update);
