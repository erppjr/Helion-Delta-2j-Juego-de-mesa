/* =============================================
   HELION DELTA – game.js
   ============================================= */

// ── Configuración ─────────────────────────────

const SHIP_TYPES = [
    { level: 1, cost: 3, speed: 2, strength: 2, icon: '▲', label: 'Nave I' },
    { level: 2, cost: 6, speed: 2, strength: 4, icon: '◆', label: 'Nave II' },
    { level: 3, cost: 15, speed: 1, strength: 6, icon: '★', label: 'Nave III' },
    { level: 4, cost: 20, speed: 1, strength: 8, icon: '⬟', label: 'Nave IV' },
];

const SPAWN_CELLS = {
    red: ['0,0', '1,1'],
    green: ['10,10', '9,9'],
};

const MAX_SHIPS_PER_CELL = 5;
const HEX_NEIGHBORS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]];

// ── Planetas ──────────────────────────────────
// type: 'normal' | 'rich' | 'home-red' | 'home-green'
// income: monedas por turno al propietario
// defaultOwner: propietario por defecto (null = neutral)
const PLANETS = {
    '1,5': { type: 'normal', income: 1, defaultOwner: null },
    '1,9': { type: 'normal', income: 1, defaultOwner: null },
    '5,1': { type: 'normal', income: 1, defaultOwner: null },
    '5,9': { type: 'normal', income: 1, defaultOwner: null },
    '9,1': { type: 'normal', income: 1, defaultOwner: null },
    '9,5': { type: 'normal', income: 1, defaultOwner: null },
    '5,5': { type: 'rich', income: 2, defaultOwner: null },
    '1,1': { type: 'home-red', income: 1, defaultOwner: 'red' },
    '9,9': { type: 'home-green', income: 1, defaultOwner: 'green' },
};

// Propietario actual de cada planeta (se actualiza cuando entran/salen naves)
// null = neutral
const planetOwnership = {};
for (const [key, p] of Object.entries(PLANETS)) {
    planetOwnership[key] = p.defaultOwner;
}


// ── Estado ────────────────────────────────────

let currentPlayer = 'red';

// ships["q,r"] = { red: [{level, moved},...], green: [{level, moved},...] }
const ships = {};

let pendingShip = null;   // nave recién comprada esperando colocación
let moveState = null;   // { fromKey, selectedIndices: Set, step: 'pick'|'dest', reachable: Set }
let battleState = null;   // { fromKey, enemies: [key], step: 'select_target' | 'rolling' }

// ── Helpers ───────────────────────────────────

function getShipsAt(key) {
    if (!ships[key]) ships[key] = { red: [], green: [] };
    return ships[key];
}

function totalShipsAt(key) {
    const s = getShipsAt(key);
    return s.red.length + s.green.length;
}

function getNeighborKeys(key) {
    const [q, r] = key.split(',').map(Number);
    return HEX_NEIGHBORS
        .map(([dq, dr]) => [q + dq, r + dr])
        .filter(([nq, nr]) => nq >= 0 && nq < BOARD_SIZE && nr >= 0 && nr < BOARD_SIZE)
        .map(([nq, nr]) => `${nq},${nr}`);
}

function shipLabel(s) {
    return SHIP_TYPES.find(t => t.level === s.level) || { icon: '?', label: '?' };
}

function startBuyShip(level) {
    if (!SHIP_TYPES.find(t => t.level === level)) return;
    pendingShip = level;
    if (typeof closeShopModal === 'function') closeShopModal();
    showStatus(`Nave Nivel ${level} seleccionada. ¡Haz clic en tu base para colocarla!`);
}

// ── Render naves en SVG ───────────────────────

