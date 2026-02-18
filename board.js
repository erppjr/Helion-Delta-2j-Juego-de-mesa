/* =============================================
   HEX BOARD – board.js
   ============================================= */

const BOARD_SIZE = 11;
const HEX_SIZE = 28;   // circumradius (pointy-top)
const HEX_H = Math.sqrt(3) * HEX_SIZE;
const PADDING = 50;

// ── Casillas con color fijo ───────────────────
// Formato: "q,r"  (columna, fila en coordenadas axiales)

const DEFAULT_BLUE = [
  "0,1", "0,2", "0,3",
  "1,0", "1,2",
  "10,7", "10,8", "10,9",
  "2,0", "2,1",
  "3,0",
  "7,10",
  "8,10", "8,9",
  "9,10", "9,8",
];

const DEFAULT_RED = [
  "0,0", "0,4",
  "1,3",
  "2,2",
  "3,1",
  "4,0",
];

const DEFAULT_GREEN = [
  "10,10", "10,6",
  "6,10",
  "7,9",
  "8,8",
  "9,7",
];

const DEFAULT_YELLOW = [
  "1,1", "1,5", "1,9",
  "5,1", "5,9",
  "9,1", "9,5", "9,9",
];

const DEFAULT_ORANGE = [
  "5,5",
];

const DEFAULT_WHITE = [
  "3,7", "4,4",
  "6,6", "7,3",
];

const FIXED_BLUE = new Set(DEFAULT_BLUE);
const FIXED_RED = new Set(DEFAULT_RED);
const FIXED_GREEN = new Set(DEFAULT_GREEN);
const FIXED_YELLOW = new Set(DEFAULT_YELLOW);
const FIXED_ORANGE = new Set(DEFAULT_ORANGE);
const FIXED_WHITE = new Set(DEFAULT_WHITE);

// Devuelve la clase de color fijo de una casilla, o null si no tiene
function getFixedClass(key) {
  if (FIXED_BLUE.has(key)) return 'fixed-blue';
  if (FIXED_RED.has(key)) return 'fixed-red';
  if (FIXED_GREEN.has(key)) return 'fixed-green';
  if (FIXED_YELLOW.has(key)) return 'fixed-yellow';
  if (FIXED_ORANGE.has(key)) return 'fixed-orange';
  if (FIXED_WHITE.has(key)) return 'fixed-white';
  return null;
}

// ── Helpers ──────────────────────────────────

/** Pointy-top hex corners */
function hexPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 180 * (60 * i + 30);
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

/** Axial (q, r) → pixel (pointy-top layout) */
function hexToPixel(q, r) {
  return {
    x: HEX_SIZE * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r),
    y: HEX_SIZE * (3 / 2 * r),
  };
}

// ── Build SVG ────────────────────────────────

function buildBoard() {
  const svg = document.getElementById('hex-svg');
  svg.innerHTML = '';

  const positions = [];
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let q = 0; q < BOARD_SIZE; q++)
      positions.push(hexToPixel(q, r));

  const xs = positions.map(p => p.x);
  const ys = positions.map(p => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  const svgW = maxX - minX + HEX_SIZE * 2 + PADDING * 2;
  const svgH = maxY - minY + HEX_H + PADDING * 2;

  svg.setAttribute('width', svgW);
  svg.setAttribute('height', svgH);
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);

  const offX = -minX + PADDING + HEX_SIZE;
  const offY = -minY + PADDING + HEX_H * 0.5;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let q = 0; q < BOARD_SIZE; q++) {
      const key = `${q},${r}`;
      const { x: px, y: py } = hexToPixel(q, r);
      const cx = px + offX;
      const cy = py + offY;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('hex-cell');
      g.dataset.q = q;
      g.dataset.r = r;

      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.classList.add('hex-bg');
      poly.setAttribute('points', hexPoints(cx, cy, HEX_SIZE - 1.5));

      // Aplicar color fijo si corresponde
      const fixedClass = getFixedClass(key);
      if (fixedClass) g.classList.add(fixedClass);

      g.appendChild(poly);
      g.addEventListener('click', onCellClick);
      svg.appendChild(g);
    }
  }
}

// ── Interaction ──────────────────────────────

function onCellClick(e) {
  const cell = e.currentTarget;
  const key = `${cell.dataset.q},${cell.dataset.r}`;

  // Delegar al sistema de juego (compra/movimiento de naves, selección)
  if (typeof onGameCellClick === 'function') {
    onGameCellClick(key);
  }
}


// ── Init ─────────────────────────────────────

buildBoard();

// ── Export ───────────────────────────────────

function exportConfig() {
  // Recoge las casillas actualmente seleccionadas (rosas)
  const selected = [];
  document.querySelectorAll('.hex-cell.selected').forEach(el => {
    selected.push(`${el.dataset.q},${el.dataset.r}`);
  });
  selected.sort();
  const output = JSON.stringify(selected, null, 2);
  document.getElementById('export-output').value = output;
  document.getElementById('export-modal').classList.add('open');
  document.getElementById('btn-copy').textContent = 'Copiar';
}

function closeModal(e) {
  if (e.target === document.getElementById('export-modal')) {
    document.getElementById('export-modal').classList.remove('open');
  }
}

function copyOutput() {
  const ta = document.getElementById('export-output');
  ta.select();
  navigator.clipboard.writeText(ta.value).then(() => {
    const btn = document.getElementById('btn-copy');
    btn.textContent = '✓ Copiado';
    setTimeout(() => { btn.textContent = 'Copiar'; }, 2000);
  });
}

function clearAll() {
  if (!confirm('¿Deseleccionar todas las casillas?')) return;
  document.querySelectorAll('.hex-cell.selected').forEach(el => {
    el.classList.remove('selected');
    const key = `${el.dataset.q},${el.dataset.r}`;
    const fixedClass = getFixedClass(key);
    if (fixedClass) el.classList.add(fixedClass);
  });
}

// ── Contadores de monedas ─────────────────────

const coins = { red: 0, green: 0 };

function addCoins(player, amount) {
  coins[player] = Math.max(0, coins[player] + amount);
  document.getElementById(`coins-${player}`).textContent = coins[player];
  // Actualizar botones de compra si el sistema de juego está cargado
  if (typeof renderShopButtons === 'function') renderShopButtons();
}

