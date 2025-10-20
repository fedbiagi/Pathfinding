// === FUNCTION: Compute grid index ===
function getGridPos(x, y, cellSize) {
  return [Math.floor(x / cellSize), Math.floor(y / cellSize)];
}

// === Simple Priority Queue for A* ===
function PriorityQueue() {
  const elements = [];
  return {
    enqueue(element) {
      elements.push(element);
      elements.sort((a, b) => a.f - b.f);
    },
    dequeue() {
      return elements.shift();
    },
    isEmpty() {
      return elements.length === 0;
    },
    some(fn) {
      return elements.some(fn);
    }
  };
}

// === Check if the player rectangle can fit in (x, y) ===
function isFreeSpace(grid, x, y, width, height) {
  const rows = grid.length;
  const cols = grid[0].length;
  if (x < 0 || y < 0 || x + width > cols || y + height > rows) {
    return false;
  }

  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      if (grid[y + dy][x + dx] === 1) {
        return false;
      }
    }
  }
  return true;
}

// === A* pathfinding adapted for a rectangular player ===
function aStarGrid(grid, start, goal, width, height) {

  const open = PriorityQueue();
  const closed = new Set();
  open.enqueue({ pos: start, parent: null, g: 0, h: 0, f: 0 });

  while (!open.isEmpty()) {
    const node = open.dequeue();
    closed.add(node.pos.toString());

    const [x, y] = node.pos;
//alert(node.pos[0]);
    // ✅ Goal check: player reaches goal only if the goal matches the center of the rectangle
    const centerX = x + Math.floor(width / 2);
    const centerY = y + Math.floor(height / 2);

    const reached = (centerX === goal[0] && centerY === goal[1]);

    if (reached) {
      // Build path from current node
      const path = [];
      let n = node;
      while (n) {
        path.push(n.pos);
        n = n.parent;
      }
      return path.reverse();
    }

    // 4-directional movement
    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (!isFreeSpace(grid, nx, ny, width, height)) continue;
      if (closed.has([nx, ny].toString())) continue;

      const neighborNode = {
        pos: [nx, ny],
        parent: node,
        g: node.g + 1,
        h: Math.abs(nx - goal[0]) + Math.abs(ny - goal[1]) // Manhattan heuristic
      };
      neighborNode.f = neighborNode.g + neighborNode.h;

      if (open.some(n => n.pos.toString() === neighborNode.pos.toString() && n.f <= neighborNode.f))
        continue;

      open.enqueue(neighborNode);
    }
  }

  return null;
}

function isRectValid(grid, target, width, height) {
  const rows = grid.length;
  const cols = grid[0].length;

  const [cx, cy] = target;

  // Calcola l'angolo in alto a sinistra del rettangolo centrato sul target
  const x0 = Math.floor(cx - width / 2);
  const y0 = Math.floor(cy - height / 2);

  // Controlla se il rettangolo è completamente dentro la griglia
  if (x0 < 0 || y0 < 0 || x0 + width > cols || y0 + height > rows) {
    return false;
  }

  // Controlla se ci sono muri
  for (let y = y0; y < y0 + height; y++) {
    for (let x = x0; x < x0 + width; x++) {
      if (grid[y][x] === 1) {
        return false;
      }
    }
  }

  return true;
}

function getRectIssues(grid, target, width, height) {
  const rows = grid.length;
  const cols = grid[0].length;

  const [cx, cy] = target;

  const x0 = Math.floor(cx - width / 2);
  const y0 = Math.floor(cy - height / 2);
  const x1 = x0 + width - 1;
  const y1 = y0 + height - 1;

  const issues = { top: false, bottom: false, left: false, right: false };

  // 🔹 Controllo uscita dalla griglia
  if (x0 < 0) issues.left = true;
  if (y0 < 0) issues.top = true;
  if (x1 >= cols) issues.right = true;
  if (y1 >= rows) issues.bottom = true;

  // 🔹 Controllo muri
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (y < 0 || y >= rows || x < 0 || x >= cols) continue;
      if (grid[y][x] === 1) {
        if (y === y0) issues.top = true;
        if (y === y1) issues.bottom = true;
        if (x === x0) issues.left = true;
        if (x === x1) issues.right = true;
      }
    }
  }

  return issues;
}