function renderShips() {
    document.querySelectorAll('.ship-overlay').forEach(el => el.remove());
    const svg = document.getElementById('hex-svg');

    for (const [key, data] of Object.entries(ships)) {
        const rc = data.red.length, gc = data.green.length;
        if (rc === 0 && gc === 0) continue;

        const [q, r] = key.split(',');
        const cell = document.querySelector(`.hex-cell[data-q="${q}"][data-r="${r}"]`);
        if (!cell) continue;

        const poly = cell.querySelector('.hex-bg');
        const pts = poly.getAttribute('points').split(' ').map(p => p.split(',').map(Number));
        const cx = pts.reduce((s, p) => s + p[0], 0) / 6;
        const cy = pts.reduce((s, p) => s + p[1], 0) / 6;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('ship-overlay');
        g.style.pointerEvents = 'none';

        if (rc > 0) {
            const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            t.setAttribute('x', cx - (gc > 0 ? 9 : 0));
            t.setAttribute('y', cy + 5);
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('font-size', '11');
            t.setAttribute('font-weight', 'bold');
            t.setAttribute('fill', '#ff6b6b');
            t.setAttribute('font-family', 'Outfit, sans-serif');
            t.textContent = `▲${rc}`;
            g.appendChild(t);
        }
        if (gc > 0) {
            const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            t.setAttribute('x', cx + (rc > 0 ? 9 : 0));
            t.setAttribute('y', cy + 5);
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('font-size', '11');
            t.setAttribute('font-weight', 'bold');
            t.setAttribute('fill', '#2ecc71');
            t.setAttribute('font-family', 'Outfit, sans-serif');
            t.textContent = `▲${gc}`;
            g.appendChild(t);
        }
        svg.appendChild(g);
    }
}

// ── Tooltip hover ─────────────────────────────

function setupHover() {
    const tooltip = document.getElementById('ship-tooltip');

    document.getElementById('hex-svg').addEventListener('mouseover', e => {
        const cell = e.target.closest('.hex-cell');
        if (!cell) { tooltip.style.display = 'none'; return; }
        const key = `${cell.dataset.q},${cell.dataset.r}`;
        const data = ships[key];
        const planet = PLANETS[key];
        const hasShips = data && (data.red.length > 0 || data.green.length > 0);

        if (!planet && !hasShips) { tooltip.style.display = 'none'; return; }

        let html = '';

        // Info del planeta
        if (planet) {
            const owner = planetOwnership[key];
            const ownerLabel = owner === 'red' ? '<span class="tt-red">🔴 Rojo</span>'
                : owner === 'green' ? '<span class="tt-green">🟢 Verde</span>'
                    : 'Neutral';
            const typeLabel = planet.type === 'rich' ? '⭐ Planeta Rico'
                : planet.type === 'home-red' ? '⌂ Planeta Base Rojo'
                    : planet.type === 'home-green' ? '⌂ Planeta Base Verde'
                        : '● Planeta';
            html += `<div class="tt-title">${typeLabel}</div>`;
            html += `<div class="tt-ship">💰 Ingresos: <strong>${planet.income}</strong>/turno</div>`;
            html += `<div class="tt-ship">Propietario: ${ownerLabel}</div>`;
        }

        // Info de naves
        if (hasShips) {
            html += `<div class="tt-title" style="margin-top:6px">Naves</div>`;
            if (data.red.length > 0) {
                html += `<div class="tt-player tt-red">🔴 Rojo</div>`;
                data.red.forEach(s => {
                    const t = shipLabel(s);
                    html += `<div class="tt-ship">${t.icon} ${t.label}${s.moved ? ' <span class="tt-moved">ya movida</span>' : ''}</div>`;
                });
            }
            if (data.green.length > 0) {
                html += `<div class="tt-player tt-green">🟢 Verde</div>`;
                data.green.forEach(s => {
                    const t = shipLabel(s);
                    html += `<div class="tt-ship">${t.icon} ${t.label}${s.moved ? ' <span class="tt-moved">ya movida</span>' : ''}</div>`;
                });
            }
        }

        tooltip.innerHTML = html;
        tooltip.style.display = 'block';
    });


    document.getElementById('hex-svg').addEventListener('mousemove', e => {
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY - 10) + 'px';
    });


    document.getElementById('hex-svg').addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
}

// ── Highlights ────────────────────────────────

function highlightCells(keys, cssClass) {
    clearHighlights(cssClass);
    keys.forEach(key => {
        const [q, r] = key.split(',');
        const cell = document.querySelector(`.hex-cell[data-q="${q}"][data-r="${r}"]`);
        if (cell) cell.classList.add(cssClass);
    });
}

function clearHighlights(cssClass) {
    document.querySelectorAll(`.${cssClass}`).forEach(el => el.classList.remove(cssClass));
}

// ── Turn panel ────────────────────────────────

function updateTurnPanel() {
    const label = document.getElementById('turn-label');
    const dot = document.getElementById('turn-dot');
    label.textContent = currentPlayer === 'red' ? 'Turno: Jugador Rojo' : 'Turno: Jugador Verde';
    dot.style.background = currentPlayer === 'red' ? '#e74c3c' : '#2ecc71';
    renderShopButtons();
}

