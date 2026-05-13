(function () {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const TILE = 40;
  const COLS = Math.floor(canvas.width / TILE);
  const ROWS = Math.floor(canvas.height / TILE);

  const T_EMPTY = 0;
  const T_BRICK = 1;
  const T_STEEL = 2;
  const T_FLAG = 3;

  const RAW_MAP = [
    "@@@@@@@@@@@@@@@@@@@@",
    "@..................@",
    "@..##......##......@",
    "@..................@",
    "@....@@....@@......@",
    "@..................@",
    "@......@@..@@......@",
    "@..................@",
    "@..@@......@@..@@..@",
    "@..................@",
    "@....@@@@@@@@......@",
    "@....@......@......@",
    "@....@..ff..@......@",
    "@@@@@@@@@@@@@@@@@@@@",
  ];

  function parseMap(rows) {
    const grid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      const line = rows[r] || ".".repeat(COLS);
      for (let c = 0; c < COLS; c++) {
        const ch = line[c] || ".";
        if (ch === "@") row.push(T_STEEL);
        else if (ch === "#") row.push(T_BRICK);
        else if (ch === "f") row.push(T_FLAG);
        else row.push(T_EMPTY);
      }
      grid.push(row);
    }
    return grid;
  }

  let grid = parseMap(RAW_MAP);

  const DIR = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
  };

  const VEC = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  const keys = new Set();
  let paused = false;
  let gameState = "menu";
  let lives = 3;
  let score = 0;
  let enemiesToSpawn = 12;
  let enemiesAlive = 0;
  let spawnTimer = 0;
  const MAX_ENEMIES_ON_FIELD = 4;

  const player = {
    x: 0,
    y: 0,
    dir: DIR.UP,
    speed: 120,
    move: false,
    shootCd: 0,
    dead: false,
  };

  let bullets = [];
  let enemies = [];
  let particles = [];

  const elLives = document.getElementById("lives");
  const elEnemies = document.getElementById("enemies");
  const elScore = document.getElementById("score");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");
  const overlayBtn = document.getElementById("overlayBtn");

  function resetGrid() {
    grid = parseMap(RAW_MAP);
  }

  function tankHitbox(t) {
    const s = 34;
    return { x: t.x - s / 2, y: t.y - s / 2, w: s, h: s };
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function pointInGrid(px, py) {
    const c = Math.floor(px / TILE);
    const r = Math.floor(py / TILE);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return { solid: true, brick: false, flag: false };
    const t = grid[r][c];
    return {
      solid: t === T_BRICK || t === T_STEEL,
      brick: t === T_BRICK,
      flag: t === T_FLAG,
      r,
      c,
    };
  }

  function tankOverlapsSolid(t) {
    const hb = tankHitbox(t);
    const pad = 2;
    const corners = [
      { x: hb.x + pad, y: hb.y + pad },
      { x: hb.x + hb.w - pad, y: hb.y + pad },
      { x: hb.x + pad, y: hb.y + hb.h - pad },
      { x: hb.x + hb.w - pad, y: hb.y + hb.h - pad },
    ];
    for (const p of corners) {
      const cell = pointInGrid(p.x, p.y);
      if (cell.solid || cell.flag) return true;
    }
    for (const e of enemies) {
      if (e.dead) continue;
      if (e === t) continue;
      if (rectsOverlap(hb, tankHitbox(e))) return true;
    }
    if (t !== player && !player.dead && rectsOverlap(hb, tankHitbox(player))) return true;
    return false;
  }

  function tryMoveTank(t, dx, dy, dt) {
    const step = t.speed * dt;
    if (dx !== 0) {
      t.x += dx * step;
      if (tankOverlapsSolid(t)) t.x -= dx * step;
    }
    if (dy !== 0) {
      t.y += dy * step;
      if (tankOverlapsSolid(t)) t.y -= dy * step;
    }
  }

  function spawnPlayer() {
    player.x = TILE * 3 + TILE / 2;
    player.y = (ROWS - 2) * TILE + TILE / 2;
    player.dir = DIR.UP;
    player.dead = false;
    player.shootCd = 0.4;
  }

  function spawnEnemy() {
    if (enemiesToSpawn <= 0 || enemiesAlive >= MAX_ENEMIES_ON_FIELD) return;
    const lanes = [2, 4, 6, 8, 10, 12, 14, 16].map((c) => c * TILE + TILE / 2);
    const x = lanes[Math.floor(Math.random() * lanes.length)];
    const y = TILE + TILE / 2;
    const e = {
      x,
      y,
      dir: DIR.DOWN,
      speed: 70 + Math.random() * 25,
      shootCd: 1 + Math.random() * 2,
      aiTimer: 0,
      dead: false,
    };
    const hb = tankHitbox(e);
    let blocked = false;
    for (const o of enemies) {
      if (!o.dead && rectsOverlap(hb, tankHitbox(o))) blocked = true;
    }
    if (blocked) return;
    enemies.push(e);
    enemiesToSpawn--;
    enemiesAlive++;
  }

  function fireBullet(owner, isPlayer) {
    const v = VEC[owner.dir];
    const off = 22;
    bullets.push({
      x: owner.x + v.x * off,
      y: owner.y + v.y * off,
      vx: v.x * 280,
      vy: v.y * 280,
      isPlayer,
      r: 4,
    });
  }

  function explode(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 120;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.35 + Math.random() * 0.2,
        max: 0.5,
        color: color || "#ff9f45",
      });
    }
  }

  function damageTile(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    const t = grid[r][c];
    if (t === T_BRICK) grid[r][c] = T_EMPTY;
  }

  function bulletHitWall(b) {
    const ir = Math.floor(b.y / TILE);
    const ic = Math.floor(b.x / TILE);
    if (ir < 0 || ir >= ROWS || ic < 0 || ic >= COLS) return true;
    const t = grid[ir][ic];
    if (t === T_STEEL) return true;
    if (t === T_BRICK) {
      damageTile(ir, ic);
      return true;
    }
    if (t === T_FLAG) {
      gameOver(false);
      return true;
    }
    return false;
  }

  function killEnemy(e) {
    if (e.dead) return;
    e.dead = true;
    enemiesAlive--;
    score += 100;
    explode(e.x, e.y, "#4ecca3");
  }

  function killPlayer() {
    if (player.dead) return;
    player.dead = true;
    explode(player.x, player.y, "#ffd369");
    lives--;
    if (lives <= 0) {
      setTimeout(() => gameOver(false), 400);
    } else {
      setTimeout(() => {
        resetGrid();
        bullets = [];
        spawnPlayer();
      }, 900);
    }
  }

  function gameOver(win) {
    if (gameState !== "playing") return;
    gameState = win ? "win" : "lose";
    overlayTitle.textContent = win ? "胜利！" : "游戏结束";
    overlayText.textContent = win
      ? "你击毁了所有敌军并守住了基地。"
      : lives <= 0
        ? "生命耗尽。"
        : "基地被摧毁。";
    overlayBtn.textContent = "再来一局";
    overlay.classList.add("visible");
  }

  function checkWin() {
    if (enemiesToSpawn <= 0 && enemiesAlive <= 0 && gameState === "playing") {
      gameOver(true);
    }
  }

  function updatePlayer(dt) {
    if (player.dead) return;
    player.shootCd -= dt;
    let dx = 0;
    let dy = 0;
    if (keys.has("w") || keys.has("arrowup")) {
      dy = -1;
      player.dir = DIR.UP;
    } else if (keys.has("s") || keys.has("arrowdown")) {
      dy = 1;
      player.dir = DIR.DOWN;
    } else if (keys.has("a") || keys.has("arrowleft")) {
      dx = -1;
      player.dir = DIR.LEFT;
    } else if (keys.has("d") || keys.has("arrowright")) {
      dx = 1;
      player.dir = DIR.RIGHT;
    }
    if (dx !== 0 || dy !== 0) tryMoveTank(player, dx, dy, dt);
    if ((keys.has(" ") || keys.has("space")) && player.shootCd <= 0) {
      fireBullet(player, true);
      player.shootCd = 0.45;
    }
  }

  function updateEnemy(e, dt) {
    if (e.dead) return;
    e.shootCd -= dt;
    e.aiTimer -= dt;
    if (e.aiTimer <= 0) {
      e.aiTimer = 0.25 + Math.random() * 0.5;
      const r = Math.random();
      if (r < 0.35) {
        const ax = player.x - e.x;
        const ay = player.y - e.y;
        if (Math.abs(ax) > Math.abs(ay)) e.dir = ax > 0 ? DIR.RIGHT : DIR.LEFT;
        else e.dir = ay > 0 ? DIR.DOWN : DIR.UP;
      } else if (r < 0.55) {
        e.dir = Math.floor(Math.random() * 4);
      }
    }
    const v = VEC[e.dir];
    tryMoveTank(e, v.x, v.y, dt);
    const aligned =
      (e.dir === DIR.UP || e.dir === DIR.DOWN) && Math.abs(e.x - player.x) < 14;
    const aligned2 =
      (e.dir === DIR.LEFT || e.dir === DIR.RIGHT) && Math.abs(e.y - player.y) < 14;
    if (e.shootCd <= 0 && (aligned || aligned2) && Math.random() < 0.02) {
      fireBullet(e, false);
      e.shootCd = 1.2 + Math.random();
    }
  }

  function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
        bullets.splice(i, 1);
        continue;
      }
      if (bulletHitWall(b)) {
        bullets.splice(i, 1);
        continue;
      }
      const br = { x: b.x - b.r, y: b.y - b.r, w: b.r * 2, h: b.r * 2 };
      if (b.isPlayer) {
        for (const e of enemies) {
          if (e.dead) continue;
          if (rectsOverlap(br, tankHitbox(e))) {
            killEnemy(e);
            bullets.splice(i, 1);
            break;
          }
        }
      } else if (!player.dead && rectsOverlap(br, tankHitbox(player))) {
        bullets.splice(i, 1);
        killPlayer();
        continue;
      }
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function update(dt) {
    if (gameState !== "playing" || paused) return;
    spawnTimer -= dt;
    if (spawnTimer <= 0 && enemiesToSpawn > 0) {
      spawnEnemy();
      spawnTimer = 1.8;
    }
    updatePlayer(dt);
    for (const e of enemies) updateEnemy(e, dt);
    updateBullets(dt);
    updateParticles(dt);
    checkWin();
    elLives.textContent = String(Math.max(0, lives));
    elEnemies.textContent = String(enemiesToSpawn + enemiesAlive);
    elScore.textContent = String(score);
  }

  function drawMap() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * TILE;
        const y = r * TILE;
        const t = grid[r][c];
        if (t === T_BRICK) {
          ctx.fillStyle = "#c45c26";
          ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
          ctx.strokeStyle = "#8b3a12";
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 4, y + 4, TILE / 2 - 6, TILE / 2 - 6);
          ctx.strokeRect(x + TILE / 2 + 2, y + 4, TILE / 2 - 6, TILE / 2 - 6);
          ctx.strokeRect(x + 4, y + TILE / 2 + 2, TILE / 2 - 6, TILE / 2 - 6);
          ctx.strokeRect(x + TILE / 2 + 2, y + TILE / 2 + 2, TILE / 2 - 6, TILE / 2 - 6);
        } else if (t === T_STEEL) {
          ctx.fillStyle = "#6b7c8c";
          ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
          ctx.fillStyle = "#4a5568";
          ctx.fillRect(x + 6, y + 6, TILE - 12, TILE - 12);
        } else if (t === T_FLAG) {
          ctx.fillStyle = "#222";
          ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
          ctx.fillStyle = "#e63946";
          ctx.beginPath();
          ctx.moveTo(x + TILE / 2, y + 6);
          ctx.lineTo(x + TILE - 8, y + TILE / 2 - 2);
          ctx.lineTo(x + TILE / 2, y + TILE / 2 + 4);
          ctx.lineTo(x + 8, y + TILE / 2 - 2);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }

  function drawTank(t, color, dark) {
    if (t.dead) return;
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate((t.dir * Math.PI) / 2);
    ctx.fillStyle = dark;
    ctx.fillRect(-18, -18, 36, 36);
    ctx.fillStyle = color;
    ctx.fillRect(-14, -14, 28, 28);
    ctx.fillStyle = dark;
    ctx.fillRect(-6, -20, 12, 10);
    ctx.fillStyle = "#333";
    ctx.fillRect(-4, -22, 8, 6);
    ctx.restore();
  }

  function draw() {
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMap();
    if (!player.dead) drawTank(player, "#4ecca3", "#1e5c45");
    for (const e of enemies) drawTank(e, "#e85d75", "#7d2940");
    for (const b of bullets) {
      ctx.fillStyle = b.isPlayer ? "#ffe066" : "#ff6b6b";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      ctx.globalAlpha = 1;
    }
    if (paused && gameState === "playing") {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("暂停", canvas.width / 2, canvas.height / 2);
      ctx.textAlign = "start";
    }
  }

  function startGame() {
    overlay.classList.remove("visible");
    resetGrid();
    bullets = [];
    enemies = [];
    particles = [];
    lives = 3;
    score = 0;
    enemiesToSpawn = 12;
    enemiesAlive = 0;
    spawnTimer = 0.5;
    gameState = "playing";
    paused = false;
    spawnPlayer();
    elLives.textContent = "3";
    elEnemies.textContent = String(enemiesToSpawn);
    elScore.textContent = "0";
  }

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    keys.add(k);
    if (k === "p") {
      paused = !paused;
      e.preventDefault();
    }
  });
  window.addEventListener("keyup", (e) => {
    keys.delete(e.key.toLowerCase());
  });

  overlayBtn.addEventListener("click", () => {
    if (gameState === "menu" || gameState === "win" || gameState === "lose") startGame();
  });

  overlayTitle.textContent = "坦克大战";
  overlayText.textContent = "保卫基地，消灭 12 辆敌军坦克。";
  overlayBtn.textContent = "开始游戏";
  overlay.classList.add("visible");

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
