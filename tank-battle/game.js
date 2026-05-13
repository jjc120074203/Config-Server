// ============================================================
//  Tank Battle - Classic Arcade Game
// ============================================================

const TILE = 32;
const COLS = 20;
const ROWS = 18;
const W = COLS * TILE;
const H = ROWS * TILE;

// Tile types
const T = {
  EMPTY: 0,
  BRICK: 1,
  STEEL: 2,
  WATER: 3,
  TREE: 4,
  BASE: 5,
};

const DIR = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
};

const DIR_VEC = [
  [0, -1], // UP
  [1, 0],  // RIGHT
  [0, 1],  // DOWN
  [-1, 0], // LEFT
];

// ============================================================
//  Level Maps
// ============================================================
const LEVELS = [
  // Level 1
  [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0],
    [0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0],
    [0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0],
    [0,0,1,1,0,0,1,1,1,1,1,1,1,1,0,0,1,1,0,0],
    [0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,0,0,1,1,0,0,1,1,1,1,0,0,1,1,0,0,1,1],
    [0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0],
    [0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0],
    [0,0,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0],
    [0,0,1,1,0,0,0,0,1,0,0,1,0,0,0,0,1,1,0,0],
    [0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0],
  ],
  // Level 2
  [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,2,0,0,1,1,1,1,0,0,2,0,1,1,0,0],
    [0,0,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,2,0,0,1,1,0,0,0,0,1,1,0,0,2,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,2,0,0,1,1,0,0,0,0,1,1,0,0,2,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0],
    [0,0,1,1,0,2,0,0,1,1,1,1,0,0,2,0,1,1,0,0],
    [0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0],
  ],
  // Level 3
  [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,2,0,1,1,0,0,0,4,4,0,0,0,1,1,0,2,0,0],
    [0,0,0,0,1,1,0,3,0,4,4,0,3,0,1,1,0,0,0,0],
    [0,0,1,1,0,0,0,3,0,0,0,0,3,0,0,0,1,1,0,0],
    [0,0,1,1,0,0,2,0,0,1,1,0,0,2,0,0,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
    [0,3,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,3,0],
    [0,3,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,3,0],
    [0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,2,0,0,0,0,0,0,2,0,0,1,1,0,0],
    [0,0,1,1,0,0,0,3,0,0,0,0,3,0,0,0,1,1,0,0],
    [0,0,0,0,1,1,0,3,0,4,4,0,3,0,1,1,0,0,0,0],
    [0,0,2,0,1,1,0,0,0,4,4,0,0,0,1,1,0,2,0,0],
    [0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0],
  ],
];