function endTurn() {
    // Reset moved flags
    for (const key of Object.keys(ships)) {
        ships[key].red.forEach(s => s.moved = false);
        ships[key].green.forEach(s => s.moved = false);
    }
    pendingShip = null;
    moveState = null;
    clearHighlights('cell-highlight-move');
    clearHighlights('cell-highlight-spawn');
    clearHighlights('cell-selected');
    const panel = document.getElementById('move-panel');
    if (panel) { panel.style.display = 'none'; panel.innerHTML = ''; }
    showStatus('');

    currentPlayer = currentPlayer === 'red' ? 'green' : 'red';

    // Cobrar ingresos de planetas al inicio del nuevo turno
    collectPlanetIncome();

    updateTurnPanel();
    saveGame();
}

// ── Persistencia ──────────────────────────────

function saveGame() {
    const state = {
        currentPlayer,
        ships,
        coins,
        planetOwnership,
        // movedThisTurn no se guarda porque se resetea al cambiar turno, 
        // y si recargas a mitad de turno, se asume que puedes mover de nuevo (o guardamos si queremos ser estrictos)
    };
    localStorage.setItem('hexGameState', JSON.stringify(state));
}

function loadGame() {
    const saved = localStorage.getItem('hexGameState');
    if (!saved) return false;
    try {
        const state = JSON.parse(saved);
        currentPlayer = state.currentPlayer;
        Object.assign(ships, state.ships);
        Object.assign(coins, state.coins);
        Object.assign(planetOwnership, state.planetOwnership);
        return true;
    } catch (e) {
        console.error('Error loading game:', e);
        return false;
    }
}

function resetGame() {
    if (!confirm('¿Seguro que quieres empezar una nueva partida? Se perderá el progreso actual.')) return;
    localStorage.removeItem('hexGameState');
    location.reload();
}

// ── Lógica de planetas ────────────────────────

/**
 * Recalcula el propietario de cada planeta según qué jugador tiene naves ahí.
 * Reglas especiales para home planets:
 *   - home-red  ('1,1'): pertenece a rojo por defecto; verde lo conquista si tiene naves ahí.
 *   - home-green('9,9'): pertenece a verde por defecto; rojo lo conquista si tiene naves ahí.
 */
function updatePlanetOwnership() {
    for (const [key, planet] of Object.entries(PLANETS)) {
        const data = ships[key] || { red: [], green: [] };
        const hasRed = data.red.length > 0;
        const hasGreen = data.green.length > 0;

        if (planet.type === 'home-red') {
            // Verde conquista si tiene naves; si no, rojo es dueño por defecto
            planetOwnership[key] = hasGreen ? 'green' : 'red';
        } else if (planet.type === 'home-green') {
            // Rojo conquista si tiene naves; si no, verde es dueño por defecto
            planetOwnership[key] = hasRed ? 'red' : 'green';
        } else {
            // Planetas normales/ricos: quien tenga naves lo posee; si ambos o ninguno → neutral
            if (hasRed && !hasGreen) planetOwnership[key] = 'red';
            else if (hasGreen && !hasRed) planetOwnership[key] = 'green';
            else planetOwnership[key] = null; // neutral o conflicto
        }
    }
    renderPlanets();
}

/**
 * Otorga monedas al jugador activo por sus planetas al inicio de su turno.
 */
function collectPlanetIncome() {
    let earned = 0;
    for (const [key, planet] of Object.entries(PLANETS)) {
        if (planetOwnership[key] === currentPlayer) {
            earned += planet.income;
        }
    }
    if (earned > 0) {
        addCoins(currentPlayer, earned);
        const name = currentPlayer === 'red' ? 'Rojo' : 'Verde';
        showStatus(`💰 Jugador ${name} recibe ${earned} moneda(s) de sus planetas.`);
    }
}

/**
 * Dibuja indicadores de planeta en el SVG:
 *   - Anillo exterior: color del propietario (rojo/verde) o gris si neutral
 *   - Icono central: ⬤ para normal, ★ para rico, ⌂ para home
 */
