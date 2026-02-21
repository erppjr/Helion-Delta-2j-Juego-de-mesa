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
    '0,0': { type: 'main-base-red', income: 1, defaultOwner: 'red' },
    '10,10': { type: 'main-base-green', income: 1, defaultOwner: 'green' },
};

// Propietario actual de cada planeta (se actualiza cuando entran/salen naves)
// null = neutral
const planetOwnership = {};
for (const [key, p] of Object.entries(PLANETS)) {
    planetOwnership[key] = p.defaultOwner;
}


// ── Estado ────────────────────────────────────

let currentPlayer = 'red';

// Estadísticas de final de partida
let gameStats = {
    red: { shipsDestroyed: 0, planetsConquered: 0, shipsBought: 0, cardsPlayed: 0 },
    green: { shipsDestroyed: 0, planetsConquered: 0, shipsBought: 0, cardsPlayed: 0 }
};

// ships["q,r"] = { red: [{level, moved},...], green: [{level, moved},...] }
const ships = {};

let pendingShip = null;   // nave recién comprada esperando colocación
let moveState = null;   // { fromKey, selectedIndices: Set, step: 'pick'|'dest', reachable: Set }
let battleState = null;   // { fromKey, enemies: [key], step: 'select_target' | 'rolling' }
let escapeState = null;   // { player, shipToSave, validDestinations: Set }
let planetBoosts = {};    // { "q,r": number | 'infinite' }

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
            const hasBlock = data.red.some(s => (s.blockedRounds || 0) > 0);
            const maxLevel = Math.max(...data.red.map(s => s.level));
            const shipDef = SHIP_TYPES.find(t => t.level === maxLevel);
            const icon = shipDef ? shipDef.icon : '▲';

            const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            t.setAttribute('x', cx - (gc > 0 ? 12 : 0));
            t.setAttribute('y', cy + 6);
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('font-size', '16');
            t.setAttribute('font-weight', 'bold');
            t.setAttribute('fill', hasBlock ? '#e74c3c' : '#ff6b6b');
            t.setAttribute('font-family', 'Outfit, sans-serif');
            t.textContent = hasBlock ? `🔒${icon}${rc}` : `${icon}${rc}`;
            g.appendChild(t);
        }
        if (gc > 0) {
            const hasBlock = data.green.some(s => (s.blockedRounds || 0) > 0);
            const maxLevel = Math.max(...data.green.map(s => s.level));
            const shipDef = SHIP_TYPES.find(t => t.level === maxLevel);
            const icon = shipDef ? shipDef.icon : '▲';

            const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            t.setAttribute('x', cx + (rc > 0 ? 12 : 0));
            t.setAttribute('y', cy + 6);
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('font-size', '16');
            t.setAttribute('font-weight', 'bold');
            t.setAttribute('fill', hasBlock ? '#27ae60' : '#2ecc71');
            t.setAttribute('font-family', 'Outfit, sans-serif');
            t.textContent = hasBlock ? `🔒${icon}${gc}` : `${icon}${gc}`;
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
    // Si se quedó alguna carta colgando, la cerramos
    if (typeof activeCardEffect !== 'undefined' && activeCardEffect && typeof cancelCardEffect === 'function') {
        cancelCardEffect();
    }

    // Reset moved flags and pass time for blockers
    for (const key of Object.keys(ships)) {
        ships[key].red.forEach(s => {
            s.moved = false;
            s.boosted = false;
            if (currentPlayer === 'red' && s.blockedRounds > 0) s.blockedRounds--;
        });
        ships[key].green.forEach(s => {
            s.moved = false;
            s.boosted = false;
            if (currentPlayer === 'green' && s.blockedRounds > 0) s.blockedRounds--;
        });
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
    if (typeof renderCardArea === 'function') renderCardArea();
    saveGame();
}

// ── Persistencia ──────────────────────────────

function saveGame() {
    const state = {
        currentPlayer,
        ships,
        coins,
        planetOwnership,
        planetBoosts,
        cardDeck: typeof cardDeck !== 'undefined' ? cardDeck : [],
        cardDiscard: typeof cardDiscard !== 'undefined' ? cardDiscard : [],
        playerHands: typeof playerHands !== 'undefined' ? playerHands : { red: [], green: [] },
        activeCardEffect: typeof activeCardEffect !== 'undefined' ? activeCardEffect : null,
        gameStats
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
        if (state.planetBoosts) Object.assign(planetBoosts, state.planetBoosts);
        if (state.gameStats) gameStats = state.gameStats;

        // Cargar estado de cartas si existe mutando internamente sin romper punteros iniciales
        if (state.cardDeck) {
            cardDeck.splice(0, cardDeck.length, ...state.cardDeck);
        }
        if (state.cardDiscard) {
            cardDiscard.splice(0, cardDiscard.length, ...state.cardDiscard);
        }
        if (state.playerHands) {
            if (state.playerHands.red) {
                playerHands.red.splice(0, playerHands.red.length, ...state.playerHands.red);
            }
            if (state.playerHands.green) {
                playerHands.green.splice(0, playerHands.green.length, ...state.playerHands.green);
            }
        }

        if (state.activeCardEffect !== undefined) {
            activeCardEffect = state.activeCardEffect;
            if (activeCardEffect) {
                setTimeout(() => {
                    let instructionText = 'Selecciona una flota para moverla con alcance ampliado.';
                    if (activeCardEffect.effect && activeCardEffect.effect.type === 'production_boost') {
                        instructionText = 'Haz clic en un planeta de la zona neutral (coloreado) que controles.';
                    } else if (activeCardEffect.effect && activeCardEffect.effect.type === 'sabotage') {
                        instructionText = 'Haz clic en cualquier planeta con un depósito activo para volarlo por los aires.';
                    } else if (activeCardEffect.effect && activeCardEffect.effect.type === 'kamikaze') {
                        instructionText = 'Selecciona una flota tuya para lanzarla en línea recta contra el enemigo e inmolarla.';
                    }
                    showStatus(`✨ Carta "${activeCardEffect.name}" ACTIVADA. ${instructionText} <button class="move-cancel-btn" style="padding:4px 8px; margin-left:10px" onclick="cancelCardEffect()">✖ Cancelar Carta</button>`, true);
                }, 150);
            }
        }

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

        if (planet.type === 'main-base-red') {
            planetOwnership[key] = 'red'; // Inexpugnable
        } else if (planet.type === 'main-base-green') {
            planetOwnership[key] = 'green'; // Inexpugnable
        } else if (planet.type === 'home-red') {
            // Verde conquista si tiene naves; si no, rojo es dueño por defecto
            planetOwnership[key] = hasGreen ? 'green' : 'red';
        } else if (planet.type === 'home-green') {
            // Rojo conquista si tiene naves; si no, verde es dueño por defecto
            planetOwnership[key] = hasRed ? 'red' : 'green';
        } else {
            // Planetas normales/ricos: quien tenga naves lo posee; si ambos o ninguno → neutral
            const oldOwner = planetOwnership[key];
            let newOwner = null;
            if (hasRed && !hasGreen) newOwner = 'red';
            else if (hasGreen && !hasRed) newOwner = 'green';

            if (newOwner !== null && newOwner !== oldOwner && newOwner !== PLANETS[key].defaultOwner) {
                gameStats[newOwner].planetsConquered++;
            }
            planetOwnership[key] = newOwner;
        }
    }
    renderPlanets();
}

/**
 * Otorga monedas al jugador activo por sus planetas al inicio de su turno.
 */
function collectPlanetIncome() {
    let earned = 0;
    let extraEarned = 0;
    for (const [key, planet] of Object.entries(PLANETS)) {
        if (planetOwnership[key] === currentPlayer) {
            earned += planet.income;

            if (planetBoosts[key]) {
                if (planetBoosts[key] === 'infinite') {
                    extraEarned += planet.income;
                } else {
                    const amountToTake = Math.min(planet.income, planetBoosts[key]);
                    extraEarned += amountToTake;
                    planetBoosts[key] -= amountToTake;
                    if (planetBoosts[key] <= 0) {
                        delete planetBoosts[key];
                    }
                }
            }
        }
    }
    const total = earned + extraEarned;
    if (total > 0) {
        addCoins(currentPlayer, total);
        const name = currentPlayer === 'red' ? 'Rojo' : 'Verde';
        showStatus(`💰 Jugador ${name} recibe ${total} moneda(s) de sus planetas (Base: ${earned}, Extra minería: ${extraEarned}).`);
    }
    renderPlanets();
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

        // Elegir la textura según el tipo de planeta
        let imgSrc = 'assets/planets/earth.png';
        if (planet.type === 'home-red' || planet.type === 'main-base-red') imgSrc = 'assets/planets/mars.png';
        if (planet.type === 'home-green' || planet.type === 'main-base-green') imgSrc = 'assets/planets/ice.png';
        if (planet.type === 'normal') imgSrc = Math.abs(q + r) % 2 === 0 ? 'assets/planets/earth.png' : 'assets/planets/ocean.png';
        if (planet.type === 'rico') imgSrc = 'assets/planets/gas.png';

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('planet-overlay');
        g.style.pointerEvents = 'none';

        // Es importante borrar el color de fondo para que el planeta no se "tape"
        // o tintinee en amarillo si coinciden:
        if (cell.classList.contains('fixed-yellow')) {
            cell.classList.remove('fixed-yellow');
        }

        // Marco circular para el dueño (el aura)
        const aura = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        aura.setAttribute('cx', cx);
        aura.setAttribute('cy', cy);
        aura.setAttribute('r', HEX_SIZE * 1.02); // Ajustado para el nuevo tamaño intermedio
        aura.setAttribute('fill', 'none');
        aura.setAttribute('stroke', owner ? borderColor : 'rgba(255,255,255,0.1)');
        aura.setAttribute('stroke-width', owner ? '4' : '1');
        aura.setAttribute('stroke-dasharray', owner ? 'none' : '4,4');
        g.appendChild(aura);

        // Imagen vectorial del planeta (sutilmente superpuesta intermedio)
        const imgSize = HEX_SIZE * 2.10;
        const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', imgSrc);
        img.setAttribute('href', imgSrc);
        img.setAttribute('x', cx - imgSize / 2);
        img.setAttribute('y', cy - imgSize / 2);
        img.setAttribute('width', imgSize);
        img.setAttribute('height', imgSize);
        img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        // Cortar la imagen a círculo perfecto para encajar (Se recorta más adentro para devorar los bordes blancos del PNG base)
        img.style.clipPath = 'circle(49% at 50% 50%)';
        g.appendChild(img);

        if (planetBoosts[key]) {
            const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            t.setAttribute('x', cx);
            t.setAttribute('y', cy - 12);
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('font-size', '14');
            t.setAttribute('font-weight', 'bold');
            t.setAttribute('fill', '#f1c40f');
            t.setAttribute('stroke', '#000');
            t.setAttribute('stroke-width', '3');
            t.setAttribute('paint-order', 'stroke');
            t.setAttribute('font-family', 'Outfit, sans-serif');
            t.textContent = planetBoosts[key] === 'infinite' ? '+∞🪙' : `+${planetBoosts[key]}🪙`;
            g.appendChild(t);
        }

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

    let validSpawnCells = [...SPAWN_CELLS[currentPlayer]];

    // Si la carta despliegue avanzado está activa, sumamos zonas neutrales dominadas
    if (typeof activeCardEffect !== 'undefined' && activeCardEffect && activeCardEffect.effect && activeCardEffect.effect.type === 'deploy_neutral') {
        Object.keys(planetOwnership).forEach(key => {
            if (planetOwnership[key] === currentPlayer && PLANETS[key] && PLANETS[key].type === 'normal') {
                if (!validSpawnCells.includes(key)) validSpawnCells.push(key);
            }
        });
    }

    highlightCells(validSpawnCells, 'cell-highlight-spawn');
    showStatus(`Elige una casilla iluminada para desplegar ${ship.label} (💰 ${ship.cost})`);

    // Cerramos el modal de tienda automáticamente para comodidad del jugador
    if (typeof closeShopModal === 'function') closeShopModal();
}

function placePurchasedShip(key) {
    if (!pendingShip) return false;

    let validSpawnCells = [...SPAWN_CELLS[currentPlayer]];

    if (typeof activeCardEffect !== 'undefined' && activeCardEffect && activeCardEffect.effect && activeCardEffect.effect.type === 'deploy_neutral') {
        Object.keys(planetOwnership).forEach(k => {
            if (planetOwnership[k] === currentPlayer && PLANETS[k] && PLANETS[k].type === 'normal') {
                if (!validSpawnCells.includes(k)) validSpawnCells.push(k);
            }
        });
    }

    if (!debugMode && !validSpawnCells.includes(key)) {
        showStatus('❌ Compra/despliegue cancelado (fuera de rango permitido).');
        if (pendingShip && pendingShip.isFreeCard) {
            returnFreeShipCard(pendingShip.cardRef);
        }
        pendingShip = null;
        clearHighlights('cell-highlight-spawn');
        return true;
    }

    if (totalShipsAt(key) >= MAX_SHIPS_PER_CELL) {
        showStatus('❌ Despliegue cancelado (Casilla llena, máximo 5 naves).');
        if (pendingShip && pendingShip.isFreeCard) {
            returnFreeShipCard(pendingShip.cardRef);
        }
        pendingShip = null;
        clearHighlights('cell-highlight-spawn');
        return true;
    }

    addCoins(currentPlayer, -pendingShip.cost);
    getShipsAt(key)[currentPlayer].push({ level: pendingShip.level, moved: true });
    gameStats[currentPlayer].shipsBought++;

    // Consumir carta de despliegue neutral clásico si fue usada (y la nave no era ya una free_card)
    if (typeof activeCardEffect !== 'undefined' && activeCardEffect && activeCardEffect.effect && activeCardEffect.effect.type === 'deploy_neutral' && !SPAWN_CELLS[currentPlayer].includes(key)) {
        if (typeof cardDiscard !== 'undefined') cardDiscard.push(activeCardEffect.id);
        const cardName = activeCardEffect.name;
        activeCardEffect = null;
        showStatus(`🛸 Despliegue Avanzado: ${pendingShip.label} asentada en la frontera neutral con éxito. Carta consumida: ${cardName}.`);
        if (typeof renderCardArea === 'function') renderCardArea();
    } else if (pendingShip && pendingShip.isFreeCard) {
        // En caso de nave gratis normal 
        showStatus(`🚀 ¡Refuerzos gratis aterrizados! (${pendingShip.label})`);
        if (typeof renderCardArea === 'function') renderCardArea();
    }

    clearHighlights('cell-highlight-spawn');
    pendingShip = null;
    renderShips();
    updatePlanetOwnership();
    renderShopButtons();
    saveGame();
    showStatus('✅ Nave colocada.');

    if (typeof closeShopModal === 'function') closeShopModal();
    return true;
}

// ── Movement ──────────────────────────────────

function startMove(key) {
    const myShips = getShipsAt(key)[currentPlayer];
    if (myShips.length === 0) return false;

    const isBoostActive = (typeof activeCardEffect !== 'undefined' && activeCardEffect && activeCardEffect.effect && activeCardEffect.effect.type === 'movement_boost');
    const isKamikazeActive = (typeof activeCardEffect !== 'undefined' && activeCardEffect && activeCardEffect.effect && activeCardEffect.effect.type === 'kamikaze');

    const movable = myShips.filter(s => (s.blockedRounds || 0) === 0 && !s.boosted && (!s.moved || isBoostActive || isKamikazeActive));
    if (movable.length === 0) {
        showStatus('Las naves de esta casilla ya no pueden moverse (congeladas o sin impulsos).');
        return true;
    }

    moveState = { fromKey: key, selectedIndices: new Set(), step: 'pick' };
    clearHighlights('cell-selected');

    // Resaltar la casilla origen
    const [q, r] = key.split(',');
    const srcCell = document.querySelector(`.hex-cell[data-q="${q}"][data-r="${r}"]`);
    if (srcCell) srcCell.classList.add('cell-selected');

    // Auto-seleccionar todas las naves movibles
    const allIndices = myShips.map((s, i) => ((s.blockedRounds || 0) === 0 && !s.boosted && (!s.moved || isBoostActive || isKamikazeActive) ? i : -1)).filter(i => i >= 0);
    applyMoveDestination(allIndices);

    // Si hay más de 1 nave movible, mostrar botón "Dividir"
    if (movable.length > 1) {
        const panel = document.getElementById('move-panel');
        panel.innerHTML = `
          <button class="ship-buy-btn" style="width: auto; padding: 8px 16px; margin-bottom: 5px; flex-direction: row; min-height: 36px; white-space: nowrap;" onclick="openSplitModal()">✂️ Dividir flota</button>
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
    const isBoostActive = (typeof activeCardEffect !== 'undefined' && activeCardEffect && activeCardEffect.effect && activeCardEffect.effect.type === 'movement_boost');

    let rows = myShips.map((s, i) => {
        const t = shipLabel(s);
        const isBlocked = (s.blockedRounds || 0) > 0;
        const disabled = (isBlocked || s.boosted || (s.moved && !isBoostActive)) ? 'disabled' : '';
        const movedTag = isBlocked ? '<span class="tt-moved" style="color:#e74c3c; border-color:#e74c3c;">🔒 Bloqueada</span>' :
            s.boosted ? '<span class="tt-moved" style="color:#3498db;">impulsada</span>' :
                s.moved ? '<span class="tt-moved">ya movida</span>' : '';
        return `<label class="ship-pick-row ${(disabled) ? 'ship-moved' : ''}">
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
        // Si la nave ya se había movido, su velocidad base será 0 (solo la moverá la carta)
        const currentSpeed = ship.moved ? 0 : (type ? type.speed : 0);

        if (currentSpeed < minSpeed) minSpeed = currentSpeed;
    });

    let speed = minSpeed === 999 ? 1 : minSpeed;

    // Si hay una carta de mejora de movimiento activa, sumamos su valor
    // Si hay una carta de mejora de movimiento activa o si es un Kamikaze (alcance máximo de la carta), sobrescribimos la velocidad.
    if (typeof activeCardEffect !== 'undefined' && activeCardEffect && activeCardEffect.effect) {
        if (activeCardEffect.effect.type === 'movement_boost') {
            speed += activeCardEffect.effect.value;
        } else if (activeCardEffect.effect.type === 'kamikaze') {
            speed = activeCardEffect.effect.range;
        }
    }

    return speed;
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

function calculateLineCells(startKey, range) {
    const reachable = new Set();
    const [sq, sr] = startKey.split(',').map(Number);

    // Vectores de dirección hexagonal (q, r)
    const dirs = [
        [1, 0], [1, -1], [0, -1],
        [-1, 0], [-1, 1], [0, 1]
    ];

    dirs.forEach(dir => {
        for (let i = 1; i <= range; i++) {
            const dq = sq + dir[0] * i;
            const dr = sr + dir[1] * i;
            const key = `${dq},${dr}`;

            // Si la celda no existe en el mapa paramos el rayo
            if (!document.querySelector(`.hex-cell[data-q="${dq}"][data-r="${dr}"]`)) break;

            // Para el Kamikaze, podemos pasar/aterrizar sobre naves enemigas.
            // Si estuviéramos programando líneas de visión que se bloquean por planetas inexpugnables, aquí se pondría el break;
            reachable.add(key);
        }
    });

    return reachable;
}

// ── Confirm Move ──────────────────────────────

function applyMoveDestination(indices) {
    moveState.selectedIndices = new Set(indices);
    moveState.step = 'dest';

    const isKamikazeActive = (typeof activeCardEffect !== 'undefined' && activeCardEffect && activeCardEffect.effect && activeCardEffect.effect.type === 'kamikaze');

    const speed = getFleetSpeed(indices, moveState.fromKey);
    const reachable = isKamikazeActive ? calculateLineCells(moveState.fromKey, speed) : calculateReachableCells(moveState.fromKey, speed);
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
    const isKamikazeActive = (typeof activeCardEffect !== 'undefined' && activeCardEffect && activeCardEffect.effect && activeCardEffect.effect.type === 'kamikaze');
    const enemy = currentPlayer === 'red' ? 'green' : 'red';
    const hasEnemy = getShipsAt(destKey)[enemy].length > 0;

    if (!isKamikazeActive && freeSlots === 0) {
        showStatus('¡Casilla destino llena!');
        return true;
    }

    const myShips = getShipsAt(moveState.fromKey)[currentPlayer];
    const indices = [...moveState.selectedIndices].sort((a, b) => b - a); // mayor a menor para splice seguro

    // Para Kamikaze ignoramos los slots libres ya que la nave se inmolará.
    const maxToMove = isKamikazeActive ? indices.length : freeSlots;
    const toMove = indices.slice(0, maxToMove).map(i => myShips[i]);

    // Quitar del origen (de mayor índice a menor)
    indices.slice(0, maxToMove).sort((a, b) => b - a).forEach(i => myShips.splice(i, 1));

    const isBoostActive = (typeof activeCardEffect !== 'undefined' && activeCardEffect && activeCardEffect.effect && activeCardEffect.effect.type === 'movement_boost');

    // Resolución de Inmolación Kamikaze
    if (isKamikazeActive) {
        // Descartar la carta jugada
        if (typeof cardDiscard !== 'undefined') cardDiscard.push(activeCardEffect.id);
        const cardName = activeCardEffect.name;
        activeCardEffect = null;

        // Sumamos las bajas a nuestro oponente (porque nos hemos inmolado)
        gameStats[enemy].shipsDestroyed += toMove.length;

        if (hasEnemy) {
            const enemyShips = getShipsAt(destKey)[enemy];
            const probability = Math.min(enemyShips.length / 6, 5 / 6);

            if (Math.random() <= probability) {
                // Éxito: destruir nave aleatoria enemiga
                const targetIdx = Math.floor(Math.random() * enemyShips.length);
                enemyShips.splice(targetIdx, 1);
                gameStats[currentPlayer].shipsDestroyed++;

                showStatus(`🔥 ¡IMPACTO KAMIKAZE! ${toMove.length} de tus naves se inmolaron, destruyendo 1 nave rival en el asalto (${(probability * 100).toFixed(0)}% éxito). Carta: ${cardName}.`);
            } else {
                showStatus(`🧨 Kamikaze fallido: Tus ${toMove.length} naves se estrellaron sin llevarse por delante al enemigo. Carta: ${cardName}.`);
            }
        } else {
            showStatus(`💨 Kamikaze malgastado: La nave se auto-destruyó en el vacío espacial. Carta: ${cardName}.`);
        }

    } else {
        // Movimiento ordinario: Añadir al destino marcadas como ya movidas y/o impulsadas
        const dest = getShipsAt(destKey)[currentPlayer];
        toMove.forEach(s => dest.push({ level: s.level, moved: true, boosted: isBoostActive ? true : (s.boosted || false) }));
    }

    clearHighlights('cell-highlight-move');
    clearHighlights('cell-selected');
    moveState = null;
    const panel = document.getElementById('move-panel');
    if (panel) { panel.style.display = 'none'; panel.innerHTML = ''; }

    // Consumir carta de movimiento activa
    if (typeof activeCardEffect !== 'undefined' && activeCardEffect && activeCardEffect.effect && activeCardEffect.effect.type === 'movement_boost') {
        if (typeof cardDiscard !== 'undefined') cardDiscard.push(activeCardEffect.id);
        const cardName = activeCardEffect.name;
        activeCardEffect = null;
        showStatus(`✅ ${toMove.length} nave(s) movidas a (${destKey}). ☄ Carta consumida: ${cardName}.`);
        if (typeof renderCardArea === 'function') renderCardArea();
    } else {
        showStatus(`✅ ${toMove.length} nave(s) movidas a (${destKey}).`);
    }

    renderShips();
    updatePlanetOwnership();
    saveGame();

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
    if (pendingShip && pendingShip.isFreeCard) {
        returnFreeShipCard(pendingShip.cardRef);
    }

    moveState = null;
    pendingShip = null;
    clearHighlights('cell-highlight-move');
    clearHighlights('cell-highlight-spawn');
    clearHighlights('cell-selected');

    // Si cancela, devolvemos la carta activa a la mano a menos que se trate del turno militar del rival
    if (typeof activeCardEffect !== 'undefined' && activeCardEffect && typeof cancelCardEffect === 'function' && activeCardEffect.owner === currentPlayer) {
        cancelCardEffect();
    }

    const modal = document.getElementById('move-modal');
    if (modal) { modal.style.display = 'none'; modal.innerHTML = ''; }
    const panel = document.getElementById('move-panel');
    if (panel) { panel.style.display = 'none'; panel.innerHTML = ''; }
    showStatus('');
}

function returnFreeShipCard(cardId) {
    // Si cancelamos la colocación de la nave gratuita, recuperamos la carta desde el descarte a la mano
    if (typeof cardDiscard !== 'undefined' && typeof playerHands !== 'undefined') {
        const discardIdx = cardDiscard.indexOf(cardId);
        if (discardIdx !== -1) {
            // Eliminar del descarte
            cardDiscard.splice(discardIdx, 1);

            // Buscar la carta original en el mazo base para reciclarla
            const originalCard = typeof CARD_DECK_DEF !== 'undefined' ? CARD_DECK_DEF.find(c => c.id === cardId) : null;
            if (originalCard) {
                playerHands[currentPlayer].push({ ...originalCard, owner: currentPlayer });
                if (typeof renderCardArea === 'function') renderCardArea();
                saveGame();
            }
        }
    }
}

// ── Status ────────────────────────────────────

function showStatus(msg, isHTML = false) {
    const el = document.getElementById('game-status');
    if (!el) return;
    if (isHTML) {
        el.innerHTML = msg;
    } else {
        el.textContent = msg;
    }
}

// ── Click handler ─────────────────────────────

let debugMode = false;
let debugSelectMode = false;

function toggleDebugSelect() {
    debugSelectMode = !debugSelectMode;
    const btn = document.getElementById('btn-debug-select');
    if (debugSelectMode) {
        btn.classList.add('debug-active');
        showStatus('🌸 Selección Rosa activada');
    } else {
        btn.classList.remove('debug-active');
        showStatus('🌸 Selección Rosa desactivada');
        // Limpiar selección rosa al salir
        document.querySelectorAll('.hex-cell.selected').forEach(el => {
            el.classList.remove('selected');
            const key = `${el.dataset.q},${el.dataset.r}`;
            const fc = getFixedClass(key);
            if (fc) el.classList.add(fc);
        });
    }
}

function toggleDebugMode() {
    debugMode = !debugMode;
    const btn = document.getElementById('btn-debug');

    // Botones adicionales de debug
    const tools = [
        document.getElementById('btn-export'),
        document.getElementById('btn-clear'),
        document.getElementById('btn-debug-select'),
        document.getElementById('btn-debug-card')
    ];

    // Botones de monedas
    const coinBtns = document.querySelectorAll('.coin-btn');

    if (debugMode) {
        btn.textContent = '🔴 Salir de Debug';
        btn.classList.add('debug-active');
        cancelMove();
        showStatus('🛠 Modo debug: colocación infinita, casillas rosas, monedas y cartas gratis.');

        tools.forEach(t => t && (t.style.display = 'inline-block'));
        coinBtns.forEach(b => b.style.display = 'inline-block');

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

        tools.forEach(t => t && (t.style.display = 'none'));
        coinBtns.forEach(b => b.style.display = 'none');
    }
}

function debugGiveCard() {
    if (!debugMode) return;

    if (typeof playerHands === 'undefined' || typeof CARD_DECK_DEF === 'undefined') {
        showStatus('❌ Sistema de cartas no disponible.');
        return;
    }

    const hand = playerHands[currentPlayer];
    if (hand.length >= 6) {
        showStatus('⚠️ Mano llena (6 cartas max). Borra o usa una antes.');
        return;
    }

    // Damos una carta aleatoria del deck de test
    const randomCard = CARD_DECK_DEF[Math.floor(Math.random() * CARD_DECK_DEF.length)];
    hand.push({ ...randomCard });

    if (typeof renderCardArea === 'function') renderCardArea();
    showStatus(`🃏 Añadida carta de debug: ${randomCard.name}`);
    saveGame();
}

function onGameCellClick(key) {
    // Modo selección de escape activo
    if (escapeState) {
        if (!escapeState.validDestinations.has(key)) {
            showStatus('Debes huir a una de las casillas resaltadas en azul.');
            return;
        }
        if (totalShipsAt(key) >= MAX_SHIPS_PER_CELL) {
            showStatus('Casilla llena. Elige otra.');
            return;
        }

        // Ejecutar fuga
        const dest = getShipsAt(key)[escapeState.player];
        dest.push({ level: escapeState.shipToSave.level, moved: true, boosted: true });

        clearHighlights('cell-highlight-move');
        escapeState = null;
        renderShips();
        updatePlanetOwnership();
        saveGame();
        showStatus('Nave salvada con éxito. Continúa el juego.');
        return;
    }

    // Modo debug: toggle rosa
    if (debugSelectMode) {
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

    // Manejar uso de carta económica o sabotaje
    if (typeof activeCardEffect !== 'undefined' && activeCardEffect) {
        if (activeCardEffect.effect && activeCardEffect.effect.type === 'production_boost') {
            if (!PLANETS[key] || PLANETS[key].type.startsWith('home-')) {
                if (typeof cancelCardEffect === 'function') cancelCardEffect('⚠️ Acción cancelada: Debes usar el potenciador en un planeta de la zona neutral (gris o central).');
                return;
            }
            if (planetOwnership[key] !== currentPlayer) {
                if (typeof cancelCardEffect === 'function') cancelCardEffect('⚠️ Acción cancelada: Debes controlar el planeta (tener naves ahí) para instalar el potenciador.');
                return;
            }

            const income = PLANETS[key].income;
            const r = activeCardEffect.effect.value;

            if (r === 'infinite') {
                planetBoosts[key] = 'infinite';
            } else {
                const boostVal = (r * income) + 3;
                let current = planetBoosts[key];
                if (current === 'infinite') current = 0;
                planetBoosts[key] = (current || 0) + boostVal;
            }

            if (typeof cardDiscard !== 'undefined') cardDiscard.push(activeCardEffect.id);
            const cardName = activeCardEffect.name;
            activeCardEffect = null;
            showStatus(`✅ Potenciador "${cardName}" instalado en el planeta. Producción duplicada activa.`);
            renderPlanets();
            if (typeof renderCardArea === 'function') renderCardArea();
            saveGame();
            return;
        }

        if (activeCardEffect.effect && activeCardEffect.effect.type === 'sabotage') {
            if (!planetBoosts[key]) {
                if (typeof cancelCardEffect === 'function') cancelCardEffect('⚠️ Acción cancelada: Ese planeta no tiene ningún depósito de monedas activo para sabotear.');
                return;
            }
            if (planetOwnership[key] === currentPlayer) {
                if (typeof cancelCardEffect === 'function') cancelCardEffect('⚠️ Acción cancelada: No puedes sabotear tu propia economía. ¡Sería un desperdicio!');
                return;
            }

            delete planetBoosts[key];
            if (typeof cardDiscard !== 'undefined') cardDiscard.push(activeCardEffect.id);
            const cardName = activeCardEffect.name;
            activeCardEffect = null;
            showStatus(`💥 Sabotaje "${cardName}" con éxito. El depósito de monedas enemigo ha sido destruido.`);
            renderPlanets();
            if (typeof renderCardArea === 'function') renderCardArea();
            saveGame();
            return;
        }

        if (activeCardEffect.effect && activeCardEffect.effect.type === 'ship_block') {
            const enemy = currentPlayer === 'red' ? 'green' : 'red';
            const enemyShips = getShipsAt(key)[enemy];

            if (enemyShips.length === 0) {
                if (typeof cancelCardEffect === 'function') cancelCardEffect('⚠️ Acción cancelada: No hay naves enemigas en esta casilla para bloquear.');
                return;
            }

            const duration = activeCardEffect.effect.duration;
            enemyShips.forEach(s => {
                s.blockedRounds = (s.blockedRounds || 0) + duration;
            });

            if (typeof cardDiscard !== 'undefined') cardDiscard.push(activeCardEffect.id);
            const cardName = activeCardEffect.name;
            activeCardEffect = null;
            showStatus(`🔒 Guerra electrónica instalada. La flota enemiga en (${key}) ha sido inhabilitada por ${duration} ronda(s).`);
            renderShips();
            if (typeof renderCardArea === 'function') renderCardArea();
            saveGame();
            return;
        }

        if (activeCardEffect.effect && activeCardEffect.effect.type === 'anti_block') {
            const myShips = getShipsAt(key)[currentPlayer];
            const blockedShips = myShips.filter(s => s.blockedRounds > 0);

            if (blockedShips.length === 0) {
                if (typeof cancelCardEffect === 'function') cancelCardEffect('⚠️ Acción cancelada: No tienes naves bloqueadas en esta casilla que necesiten purga.');
                return;
            }

            myShips.forEach(s => {
                s.blockedRounds = 0;
            });

            if (typeof cardDiscard !== 'undefined') cardDiscard.push(activeCardEffect.id);
            const cardName = activeCardEffect.name;
            activeCardEffect = null;
            showStatus(`🔓 Desencriptación "${cardName}" exitosa. Tu flota en (${key}) recupera la movilidad total.`);
            renderShips();
            if (typeof renderCardArea === 'function') renderCardArea();
            saveGame();
            return;
        }
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
    const moveStarted = startMove(key);

    // Si intentaste jugar una carta pero clickaste en el vacío o naves sin permiso, 
    // abortamos y te devolvemos la carta a la mano.
    if (!moveStarted && typeof activeCardEffect !== 'undefined' && activeCardEffect) {
        if (typeof cancelCardEffect === 'function') {
            cancelCardEffect('⚠️ Acción cancelada: Casilla inválida para el uso de esta carta.');
        }
    }
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
    battleState.atkStrBoost = 0;
    battleState.defStrBoost = 0;

    // Abrir Modal
    const modal = document.getElementById('battle-modal');
    modal.style.display = 'flex';

    updateBattleUI();
    renderBattleCards();

    document.getElementById('battle-atk-total').textContent = 'Total: ?';
    document.getElementById('battle-def-total').textContent = 'Total: ?';
    document.getElementById('battle-result').textContent = '¡Tira los dados!';
    document.getElementById('battle-result').style.color = '#fff';

    document.getElementById('btn-roll-dice').style.display = 'inline-block';
    document.getElementById('btn-close-battle').style.display = 'none';
    document.getElementById('btn-roll-dice').disabled = false;
}

function updateBattleUI() {
    const finalAtk = battleState.atkStrBase + battleState.atkStrBoost;
    const finalDef = battleState.defStrBase + battleState.defStrBoost;
    document.getElementById('battle-atk-str').textContent = `Fuerza: ${finalAtk}`;
    document.getElementById('battle-def-str').textContent = `Fuerza: ${finalDef}`;
}

function renderBattleCards() {
    const atkContainer = document.getElementById('battle-atk-cards');
    const defContainer = document.getElementById('battle-def-cards');
    if (!atkContainer || !defContainer) return;

    atkContainer.innerHTML = '';
    defContainer.innerHTML = '';

    const enemy = currentPlayer === 'red' ? 'green' : 'red';

    // Rellenamos cartas del atacante
    const atkHand = playerHands[currentPlayer] || [];
    atkHand.forEach((card, idx) => {
        if (card.effect && card.effect.type === 'combat_boost') {
            const btn = document.createElement('button');
            btn.className = 'battle-card-btn';
            btn.innerHTML = `+${card.effect.value} F<br><span style="font-size:0.6rem; font-weight:normal;">${card.name}</span>`;
            btn.onclick = () => playCombatCard('atk', idx, card);
            atkContainer.appendChild(btn);
        }
    });

    // Rellenamos cartas del defensor
    const defHand = playerHands[enemy] || [];
    defHand.forEach((card, idx) => {
        if (card.effect && card.effect.type === 'combat_boost') {
            const btn = document.createElement('button');
            btn.className = 'battle-card-btn def';
            btn.innerHTML = `+${card.effect.value} F<br><span style="font-size:0.6rem; font-weight:normal;">${card.name}</span>`;
            btn.onclick = () => playCombatCard('def', idx, card);
            defContainer.appendChild(btn);
        }
    });
}

function playCombatCard(side, cardIdx, card) {
    const isAtk = side === 'atk';
    const player = isAtk ? currentPlayer : (currentPlayer === 'red' ? 'green' : 'red');

    // Quitar la carta de la mano del usuario y lanzarla al descarte general
    playerHands[player].splice(cardIdx, 1);
    if (typeof cardDiscard !== 'undefined') {
        cardDiscard.push(card);
    }

    // Aplicar los puntos de Fuerza extra a la batalla
    if (isAtk) {
        battleState.atkStrBoost += card.effect.value;
    } else {
        battleState.defStrBoost += card.effect.value;
    }

    updateBattleUI();
    renderBattleCards();
    if (typeof renderCardArea === 'function') renderCardArea(); // Actualiza inventario de interfaz
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

    const atkTotal = battleState.atkStrBase + battleState.atkStrBoost + dAtk;
    const defTotal = battleState.defStrBase + battleState.defStrBoost + dDef;

    document.getElementById('battle-atk-total').textContent = `Total: ${atkTotal}`;
    document.getElementById('battle-def-total').textContent = `Total: ${defTotal}`;

    const resDiv = document.getElementById('battle-result');
    const closeBtn = document.getElementById('btn-close-battle');
    document.getElementById('btn-roll-dice').style.display = 'none';
    closeBtn.style.display = 'inline-block';

    if (atkTotal > defTotal) {
        resDiv.textContent = '🏆 ¡VICTORIA!';
        resDiv.style.color = '#2ecc71';

        const winner = currentPlayer; // atacante
        const enemy = winner === 'red' ? 'green' : 'red';
        const winnerHand = playerHands[winner];
        const stealIdx = winnerHand.findIndex(c => c.effect && c.effect.type === 'steal_ship');

        if (stealIdx !== -1 && getShipsAt(battleState.defKey)[enemy].length > 0) {
            handleStealShipPrompt(battleState.defKey, enemy, stealIdx, winner);
        } else {
            const escaped = handleFleetDestruction(battleState.defKey, enemy);
            showStatus(escaped ? `¡Ganaste! La flota explotó pero el enemigo evacuó una nave salvífica. ${enemy === 'red' ? 'Rojo' : 'Verde'} debe reubicarla (casillas azules).` : 'Has ganado la batalla.');
        }

    } else if (defTotal > atkTotal) {
        resDiv.textContent = '💀 DERROTA';
        resDiv.style.color = '#e74c3c';

        const winner = currentPlayer === 'red' ? 'green' : 'red'; // defensor
        const enemy = currentPlayer;
        const winnerHand = playerHands[winner];
        const stealIdx = winnerHand.findIndex(c => c.effect && c.effect.type === 'steal_ship');

        if (stealIdx !== -1 && getShipsAt(battleState.atkKey)[enemy].length > 0) {
            handleStealShipPrompt(battleState.atkKey, enemy, stealIdx, winner);
        } else {
            const escaped = handleFleetDestruction(battleState.atkKey, enemy);
            showStatus(escaped ? `Has perdido la batalla, ¡pero rescataste una cápsula de escape! Cierra la batalla y salva tu nave haciendo clic en tu rango de huida azul.` : 'Has perdido la batalla.');
        }
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

let pendingSteal = null;

function handleStealShipPrompt(key, losingPlayer, cardIdx, winningPlayer) {
    const fleet = getShipsAt(key)[losingPlayer];
    pendingSteal = { key, losingPlayer, cardIdx, winningPlayer };

    const container = document.getElementById('steal-ships-container');
    container.innerHTML = '';

    fleet.forEach((ship, idx) => {
        const type = SHIP_TYPES.find(t => t.level === ship.level);
        const btn = document.createElement('button');
        btn.className = 'battle-card-btn def';
        btn.innerHTML = `<span style="font-size:1.5rem">${type ? type.icon : '🚀'}</span><br>${type ? type.label : 'Nave'} (NV ${ship.level})`;
        btn.onclick = () => selectStealShip(idx);
        container.appendChild(btn);
    });

    document.getElementById('steal-modal').style.display = 'flex';
}

function selectStealShip(shipIdx) {
    if (!pendingSteal) return;
    const { key, losingPlayer, cardIdx, winningPlayer } = pendingSteal;

    const fleet = getShipsAt(key)[losingPlayer];
    const [stolenShip] = fleet.splice(shipIdx, 1);

    // Add to winner
    getShipsAt(key)[winningPlayer].push({ level: stolenShip.level, moved: true, boosted: false });

    // Consumir carta
    if (typeof playerHands !== 'undefined') {
        const [card] = playerHands[winningPlayer].splice(cardIdx, 1);
        if (typeof cardDiscard !== 'undefined') cardDiscard.push(card.id);
    }

    // Destrucción del resto
    const escaped = handleFleetDestruction(key, losingPlayer);
    if (!escaped) {
        showStatus(`¡Nave enemiga robada con éxito! El resto de la flota fue masacrada.`);
    } else {
        showStatus(`Robaste una nave enemiga. El resto de la flota explotó, pero evacuaron una cápsula.`);
    }

    document.getElementById('steal-modal').style.display = 'none';
    pendingSteal = null;
    renderShips();
    updatePlanetOwnership();
    if (typeof renderCardArea === 'function') renderCardArea();
    saveGame();
}

function cancelStealShip() {
    if (!pendingSteal) return;
    const { key, losingPlayer } = pendingSteal;

    const escaped = handleFleetDestruction(key, losingPlayer);
    showStatus(escaped ? `Rechazaste el botín de guerra. El enemigo evacuó una nave salvífica.` : 'Batalla concluida totalmente. El enemigo ha sido ejecutado sin robos.');

    document.getElementById('steal-modal').style.display = 'none';
    pendingSteal = null;
    renderShips();
    updatePlanetOwnership();
    saveGame();
}

function handleFleetDestruction(key, losingPlayer) {
    const fleet = getShipsAt(key)[losingPlayer];
    const killCount = fleet.length;
    const winningPlayer = losingPlayer === 'red' ? 'green' : 'red';

    // Probabilidad subida a 2/6 por petición del usuario (33.3% de escape)
    const miracle = (killCount > 0) && (Math.random() < 2 / 6);

    if (miracle) {
        // Elegimos una nave al azar para que se salve
        const survivorIdx = Math.floor(Math.random() * fleet.length);
        const survivor = fleet[survivorIdx];

        // Calculamos rango de escape de 2
        const reachable = calculateReachableCells(key, 2);

        if (reachable.size > 0) {
            escapeState = {
                player: losingPlayer,
                shipToSave: survivor,
                validDestinations: reachable
            };

            // Borramos la flota original
            fleet.splice(0, fleet.length);
            highlightCells(Array.from(reachable), 'cell-highlight-move');
            gameStats[winningPlayer].shipsDestroyed += (killCount - 1);
            return true; // No borramos la instancia general porque la nave está fugitiva en RAM
        }
    }

    // Muerte normal
    fleet.splice(0, fleet.length);
    gameStats[winningPlayer].shipsDestroyed += killCount;
    return false;
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
        if (typeof renderCardArea === 'function') renderCardArea();
    } else {
        showStatus('Nueva partida.');
        if (typeof initCards === 'function') initCards();
    }

    // Forzar actualización visual de monedas desde el estado cargado/inicializado
    if (document.getElementById('coins-red')) document.getElementById('coins-red').textContent = coins.red;
    if (document.getElementById('coins-green')) document.getElementById('coins-green').textContent = coins.green;

    updateTurnPanel();
    renderShips();
    setupHover();
    renderPlanets();
}

function checkWinCondition() {
    // Rojo gana si ocupa 10,10 (Spawn Verde)
    if (ships['10,10'] && ships['10,10'].red.length > 0) {
        showGameOverModal('red');
        return true;
    }
    // Verde gana si ocupa 0,0 (Spawn Rojo)
    if (ships['0,0'] && ships['0,0'].green.length > 0) {
        showGameOverModal('green');
        return true;
    }
    return false;
}

function showGameOverModal(winner) {
    const modal = document.getElementById('game-over-modal');
    if (!modal) return;

    // Título y Nombre
    const title = document.getElementById('go-winner-title');
    const subtitle = document.getElementById('go-winner-subtitle');

    if (winner === 'red') {
        title.textContent = '🏆 JUGADOR ROJO GANA 🏆';
        title.style.color = '#ff4444';
        subtitle.textContent = 'Ha conquistado la base enemiga y domina Helion Delta.';
    } else {
        title.textContent = '🏆 JUGADOR VERDE GANA 🏆';
        title.style.color = '#2ecc71';
        subtitle.textContent = 'Ha conquistado la base enemiga y domina Helion Delta.';
    }

    // Inyectar datos estadisticos - Rojo
    document.getElementById('go-red-kills').textContent = gameStats.red.shipsDestroyed;
    document.getElementById('go-red-planets').textContent = gameStats.red.planetsConquered;
    document.getElementById('go-red-buys').textContent = gameStats.red.shipsBought;
    document.getElementById('go-red-cards').textContent = gameStats.red.cardsPlayed;

    // Inyectar datos estadisticos - Verde
    document.getElementById('go-green-kills').textContent = gameStats.green.shipsDestroyed;
    document.getElementById('go-green-planets').textContent = gameStats.green.planetsConquered;
    document.getElementById('go-green-buys').textContent = gameStats.green.shipsBought;
    document.getElementById('go-green-cards').textContent = gameStats.green.cardsPlayed;

    // Eliminar el guardado automático para que no recargue en la victoria
    localStorage.removeItem('hexGameState');

    // Mostrar el modal
    modal.style.display = 'flex';
}


// -- Tienda Modal ---------------------------------

function openShopModal() {
    document.getElementById('global-shop-modal').style.display = 'flex';
}

function closeShopModal() {
    document.getElementById('global-shop-modal').style.display = 'none';
}