// ============================================================
//  Game State
// ============================================================
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    this.keys = {};
    this.state = 'start'; // start | playing | over | win
    this.level = 0;
    this.score = 0;
    this.lives = 3;
    this.map = [];
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.powerups = [];
    this.spawnTimer = 0;
    this.spawnCount = 0;
    this.maxEnemies = 4;
    this.totalEnemies = 8;
    this.baseAlive = true;
    this.shieldTimer = 0;
    this.freezeTimer = 0;
    this.lastTime = 0;
    this.enemySpawnPoints = [
      [0, 0],
      [COLS - 2, 0],
      [Math.floor(COLS / 2) - 1, 0],
    ];
    this.spawnPointIndex = 0;

    this._bindInput();
  }

  _bindInput() {
    window.addEventListener('keydown', e => {
      this.keys[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', e => {
      this.keys[e.key] = false;
    });
  }

  start() {
    this.state = 'playing';
    this.score = 0;
    this.lives = 3;
    this.level = 0;
    this._loadLevel();
    this.lastTime = performance.now();
    requestAnimationFrame(t => this._loop(t));
  }

  _loadLevel() {
    const src = LEVELS[this.level % LEVELS.length];
    this.map = src.map(row => [...row]);
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.powerups = [];
    this.spawnTimer = 0;
    this.spawnCount = 0;
    this.totalEnemies = 8 + this.level * 2;
    this.maxEnemies = 4 + Math.floor(this.level / 2);
    this.baseAlive = true;
    this.shieldTimer = 0;
    this.freezeTimer = 0;
    this.spawnPointIndex = 0;

    this.player = new Tank(9 * TILE, 16 * TILE, DIR.UP, true, this);
    this.player.speed = 2;

    this._updateUI();
  }

  _updateUI() {
    document.getElementById('scoreVal').textContent = this.score;
    document.getElementById('levelVal').textContent = this.level + 1;

    const livesEl = document.getElementById('livesDisplay');
    livesEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const d = document.createElement('div');
      d.className = 'life-icon' + (i < this.lives ? '' : ' lost');
      livesEl.appendChild(d);
    }

    const enemyEl = document.getElementById('enemyDisplay');
    enemyEl.innerHTML = '';
    const remaining = this.totalEnemies - this.spawnCount + this.enemies.length;
    for (let i = 0; i < remaining; i++) {
      const d = document.createElement('div');
      d.className = 'enemy-dot alive';
      enemyEl.appendChild(d);
    }
  }

  _loop(time) {
    if (this.state !== 'playing') return;
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;

    this._update(dt);
    this._render();
    this._updateUI();

    requestAnimationFrame(t => this._loop(t));
  }

  _update(dt) {
    // Player input
    if (this.player && this.player.alive) {
      let moved = false;
      if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
        this.player.dir = DIR.UP; moved = true;
      } else if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
        this.player.dir = DIR.DOWN; moved = true;
      } else if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
        this.player.dir = DIR.LEFT; moved = true;
      } else if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
        this.player.dir = DIR.RIGHT; moved = true;
      }
      if (moved) this.player.move();
      if (this.keys[' '] || this.keys['j'] || this.keys['J']) {
        this.player.shoot();
      }
    }

    // Shield timer
    if (this.shieldTimer > 0) this.shieldTimer -= dt;

    // Freeze timer
    if (this.freezeTimer > 0) this.freezeTimer -= dt;

    // Enemy spawning
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.enemies.length < this.maxEnemies && this.spawnCount < this.totalEnemies) {
      this._spawnEnemy();
      this.spawnTimer = 2;
    }

    // Enemy AI
    if (this.freezeTimer <= 0) {
      for (const e of this.enemies) {
        e.ai(dt);
      }
    }

    // Bullets
    for (const b of this.bullets) {
      b.update();
    }
    this.bullets = this.bullets.filter(b => b.alive);

    // Bullet collision
    this._checkBulletCollisions();

    // Particles
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);

    // Powerups
    for (const pu of this.powerups) {
      pu.timer -= dt;
      if (this.player && this.player.alive) {
        const dx = (this.player.x + TILE) - (pu.x + TILE / 2);
        const dy = (this.player.y + TILE) - (pu.y + TILE / 2);
        if (Math.abs(dx) < TILE * 1.2 && Math.abs(dy) < TILE * 1.2) {
          this._applyPowerup(pu);
          pu.timer = -1;
        }
      }
    }
    this.powerups = this.powerups.filter(p => p.timer > 0);

    // Check win/lose
    if (!this.baseAlive) {
      this._gameOver();
    } else if (this.spawnCount >= this.totalEnemies && this.enemies.length === 0) {
      this.level++;
      if (this.level >= LEVELS.length * 3) {
        this._gameWin();
      } else {
        this._loadLevel();
      }
    }
  }

  _spawnEnemy() {
    const pt = this.enemySpawnPoints[this.spawnPointIndex % this.enemySpawnPoints.length];
    this.spawnPointIndex++;
    const e = new Tank(pt[0] * TILE, pt[1] * TILE, DIR.DOWN, false, this);

    const tier = Math.min(Math.floor(this.level / 1.5), 3);
    const r = Math.random();
    if (r < 0.15 + tier * 0.05) {
      e.speed = 2.5;
      e.hp = 1;
      e.color = '#ff6b6b';
      e.type = 'fast';
    } else if (r < 0.3 + tier * 0.05) {
      e.speed = 1;
      e.hp = 3;
      e.color = '#ffd93d';
      e.type = 'heavy';
    } else if (r < 0.4 + tier * 0.05) {
      e.speed = 1.5;
      e.hp = 2;
      e.color = '#6bcb77';
      e.type = 'power';
      e.bulletSpeed = 5;
    } else {
      e.speed = 1.5;
      e.hp = 1;
      e.color = '#aaa';
      e.type = 'basic';
    }
    this.enemies.push(e);
    this.spawnCount++;

    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: pt[0] * TILE + TILE,
        y: pt[1] * TILE + TILE,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        life: 0.5,
        color: '#fff',
        size: 3,
      });
    }
  }

  _checkBulletCollisions() {
    for (const b of this.bullets) {
      if (!b.alive) continue;

      // Bullet vs map
      const col = Math.floor(b.x / TILE);
      const row = Math.floor(b.y / TILE);
      if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
        b.alive = false;
        continue;
      }
      const tile = this.map[row]?.[col];
      if (tile === T.BRICK) {
        this.map[row][col] = T.EMPTY;
        b.alive = false;
        this._explode(b.x, b.y, '#c68b59', 6);
        continue;
      }
      if (tile === T.STEEL) {
        b.alive = false;
        this._explode(b.x, b.y, '#888', 4);
        continue;
      }
      if (tile === T.BASE) {
        this.baseAlive = false;
        this.map[row][col] = T.EMPTY;
        b.alive = false;
        this._explode(b.x, b.y, '#e94560', 20);
        continue;
      }

      // Bullet vs tanks
      if (b.isPlayer) {
        for (const e of this.enemies) {
          if (!e.alive) continue;
          if (this._rectOverlap(b.x - 2, b.y - 2, 4, 4, e.x, e.y, TILE * 2, TILE * 2)) {
            b.alive = false;
            e.hp--;
            if (e.hp <= 0) {
              e.alive = false;
              this._explode(e.x + TILE, e.y + TILE, e.color, 15);
              this.score += e.type === 'heavy' ? 200 : e.type === 'power' ? 150 : 100;
              if (Math.random() < 0.15) {
                this._spawnPowerup(e.x + TILE / 2, e.y + TILE / 2);
              }
            } else {
              this._explode(b.x, b.y, '#fff', 4);
            }
          }
        }
        this.enemies = this.enemies.filter(e => e.alive);
      } else {
        if (this.player && this.player.alive) {
          if (this._rectOverlap(b.x - 2, b.y - 2, 4, 4,
            this.player.x, this.player.y, TILE * 2, TILE * 2)) {
            b.alive = false;
            if (this.shieldTimer <= 0) {
              this._explode(this.player.x + TILE, this.player.y + TILE, '#4ecdc4', 15);
              this.lives--;
              if (this.lives <= 0) {
                this.player.alive = false;
                this._gameOver();
              } else {
                this.player.x = 9 * TILE;
                this.player.y = 16 * TILE;
                this.player.dir = DIR.UP;
                this.shieldTimer = 3;
              }
            } else {
              this._explode(b.x, b.y, '#4ecdc4', 6);
            }
          }
        }
      }

      // Bullet vs bullet
      for (const other of this.bullets) {
        if (other === b || !other.alive || other.isPlayer === b.isPlayer) continue;
        if (this._rectOverlap(b.x - 3, b.y - 3, 6, 6, other.x - 3, other.y - 3, 6, 6)) {
          b.alive = false;
          other.alive = false;
          this._explode(b.x, b.y, '#fff', 4);
        }
      }
    }
  }

  _rectOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  _explode(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.5,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }

  _spawnPowerup(x, y) {
    const types = ['shield', 'freeze', 'life', 'bomb'];
    const type = types[Math.floor(Math.random() * types.length)];
    this.powerups.push({ x, y, type, timer: 10 });
  }

  _applyPowerup(pu) {
    switch (pu.type) {
      case 'shield':
        this.shieldTimer = 10;
        break;
      case 'freeze':
        this.freezeTimer = 8;
        break;
      case 'life':
        this.lives = Math.min(this.lives + 1, 5);
        break;
      case 'bomb':
        for (const e of this.enemies) {
          this._explode(e.x + TILE, e.y + TILE, e.color, 10);
          this.score += 100;
        }
        this.enemies = [];
        break;
    }
    this._explode(pu.x, pu.y, '#ffd93d', 10);
  }

  _gameOver() {
    this.state = 'over';
    const screen = document.getElementById('gameOverScreen');
    screen.style.display = 'flex';
    document.getElementById('finalScore').textContent = '得分: ' + this.score;
    document.getElementById('gameOverTitle').textContent = '游戏结束';
  }

  _gameWin() {
    this.state = 'over';
    const screen = document.getElementById('gameOverScreen');
    screen.style.display = 'flex';
    document.getElementById('finalScore').textContent = '得分: ' + this.score;
    document.getElementById('gameOverTitle').textContent = '恭喜通关!';
  }

  restart() {
    document.getElementById('gameOverScreen').style.display = 'none';
    this.start();
  }

  // ============================================================
  //  Rendering
  // ============================================================
  _render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);

    this._renderMap(ctx);
    this._renderTanks(ctx);
    this._renderBullets(ctx);
    this._renderParticles(ctx);
    this._renderPowerups(ctx);
    this._renderTreeOverlay(ctx);

    // Shield effect
    if (this.shieldTimer > 0 && this.player && this.player.alive) {
      ctx.save();
      ctx.strokeStyle = `rgba(78, 205, 196, ${0.5 + Math.sin(performance.now() / 100) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.player.x + TILE, this.player.y + TILE, TILE + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  _renderMap(ctx) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = this.map[r][c];
        const x = c * TILE;
        const y = r * TILE;
        switch (tile) {
          case T.BRICK:
            this._drawBrick(ctx, x, y);
            break;
          case T.STEEL:
            this._drawSteel(ctx, x, y);
            break;
          case T.WATER:
            this._drawWater(ctx, x, y);
            break;
          case T.BASE:
            this._drawBase(ctx, x, y);
            break;
          // Trees drawn as overlay after tanks
        }
      }
    }
  }

  _renderTreeOverlay(ctx) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.map[r][c] === T.TREE) {
          this._drawTree(ctx, c * TILE, r * TILE);
        }
      }
    }
  }

  _drawBrick(ctx, x, y) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = '#A0522D';
    ctx.lineWidth = 1;
    const half = TILE / 2;
    ctx.strokeRect(x, y, half, half / 2);
    ctx.strokeRect(x + half / 3, y + half / 2, half, half / 2);
    ctx.strokeRect(x, y + half, half, half / 2);
    ctx.strokeRect(x + half / 3, y + half + half / 2, half, half / 2);
  }

  _drawSteel(ctx, x, y) {
    ctx.fillStyle = '#708090';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = '#8899AA';
    ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
    ctx.fillStyle = '#607080';
    ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8);
    ctx.fillStyle = '#8899AA';
    ctx.fillRect(x + TILE / 2 - 1, y, 2, TILE);
    ctx.fillRect(x, y + TILE / 2 - 1, TILE, 2);
  }

  _drawWater(ctx, x, y) {
    const t = performance.now() / 500;
    ctx.fillStyle = '#1a5276';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = '#2980b9';
    for (let i = 0; i < 3; i++) {
      const wy = y + 4 + i * 10 + Math.sin(t + i + x / 30) * 3;
      ctx.fillRect(x + 2, wy, TILE - 4, 3);
    }
  }

  _drawTree(ctx, x, y) {
    ctx.fillStyle = '#1B5E20';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = '#2E7D32';
    for (let i = 0; i < 4; i++) {
      const tx = x + (i % 2) * TILE / 2 + 4;
      const ty = y + Math.floor(i / 2) * TILE / 2 + 4;
      ctx.beginPath();
      ctx.arc(tx + 4, ty + 4, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawBase(ctx, x, y) {
    if (this.baseAlive) {
      ctx.fillStyle = '#333';
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = '#e94560';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚑', x + TILE / 2, y + TILE / 2);
    } else {
      ctx.fillStyle = '#333';
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = '#666';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✕', x + TILE / 2, y + TILE / 2);
    }
  }

  _renderTanks(ctx) {
    if (this.player && this.player.alive) {
      this.player.draw(ctx);
    }
    for (const e of this.enemies) {
      e.draw(ctx);
    }
  }

  _renderBullets(ctx) {
    for (const b of this.bullets) {
      ctx.fillStyle = b.isPlayer ? '#ffd93d' : '#ff6b6b';
      ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
    }
  }

  _renderParticles(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  _renderPowerups(ctx) {
    for (const pu of this.powerups) {
      const flash = Math.sin(performance.now() / 150) > 0;
      if (!flash && pu.timer < 3) continue;

      ctx.fillStyle = '#222';
      ctx.fillRect(pu.x - 2, pu.y - 2, TILE + 4, TILE + 4);

      let color, symbol;
      switch (pu.type) {
        case 'shield': color = '#4ecdc4'; symbol = 'S'; break;
        case 'freeze': color = '#74b9ff'; symbol = 'F'; break;
        case 'life':   color = '#e94560'; symbol = '+'; break;
        case 'bomb':   color = '#ffd93d'; symbol = 'B'; break;
      }
      ctx.fillStyle = color;
      ctx.fillRect(pu.x, pu.y, TILE, TILE);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, pu.x + TILE / 2, pu.y + TILE / 2);
    }
  }
}

// ============================================================
//  Tank
// ============================================================
class Tank {
  constructor(x, y, dir, isPlayer, game) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.isPlayer = isPlayer;
    this.game = game;
    this.alive = true;
    this.speed = isPlayer ? 2 : 1.5;
    this.hp = 1;
    this.color = isPlayer ? '#4ecdc4' : '#aaa';
    this.type = isPlayer ? 'player' : 'basic';
    this.shootCooldown = 0;
    this.bulletSpeed = 4;

    // AI
    this.aiTimer = 0;
    this.aiShootTimer = 0;
    this.moveFrames = 0;
  }

  move() {
    const [dx, dy] = DIR_VEC[this.dir];
    const nx = this.x + dx * this.speed;
    const ny = this.y + dy * this.speed;

    if (this._canMove(nx, ny)) {
      this.x = nx;
      this.y = ny;
    }
  }

  _canMove(nx, ny) {
    if (nx < 0 || ny < 0 || nx + TILE * 2 > W || ny + TILE * 2 > H) return false;

    const corners = [
      [nx, ny],
      [nx + TILE * 2 - 1, ny],
      [nx, ny + TILE * 2 - 1],
      [nx + TILE * 2 - 1, ny + TILE * 2 - 1],
    ];

    for (const [cx, cy] of corners) {
      const col = Math.floor(cx / TILE);
      const row = Math.floor(cy / TILE);
      const tile = this.game.map[row]?.[col];
      if (tile === T.BRICK || tile === T.STEEL || tile === T.WATER || tile === T.BASE) {
        return false;
      }
    }

    // Collision with other tanks
    const tanks = this.isPlayer ? this.game.enemies : [this.game.player, ...this.game.enemies.filter(e => e !== this)];
    for (const t of tanks) {
      if (!t || !t.alive || t === this) continue;
      if (this.game._rectOverlap(nx, ny, TILE * 2, TILE * 2, t.x, t.y, TILE * 2, TILE * 2)) {
        return false;
      }
    }

    return true;
  }

  shoot() {
    if (this.shootCooldown > 0) return;
    const [dx, dy] = DIR_VEC[this.dir];
    const bx = this.x + TILE + dx * TILE;
    const by = this.y + TILE + dy * TILE;
    this.game.bullets.push(new Bullet(bx, by, this.dir, this.isPlayer, this.bulletSpeed));
    this.shootCooldown = this.isPlayer ? 15 : 40;
  }

  ai(dt) {
    if (!this.alive) return;
    this.shootCooldown = Math.max(0, this.shootCooldown - 1);

    this.aiTimer -= dt;
    this.aiShootTimer -= dt;

    if (this.aiTimer <= 0) {
      // Decide direction
      const player = this.game.player;
      const r = Math.random();
      if (r < 0.4 && player && player.alive) {
        // Move towards player or base
        const target = Math.random() < 0.6
          ? { x: player.x, y: player.y }
          : { x: 9 * TILE, y: 16 * TILE };
        const adx = target.x - this.x;
        const ady = target.y - this.y;
        if (Math.abs(adx) > Math.abs(ady)) {
          this.dir = adx > 0 ? DIR.RIGHT : DIR.LEFT;
        } else {
          this.dir = ady > 0 ? DIR.DOWN : DIR.UP;
        }
      } else {
        this.dir = Math.floor(Math.random() * 4);
      }
      this.aiTimer = 0.8 + Math.random() * 1.5;
      this.moveFrames = 30 + Math.floor(Math.random() * 60);
    }

    if (this.moveFrames > 0) {
      this.move();
      this.moveFrames--;
      if (!this._canMove(
        this.x + DIR_VEC[this.dir][0] * this.speed,
        this.y + DIR_VEC[this.dir][1] * this.speed
      )) {
        this.aiTimer = 0;
      }
    }

    if (this.aiShootTimer <= 0) {
      this.shoot();
      this.aiShootTimer = 0.8 + Math.random() * 2;
    }
  }

  draw(ctx) {
    const cx = this.x + TILE;
    const cy = this.y + TILE;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.dir * Math.PI / 2);

    // Body
    ctx.fillStyle = this.color;
    ctx.fillRect(-TILE + 2, -TILE + 2, TILE * 2 - 4, TILE * 2 - 4);

    // Tracks
    ctx.fillStyle = this.isPlayer ? '#3ba89f' : '#888';
    ctx.fillRect(-TILE, -TILE + 2, 5, TILE * 2 - 4);
    ctx.fillRect(TILE - 5, -TILE + 2, 5, TILE * 2 - 4);

    // Track details
    ctx.fillStyle = this.isPlayer ? '#2d8a83' : '#666';
    for (let i = 0; i < 5; i++) {
      const ty = -TILE + 6 + i * 11;
      ctx.fillRect(-TILE, ty, 5, 3);
      ctx.fillRect(TILE - 5, ty, 5, 3);
    }

    // Turret
    ctx.fillStyle = this.isPlayer ? '#45b7aa' : '#999';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Barrel
    ctx.fillStyle = this.isPlayer ? '#5cd6c8' : '#bbb';
    ctx.fillRect(-3, -TILE + 2, 6, TILE - 8);

    ctx.restore();

    // HP indicator for heavy tanks
    if (!this.isPlayer && this.hp > 1) {
      ctx.fillStyle = '#ffd93d';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.hp, cx, cy - TILE - 4);
    }
  }
}

// ============================================================
//  Bullet
// ============================================================
class Bullet {
  constructor(x, y, dir, isPlayer, speed = 4) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.isPlayer = isPlayer;
    this.speed = speed;
    this.alive = true;
  }

  update() {
    const [dx, dy] = DIR_VEC[this.dir];
    this.x += dx * this.speed;
    this.y += dy * this.speed;

    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) {
      this.alive = false;
    }
  }
}

// ============================================================
//  Init
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);

  document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('startScreen').style.display = 'none';
    game.start();
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    game.restart();
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (game.state === 'start') {
        document.getElementById('startScreen').style.display = 'none';
        game.start();
      } else if (game.state === 'over') {
        game.restart();
      }
    }
  });
});