function renderPlanets() {
    document.querySelectorAll('.planet-overlay').forEach(el => el.remove());
    const svg = document.getElementById('hex-svg');

    for (const [key, planet] of Object.entries(PLANETS)) {
        const [q, r] = key.split(',');
        const cell = document.querySelector(`.hex-cell[data-q="${q}"][data-r="${r}"]`);
        if (!cell) continue;

        const poly = cell.querySelector('.hex-bg');
        const pts = poly.getAttribute('points').split(' ').map(p => p.split(',').map(Number));
        const cx = pts.reduce((s, p) => s + p[0], 0) / 6;
        const cy = pts.reduce((s, p) => s + p[1], 0) / 6;

        const owner = planetOwnership[key];
        const borderColor = owner === 'red' ? '#ff4444'
            : owner === 'green' ? '#22dd66'
                : '#555';
        const borderWidth = owner ? '2.5' : '1.5';

        // Polígono interior: mismos ángulos que el hex original pero escalado desde el centro
        const INNER_SCALE = 0.72;
        const innerPts = pts.map(([x, y]) => [
            cx + (x - cx) * INNER_SCALE,
            cy + (y - cy) * INNER_SCALE,
        ]).map(([x, y]) => `${x},${y}`).join(' ');

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('planet-overlay');
        g.style.pointerEvents = 'none';

        const inner = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        inner.setAttribute('points', innerPts);
        inner.setAttribute('fill', 'none');
        inner.setAttribute('stroke', borderColor);
        inner.setAttribute('stroke-width', borderWidth);
        inner.setAttribute('stroke-linejoin', 'round');
        g.appendChild(inner);

        svg.appendChild(g);
    }
}

// ── Shop ──────────────────────────────────────


function renderShopButtons() {
    const shop = document.getElementById('ship-shop');
    if (!shop) return;
    shop.innerHTML = '';
    SHIP_TYPES.forEach(ship => {
        const canAfford = coins[currentPlayer] >= ship.cost;
        const btn = document.createElement('button');
        btn.className = 'ship-buy-btn' + (canAfford ? '' : ' disabled');
        btn.disabled = !canAfford;
        btn.innerHTML = `
      <span class="ship-icon">${ship.icon}</span>
      <span class="ship-name">${ship.label}</span>
      <span class="ship-cost">💰 ${ship.cost}</span>
    `;
        btn.onclick = () => startBuyShip(ship);
        shop.appendChild(btn);
    });
}

function startBuyShip(ship) {
    // Solo cancelar movimiento, no tocar pendingShip aún
    moveState = null;
    clearHighlights('cell-highlight-move');
    clearHighlights('cell-selected');
    const panel = document.getElementById('move-panel');
    if (panel) { panel.style.display = 'none'; panel.innerHTML = ''; }

    pendingShip = ship;
    highlightCells(SPAWN_CELLS[currentPlayer], 'cell-highlight-spawn');
    showStatus(`Elige una casilla de inicio para colocar ${ship.label} (💰 ${ship.cost})`);
}

function placePurchasedShip(key) {
    if (!pendingShip) return false;
    if (!SPAWN_CELLS[currentPlayer].includes(key)) {
        showStatus('Esa casilla no es zona de inicio. Elige una casilla resaltada.');
        return true;
    }
    if (totalShipsAt(key) >= MAX_SHIPS_PER_CELL) {
        showStatus('¡Casilla llena! Máximo 5 naves.');
        return true;
    }
    addCoins(currentPlayer, -pendingShip.cost);
    getShipsAt(key)[currentPlayer].push({ level: pendingShip.level, moved: false });
    clearHighlights('cell-highlight-spawn');
    pendingShip = null;
    renderShips();
    updatePlanetOwnership();
    renderShopButtons();
    saveGame();
    showStatus('✅ Nave colocada.');
    return true;
}

// ── Movement ──────────────────────────────────

function startMove(key) {
    const myShips = getShipsAt(key)[currentPlayer];
    if (myShips.length === 0) return false;

    const movable = myShips.filter(s => !s.moved);
    if (movable.length === 0) {
        showStatus('Todas las naves de esta casilla ya se movieron este turno.');
        return true;
    }

    moveState = { fromKey: key, selectedIndices: new Set(), step: 'pick' };
    clearHighlights('cell-selected');

    // Resaltar la casilla origen
    const [q, r] = key.split(',');
    const srcCell = document.querySelector(`.hex-cell[data-q="${q}"][data-r="${r}"]`);
    if (srcCell) srcCell.classList.add('cell-selected');

    // Auto-seleccionar todas las naves movibles
    const allIndices = myShips.map((s, i) => (!s.moved ? i : -1)).filter(i => i >= 0);
    applyMoveDestination(allIndices);

    // Si hay más de 1 nave movible, mostrar botón "Dividir"
    if (movable.length > 1) {
        const panel = document.getElementById('move-panel');
        panel.innerHTML = `
          <button class="move-count-btn" onclick="openSplitModal()">✂️ Dividir flota</button>
          <button class="move-cancel-btn" onclick="cancelMove()">Cancelar</button>
        `;
        panel.style.display = 'flex';
    }

    return true;
}

