// pathfinding.js
// ============================================================
// A* Pathfinding per GDevelop — versione modulare
// ============================================================

// === FUNCTION: Compute grid index ===
export function getGridPos(x, y, cellSize) {
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
export function isFreeSpace(grid, x, y, width, height) {
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
export function aStarGrid(grid, start, goal, width, height) {
  const open = PriorityQueue();
  const closed = new Set();
  open.enqueue({ pos: start, parent: null, g: 0, h: 0, f: 0 });

  while (!open.isEmpty()) {
    const node = open.dequeue();
    closed.add(node.pos.toString());

    const [x, y] = node.pos;

    // ✅ Goal check
    const centerX = x + Math.floor(width / 2);
    const centerY = y + Math.floor(height / 2);
    const reached = (centerX === goal[0] && centerY === goal[1]);

    if (reached) {
      const path = [];
      let n = node;
      while (n) {
        path.push(n.pos);
        n = n.parent;
      }
      return path.reverse();
    }

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
        h: Math.abs(nx - goal[0]) + Math.abs(ny - goal[1])
      };
      neighborNode.f = neighborNode.g + neighborNode.h;

      if (open.some(n => n.pos.toString() === neighborNode.pos.toString() && n.f <= neighborNode.f))
        continue;

      open.enqueue(neighborNode);
    }
  }

  return null;
}

export function isRectValid(grid, target, width, height) {
  const rows = grid.length;
  const cols = grid[0].length;

  const [cx, cy] = target;
  const x0 = Math.floor(cx - width / 2);
  const y0 = Math.floor(cy - height / 2);

  if (x0 < 0 || y0 < 0 || x0 + width > cols || y0 + height > rows) {
    return false;
  }

  for (let y = y0; y < y0 + height; y++) {
    for (let x = x0; x < x0 + width; x++) {
      if (grid[y][x] === 1) {
        return false;
      }
    }
  }

  return true;
}

export function getRectIssues(grid, target, width, height) {
  const rows = grid.length;
  const cols = grid[0].length;
  const [cx, cy] = target;
  const x0 = Math.floor(cx - width / 2);
  const y0 = Math.floor(cy - height / 2);
  const x1 = x0 + width - 1;
  const y1 = y0 + height - 1;

  const issues = { top: false, bottom: false, left: false, right: false };

  if (x0 < 0) issues.left = true;
  if (y0 < 0) issues.top = true;
  if (x1 >= cols) issues.right = true;
  if (y1 >= rows) issues.bottom = true;

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

export function adjustTarget(grid, target, width, height) {
  const maxDx = Math.floor(width / 2);
  const maxDy = Math.floor(height / 2);
  const [cx, cy] = target;

  if (isRectValid(grid, target, width, height)) return target;

  const issues = getRectIssues(grid, [cx, cy], width, height);

  const dxOptions = [];
  if (issues.left) dxOptions.push(...Array.from({ length: maxDx }, (_, i) => i + 1));
  if (issues.right) dxOptions.push(...Array.from({ length: maxDx }, (_, i) => -(i + 1)));
  if (dxOptions.length === 0) dxOptions.push(0);

  const dyOptions = [];
  if (issues.top) dyOptions.push(...Array.from({ length: maxDy }, (_, i) => i + 1));
  if (issues.bottom) dyOptions.push(...Array.from({ length: maxDy }, (_, i) => -(i + 1)));
  if (dyOptions.length === 0) dyOptions.push(0);

  for (const dx of dxOptions) {
    for (const dy of dyOptions) {
      const newTarget = [cx + dx, cy + dy];
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

  return target;
}