function adjustTarget(grid, target, width, height) {
  const maxDx = Math.floor(width / 2);
  const maxDy = Math.floor(height / 2);

  const [cx, cy] = target;

  if (isRectValid(grid, target, width, height)) return target;

  const issues = getRectIssues(grid, [cx, cy], width, height);

  // Costruisci vettori per direzioni problematiche
  const dxOptions = [];
  if (issues.left) dxOptions.push(...Array.from({length: maxDx}, (_, i) => i + 1)); // sposta destra
  if (issues.right) dxOptions.push(...Array.from({length: maxDx}, (_, i) => -(i + 1))); // sposta sinistra
  if (dxOptions.length === 0) dxOptions.push(0);

  const dyOptions = [];
  if (issues.top) dyOptions.push(...Array.from({length: maxDy}, (_, i) => i + 1)); // sposta giù
  if (issues.bottom) dyOptions.push(...Array.from({length: maxDy}, (_, i) => -(i + 1))); // sposta su
  if (dyOptions.length === 0) dyOptions.push(0);

  // 🔹 Prova tutte le combinazioni di spostamento
  for (const dx of dxOptions) {
    for (const dy of dyOptions) {
      const newTarget = [cx + dx, cy + dy];

      // Controlla che il vecchio target rimanga dentro
      const x0 = Math.floor(newTarget[0] - width / 2);
      const y0 = Math.floor(newTarget[1] - height / 2);
      const x1 = x0 + width;
      const y1 = y0 + height;

      if (
        cx >= x0 && cx <= x1 &&
        cy >= y0 && cy <= y1 &&
        isRectValid(grid, newTarget, width, height)
      ) {
        return newTarget;
      }
    }
  }

  // Nessuna posizione valida trovata
  return target;
}


// === CONFIGURATION ===
const cellSize = 2;

const mouseX = runtimeScene.getGame().getInputManager().getMouseX();
const mouseY = runtimeScene.getGame().getInputManager().getMouseY();
let goal = getGridPos(mouseX, mouseY, cellSize);

// === Create a target marker ===
const target = runtimeScene.createObject("Target");
target.setPosition(goal[0] * cellSize, goal[1] * cellSize);
target.setZOrder(1000);
// === Retrieve the map ===

const map = runtimeScene.getObjects("Grid")[0];
if (!map) return;

const mapX = map.getX();
const mapY = map.getY();
const mapWidth = map.getWidth();
const mapHeight = map.getHeight();

// === Build grid (2D numeric matrix) ===
const cols = Math.floor(mapWidth / cellSize);
const rows = Math.floor(mapHeight / cellSize);
const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));

// === Mark walls as blocked ===
const walls = runtimeScene.getObjects("Wall");
if (!walls) return;

for (const wall of walls) {
  const wx = wall.getX();
  const wy = wall.getY();
  const wWidth = wall.getWidth();
  const wHeight = wall.getHeight();

  // Ignore walls outside map
  if (
    wx + wWidth < mapX ||
    wy + wHeight < mapY ||
    wx > mapX + mapWidth ||
    wy > mapY + mapHeight
  ) continue;

  const startCol = Math.floor((wx - mapX) / cellSize);
  const endCol = Math.floor((wx + wWidth - mapX) / cellSize);
  const startRow = Math.floor((wy - mapY) / cellSize);
  const endRow = Math.floor((wy + wHeight - mapY) / cellSize);

  for (let y = startRow; y <= endRow; y++) {
    for (let x = startCol; x <= endCol; x++) {
      if (y >= 0 && y < rows && x >= 0 && x < cols) {
        grid[y][x] = 1; // Mark as obstacle
      }
    }
  }
}

// === Get player and start position ===
const player = runtimeScene.getObjects("Player")[0];
if (!player) return;

const playerWidth = player.getWidth();
const playerHeight = player.getHeight();
const playerCellWidth = Math.ceil(playerWidth / cellSize);
const playerCellHeight = Math.ceil(playerHeight / cellSize);

const playerX = player.getX();
const playerY = player.getY();
const start = getGridPos(playerX, playerY, cellSize);

if (!isRectValid(grid, goal, playerCellWidth, playerCellHeight)) {
  const issues = getRectIssues(grid, goal, playerCellWidth, playerCellHeight);
  goal = adjustTarget(grid, goal, playerCellWidth, playerCellHeight);

  const newTarget = runtimeScene.createObject("NewTarget");
  newTarget.setZOrder(1100);
  newTarget.setPosition(goal[0] * cellSize, goal[1] * cellSize);

}

// === Find the path ===
const path = aStarGrid(grid, start, goal, playerCellWidth, playerCellHeight);

if (path && path.length > 0) {
  const worldPath = path.map(cell => ({
    x: cell[0] * cellSize + cellSize / 2,
    y: cell[1] * cellSize + cellSize / 2
  }));

  player.getVariables().get("pathJson").setString(JSON.stringify(worldPath));
  player.getVariables().get("pathStep").setNumber(0);
  player.getVariables().get("pathLength").setNumber(worldPath.length);
}