function openSplitModal() {
    if (!moveState) return;
    const key = moveState.fromKey;
    const myShips = getShipsAt(key)[currentPlayer];
    // Limpiar destinos actuales
    clearHighlights('cell-highlight-move');
    moveState.step = 'pick';
    showPickModal(key, myShips);
}


function showPickModal(key, myShips) {
    let rows = myShips.map((s, i) => {
        const t = shipLabel(s);
        const disabled = s.moved ? 'disabled' : '';
        const movedTag = s.moved ? '<span class="tt-moved">ya movida</span>' : '';
        return `<label class="ship-pick-row ${s.moved ? 'ship-moved' : ''}">
      <input type="checkbox" class="ship-pick-cb" data-idx="${i}" ${disabled} onchange="onPickChange()">
      <span>${t.icon} ${t.label} ${movedTag}</span>
    </label>`;
    }).join('');

    const modal = document.getElementById('move-modal');
    modal.innerHTML = `
    <div class="modal-content move-modal-content">
      <div class="move-panel-title">Naves en (${key})</div>
      <div class="ship-pick-list">${rows}</div>
      <div class="move-count-row">
        <button class="move-count-btn" id="btn-pick-all" onclick="selectAllShips()">Mover Flota</button>
        <button class="move-count-btn" id="btn-pick-none" onclick="deselectAllShips()">Ninguna</button>
      </div>
      <div class="move-panel-sub" id="pick-status">Selecciona las naves a mover</div>
      <div class="move-count-row">
        <button class="ship-buy-btn" id="btn-confirm-move" onclick="confirmMove()" disabled>Mover →</button>
        <button class="move-cancel-btn" onclick="cancelMove()">Cancelar</button>
      </div>
    </div>
  `;
    modal.style.display = 'flex';
}

function onPickChange() {
    const checked = document.querySelectorAll('.ship-pick-cb:checked').length;
    const btn = document.getElementById('btn-confirm-move');
    if (btn) btn.disabled = checked === 0;
    const status = document.getElementById('pick-status');
    if (status) status.textContent = checked > 0
        ? `${checked} nave(s) seleccionada(s). Confirma para elegir destino.`
        : 'Selecciona las naves a mover';
}

function selectAllShips() {
    document.querySelectorAll('.ship-pick-cb:not(:disabled)').forEach(cb => cb.checked = true);
    onPickChange();
}

function deselectAllShips() {
    document.querySelectorAll('.ship-pick-cb').forEach(cb => cb.checked = false);
    onPickChange();
}


// ── Pathfinding BFS ───────────────────────────

function getFleetSpeed(shipIndices, fromKey) {
    const myShips = getShipsAt(fromKey)[currentPlayer];
    let minSpeed = 999;
    shipIndices.forEach(idx => {
        const ship = myShips[idx];
        const type = SHIP_TYPES.find(t => t.level === ship.level);
        if (type && type.speed < minSpeed) minSpeed = type.speed;
    });
    return minSpeed === 999 ? 1 : minSpeed;
}

function calculateReachableCells(startKey, range) {
    const visited = new Set();
    const queue = [[startKey, 0]];
    const reachable = new Set();

    visited.add(startKey);

    while (queue.length > 0) {
        const [currentKey, dist] = queue.shift();
        if (dist > 0) reachable.add(currentKey);
        if (dist >= range) continue;

        if (dist >= range) continue;

        getNeighborKeys(currentKey).forEach(neighbor => {
            if (!visited.has(neighbor)) {
                // Bloquear si hay naves enemigas (excepto si es el destino final? No, BFS explora caminos seguros)
                const enemy = currentPlayer === 'red' ? 'green' : 'red';
                const hasEnemy = getShipsAt(neighbor)[enemy].length > 0;

                if (!hasEnemy) {
                    visited.add(neighbor);
                    queue.push([neighbor, dist + 1]);
                }
            }
        });
    }
    return reachable;
}

// ── Confirm Move ──────────────────────────────

function applyMoveDestination(indices) {
    moveState.selectedIndices = new Set(indices);
    moveState.step = 'dest';

    const speed = getFleetSpeed(indices, moveState.fromKey);
    const reachable = calculateReachableCells(moveState.fromKey, speed);
    moveState.reachable = reachable;

    // Cerrar modal y panel si estaban abiertos
    const modal = document.getElementById('move-modal');
    if (modal) modal.style.display = 'none';
    const panel = document.getElementById('move-panel');
    if (panel) { panel.style.display = 'none'; panel.innerHTML = ''; }

    highlightCells([...reachable], 'cell-highlight-move');
    showStatus(`Rango: ${speed}. Haz clic en una casilla resaltada para mover.`);
}

function confirmMove() {
    if (!moveState) return;
    const checked = [...document.querySelectorAll('.ship-pick-cb:checked')].map(cb => parseInt(cb.dataset.idx));
    if (checked.length === 0) return;
    applyMoveDestination(checked);
}

function executeMove(destKey) {
    if (!moveState || moveState.step !== 'dest') return false;

    if (!moveState.reachable.has(destKey)) {
        showStatus('Esa casilla está fuera de alcance. Elige una casilla resaltada.');
        return true;
    }

    const freeSlots = MAX_SHIPS_PER_CELL - totalShipsAt(destKey);

    if (freeSlots === 0) {
        showStatus('¡Casilla destino llena!');
        return true;
    }

    const myShips = getShipsAt(moveState.fromKey)[currentPlayer];
    const indices = [...moveState.selectedIndices].sort((a, b) => b - a); // mayor a menor para splice seguro
    const toMove = indices.slice(0, freeSlots).map(i => myShips[i]);

    // Quitar del origen (de mayor índice a menor)
    indices.slice(0, freeSlots).sort((a, b) => b - a).forEach(i => myShips.splice(i, 1));

    // Añadir al destino marcadas como ya movidas
    const dest = getShipsAt(destKey)[currentPlayer];
    toMove.forEach(s => dest.push({ level: s.level, moved: true }));

    clearHighlights('cell-highlight-move');
    clearHighlights('cell-selected');
    moveState = null;
    const panel = document.getElementById('move-panel');
    if (panel) { panel.style.display = 'none'; panel.innerHTML = ''; }

    renderShips();
    updatePlanetOwnership();
    saveGame();
    showStatus(`✅ ${toMove.length} nave(s) movidas a (${destKey}).`);

    // Detectar enemigos adyacentes para batalla
    checkForBattle(destKey);
    checkWinCondition();

    return true;
}

function checkForBattle(myKey) {
    const enemy = currentPlayer === 'red' ? 'green' : 'red';
    const neighbors = getNeighborKeys(myKey);
    const enemies = neighbors.filter(k => getShipsAt(k)[enemy].length > 0);

    if (enemies.length === 0) return;

    battleState = { fromKey: myKey, enemies: enemies, step: 'prompt' };
    highlightCells(enemies, 'cell-highlight-spawn');

    // Mostrar modal de alerta
    const modal = document.getElementById('move-modal');
    const enemyWord = enemies.length === 1 ? '1 flota enemiga' : `${enemies.length} flotas enemigas`;
    modal.innerHTML = `
    <div class="modal-content move-modal-content" style="border-color:#e74c3c; text-align:center;">
      <div style="font-size:2.5rem; margin-bottom:10px;">⚠️</div>
      <div style="font-size:1.3rem; font-weight:bold; color:#e74c3c; margin-bottom:8px;">¡ENEMIGOS DETECTADOS!</div>
      <div style="color:#ccc; margin-bottom:16px;">${enemyWord} en casillas adyacentes.</div>
      <div class="move-count-row" style="justify-content:center; gap:12px;">
        <button class="ship-buy-btn" style="background:#c0392b; min-width:110px;" onclick="confirmAttack()">⚔️ Atacar</button>
        <button class="move-cancel-btn" style="min-width:110px;" onclick="skipBattle()">🕊️ No atacar</button>
      </div>
    </div>
  `;
    modal.style.display = 'flex';
}

function confirmAttack() {
    if (!battleState) return;
    const modal = document.getElementById('move-modal');
    modal.style.display = 'none';

    if (battleState.enemies.length === 1) {
        startBattle(battleState.fromKey, battleState.enemies[0]);
    } else {
        battleState.step = 'select_target';
        showStatus('Haz clic en una flota enemiga resaltada para atacarla.');
    }
}

function skipBattle() {
    const modal = document.getElementById('move-modal');
    modal.style.display = 'none';
    clearHighlights('cell-highlight-spawn');
    battleState = null;
    showStatus('Has decidido no atacar.');
}


function cancelMove() {
    moveState = null;
    pendingShip = null;
    clearHighlights('cell-highlight-move');
    clearHighlights('cell-highlight-spawn');
    clearHighlights('cell-selected');
    const modal = document.getElementById('move-modal');
    if (modal) { modal.style.display = 'none'; modal.innerHTML = ''; }
    const panel = document.getElementById('move-panel');
    if (panel) { panel.style.display = 'none'; panel.innerHTML = ''; }
    showStatus('');
}

// ── Status ────────────────────────────────────

function showStatus(msg) {
    const el = document.getElementById('game-status');
    if (el) el.textContent = msg;
}

// ── Click handler ─────────────────────────────

let debugMode = false;

function toggleDebugMode() {
    debugMode = !debugMode;
    const btn = document.getElementById('btn-debug');
    if (debugMode) {
        btn.textContent = '🔴 Salir de Debug';
        btn.classList.add('debug-active');
        cancelMove();
        showStatus('🛠 Modo debug: haz clic en casillas para seleccionarlas en rosa.');
    } else {
        btn.textContent = '🛠 Modo Debug';
        btn.classList.remove('debug-active');
        // Limpiar selección rosa al salir
        document.querySelectorAll('.hex-cell.selected').forEach(el => {
            el.classList.remove('selected');
            const key = `${el.dataset.q},${el.dataset.r}`;
            const fc = getFixedClass(key);
            if (fc) el.classList.add(fc);
        });
        showStatus('');
    }
}

function onGameCellClick(key) {
    // Modo debug: toggle rosa
    if (debugMode) {
        const [q, r] = key.split(',');
        const cell = document.querySelector(`.hex-cell[data-q="${q}"][data-r="${r}"]`);
        if (!cell) return;
        if (cell.classList.contains('selected')) {
            cell.classList.remove('selected');
            const fc = getFixedClass(key);
            if (fc) cell.classList.add(fc);
        } else {
            const fc = getFixedClass(key);
            if (fc) cell.classList.remove(fc);
            cell.classList.add('selected');
        }
        return;
    }
    // 1. Colocar nave comprada
    if (pendingShip) {
        placePurchasedShip(key);
        return;
    }
    // 2. Ejecutar movimiento a destino
    if (moveState && moveState.step === 'dest') {
        executeMove(key);
        return;
    }
    // 3. Si hay panel de selección abierto, ignorar clicks en tablero
    if (moveState && moveState.step === 'pick') {
        return;
    }
    // 4. Selección de objetivo de batalla
    if (battleState && battleState.step === 'select_target') {
        if (battleState.enemies.includes(key)) {
            startBattle(battleState.fromKey, key);
        } else {
            showStatus('Esa no es una flota enemiga válida. Elige una resaltada.');
        }
        return;
    }
    // 5. Iniciar selección de naves en casilla
    startMove(key);
}

// ── Battle System ─────────────────────────────

function startBattle(atkKey, defKey) {
    battleState.step = 'rolling';
    battleState.atkKey = atkKey;
    battleState.defKey = defKey;
    clearHighlights('cell-highlight-spawn'); // Limpiar resaltado de objetivos

    const atkShips = getShipsAt(atkKey)[currentPlayer];
    const enemy = currentPlayer === 'red' ? 'green' : 'red';
    const defShips = getShipsAt(defKey)[enemy];

    // Calcular fuerza base
    const atkStr = calculateFleetStrength(atkShips);
    const defStr = calculateFleetStrength(defShips);

    battleState.atkStrBase = atkStr;
    battleState.defStrBase = defStr;

    // Abrir Modal
    const modal = document.getElementById('battle-modal');
    modal.style.display = 'flex';

    document.getElementById('battle-atk-str').textContent = `Fuerza: ${atkStr}`;
    document.getElementById('battle-def-str').textContent = `Fuerza: ${defStr}`;
    document.getElementById('battle-atk-total').textContent = 'Total: ?';
    document.getElementById('battle-def-total').textContent = 'Total: ?';
    document.getElementById('battle-result').textContent = '¡Tira los dados!';
    document.getElementById('battle-result').style.color = '#fff';

    document.getElementById('btn-roll-dice').style.display = 'inline-block';
    document.getElementById('btn-close-battle').style.display = 'none';
}

function calculateFleetStrength(shipsList) {
    return shipsList.reduce((sum, s) => {
        const type = SHIP_TYPES.find(t => t.level === s.level);
        return sum + (type ? type.strength : 0);
    }, 0);
}

function rollBattleDice() {
    const btn = document.getElementById('btn-roll-dice');
    btn.disabled = true;

    // Animación simple
    const diceAtk = document.getElementById('battle-atk-dice');
    const diceDef = document.getElementById('battle-def-dice');

    let rolls = 0;
    const interval = setInterval(() => {
        diceAtk.textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][Math.floor(Math.random() * 6)];
        diceDef.textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][Math.floor(Math.random() * 6)];
        rolls++;
        if (rolls > 10) {
            clearInterval(interval);
            finalizeBattle();
        }
    }, 100);
}

function finalizeBattle() {
    const dAtk = Math.floor(Math.random() * 6) + 1;
    const dDef = Math.floor(Math.random() * 6) + 1;

    document.getElementById('battle-atk-dice').textContent = getDiceIcon(dAtk);
    document.getElementById('battle-def-dice').textContent = getDiceIcon(dDef);

    const atkTotal = battleState.atkStrBase + dAtk;
    const defTotal = battleState.defStrBase + dDef;

    document.getElementById('battle-atk-total').textContent = `Total: ${atkTotal}`;
    document.getElementById('battle-def-total').textContent = `Total: ${defTotal}`;

    const resDiv = document.getElementById('battle-result');
    const closeBtn = document.getElementById('btn-close-battle');
    document.getElementById('btn-roll-dice').style.display = 'none';
    closeBtn.style.display = 'inline-block';

    if (atkTotal > defTotal) {
        resDiv.textContent = '🏆 ¡VICTORIA!';
        resDiv.style.color = '#2ecc71';
        // Eliminar defensor
        const enemy = currentPlayer === 'red' ? 'green' : 'red';
        getShipsAt(battleState.defKey)[enemy] = [];
        showStatus('Has ganado la batalla. Flota enemiga destruida.');
    } else if (defTotal > atkTotal) {
        resDiv.textContent = '💀 DERROTA';
        resDiv.style.color = '#e74c3c';
        // Eliminar atacante
        getShipsAt(battleState.atkKey)[currentPlayer] = [];
        showStatus('Has perdido la batalla. Tu flota ha sido destruida.');
    } else {
        resDiv.textContent = '⚖️ EMPATE - Se repite';
        resDiv.style.color = '#f5c518';
        document.getElementById('btn-roll-dice').style.display = 'inline-block';
        document.getElementById('btn-roll-dice').disabled = false;
        closeBtn.style.display = 'none';
        return; // No cerrar ni borrar, repetir
    }

    renderShips();
    updatePlanetOwnership();
    saveGame();
}

function closeBattleModal() {
    document.getElementById('battle-modal').style.display = 'none';
    battleState = null;
    document.getElementById('btn-roll-dice').disabled = false;
}

function getDiceIcon(val) {
    return ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][val - 1];
}


// ── Init ──────────────────────────────────────

function initGame() {
    if (loadGame()) {
        showStatus('Partida cargada.');
    } else {
        showStatus('Nueva partida.');
    }
    updateTurnPanel();
    renderShips();
    setupHover();
    renderPlanets();
}

function checkWinCondition() {
    // Rojo gana si ocupa 10,10 (Spawn Verde)
    if (ships['10,10'] && ships['10,10'].red.length > 0) {
        alert('🏆 ¡JUGADOR ROJO GANA LA PARTIDA! Ha conquistado la base enemiga.');
        resetGame();
        return true;
    }
    // Verde gana si ocupa 0,0 (Spawn Rojo)
    if (ships['0,0'] && ships['0,0'].green.length > 0) {
        alert('🏆 ¡JUGADOR VERDE GANA LA PARTIDA! Ha conquistado la base enemiga.');
        resetGame();
        return true;
    }
    return false;
}


// -- Tienda Modal ---------------------------------

function openShopModal() {
    document.getElementById('global-shop-modal').style.display = 'flex';
}

function closeShopModal() {
    document.getElementById('global-shop-modal').style.display = 'none';
}
