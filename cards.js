/* =============================================
   HELION DELTA – cards.js
   Sistema de cartas de habilidades
   ============================================= */

// ── Definición del mazo ───────────────────────
// Cada carta: { id, name, description, effect }
// 'effect' es el identificador para la mecánica (TBD = por implementar)

const CARD_DECK_DEF = [
    {
        id: 'c01',
        name: '⚡ Impulso de Emergencia',
        description: 'Una de tus naves puede moverse de nuevo este turno, aunque ya se haya movido.',
        effect: 'extra_move',
    },
    {
        id: 'c02',
        name: '🛡 Escudo Deflector',
        description: 'Añade +2 a tu valor de defensa en la próxima batalla en la que participes.',
        effect: 'def_bonus',
    },
    {
        id: 'c03',
        name: '⚔️ Ataque Sorpresa',
        description: 'Añade +3 a tu valor de ataque en la próxima batalla que inicies.',
        effect: 'atk_bonus',
    },
    {
        id: 'c04',
        name: '💰 Contrabando',
        description: 'Gana 4 monedas de inmediato.',
        effect: 'gain_coins',
    },
    {
        id: 'c05',
        name: '🌌 Salto Cuántico',
        description: 'Mueve una de tus naves a cualquier casilla del tablero, ignorando el rango de movimiento.',
        effect: 'teleport',
    },
    {
        id: 'c06',
        name: '🔧 Reparación de Campo',
        description: 'Recupera una nave destruida en la última batalla y colócala en tu zona de spawn.',
        effect: 'revive_ship',
    },
    {
        id: 'c07',
        name: '📡 Interferencia',
        description: 'El rival pierde su próximo turno de ingresos de planetas.',
        effect: 'block_income',
    },
    {
        id: 'c08',
        name: '🚀 Propulsores Mejorados',
        description: 'Todas tus naves tienen +1 de velocidad durante este turno.',
        effect: 'speed_boost',
    },
    {
        id: 'c09',
        name: '🕵️ Reconocimiento',
        description: 'Mira las 3 primeras cartas del mazo. Puedes descartarlas o dejarlas.',
        effect: 'scout_deck',
    },
    {
        id: 'c10',
        name: '💣 Mina Espacial',
        description: 'Coloca una mina en una casilla adyacente a una nave rival. La primera nave que pase pierde la batalla automáticamente.',
        effect: 'mine',
    },
    {
        id: 'c11',
        name: '🌠 Nebulosa Protectora',
        description: 'Durante este turno, tus naves no pueden ser atacadas por naves rivales.',
        effect: 'invulnerable',
    },
    {
        id: 'c12',
        name: '🏴‍☠️ Saqueo',
        description: 'Roba 2 monedas directamente del saldo rival.',
        effect: 'steal_coins',
    },
];

// ── Estado en partida ─────────────────────────

let cardDeck = [];   // ids barajados pendientes de ser comprados
let cardDiscard = [];   // ids de cartas vendidas/usadas
const playerHands = { red: [], green: [] };
// playerHands[player] = array de objetos carta (copias de CARD_DECK_DEF)

const CARD_BUY_COST = 3;
const CARD_SELL_VALUE = 1;
const MAX_HAND_SIZE = 6;

// ── Helpers ───────────────────────────────────

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function findCardDef(id) {
    return CARD_DECK_DEF.find(c => c.id === id) || null;
}

// ── Init ──────────────────────────────────────

function initCards() {
    cardDeck = shuffleArray(CARD_DECK_DEF.map(c => c.id));
    cardDiscard = [];
    playerHands.red = [];
    playerHands.green = [];
    renderCardArea();
}

// ── Reciclado del mazo ────────────────────────
// Si el mazo está vacío, baraja las cartas descartadas y recicla.
// Las cartas que están en las manos de los jugadores no se tocan.

function recycleIfNeeded() {
    if (cardDeck.length > 0) return;
    if (cardDiscard.length === 0) return; // no hay nada que reciclar
    cardDeck = shuffleArray([...cardDiscard]);
    cardDiscard = [];
}

// ── Compra ────────────────────────────────────

function buyCard() {
    const hand = playerHands[currentPlayer];
    if (hand.length >= MAX_HAND_SIZE) {
        showStatus('¡Mano llena! Vende una carta antes de comprar.');
        return;
    }
    if (coins[currentPlayer] < CARD_BUY_COST) {
        showStatus('No tienes suficientes monedas para comprar una carta.');
        return;
    }
    recycleIfNeeded();
    if (cardDeck.length === 0) {
        showStatus('El mazo está vacío y no hay cartas que reciclar.');
        return;
    }

    const cardId = cardDeck.pop();
    const cardDef = findCardDef(cardId);
    if (!cardDef) return;

    addCoins(currentPlayer, -CARD_BUY_COST);
    hand.push({ ...cardDef });

    const playerName = currentPlayer === 'red' ? 'Rojo' : 'Verde';
    showStatus(`🃏 Jugador ${playerName} compró: "${cardDef.name}"`);
    renderCardArea();
    saveGame();
}

// ── Carta Gratis (Batalla) ────────────────────

function grantFreeCard(player) {
    const hand = playerHands[player];
    recycleIfNeeded();
    if (cardDeck.length === 0) return; // Mazo y descartes vacíos, no da carta

    const cardId = cardDeck.pop();
    const cardDef = findCardDef(cardId);
    if (!cardDef) return;

    hand.push({ ...cardDef });
    console.log(`Jugador ${player} ganó una carta extra por victoria: ${cardDef.name}`);
    renderCardArea();
    // No llamamos saveGame() aquí porque game.js ya lo llamará tras finalizar la batalla
}

// ── Venta ─────────────────────────────────────

function sellCard(player, cardId) {
    if (player !== currentPlayer) return; // solo en tu turno
    const hand = playerHands[player];
    const idx = hand.findIndex(c => c.id === cardId);
    if (idx === -1) return;

    const [card] = hand.splice(idx, 1);
    cardDiscard.push(card.id);
    addCoins(player, CARD_SELL_VALUE);

    showStatus(`💸 Carta "${card.name}" vendida por ${CARD_SELL_VALUE} moneda.`);
    renderCardArea();
    saveGame();
}

// ── Jugar carta (stub) ────────────────────────

function playCard(player, cardId) {
    if (player !== currentPlayer) return;
    const hand = playerHands[player];
    const card = hand.find(c => c.id === cardId);
    if (!card) return;
    // TODO: implementar efectos individuales según card.effect
    showStatus(`[WIP] Efecto de "${card.name}" aún no implementado.`);
}

// ── Render ────────────────────────────────────

function renderCardArea() {
    renderBuyButton();
    renderPlayerHand('red');
    renderPlayerHand('green');
}

function renderBuyButton() {
    const btn = document.getElementById('btn-buy-card');
    if (!btn) return;

    recycleIfNeeded(); // recalcula estado antes de renderizar

    const hand = playerHands[currentPlayer];
    const handFull = hand.length >= MAX_HAND_SIZE;
    const noFunds = coins[currentPlayer] < CARD_BUY_COST;
    const deckEmpty = cardDeck.length === 0 && cardDiscard.length === 0;

    btn.disabled = handFull || noFunds || deckEmpty;

    const cardsLeft = cardDeck.length + cardDiscard.length;
    if (deckEmpty) {
        btn.textContent = '🂠 Mazo agotado';
    } else if (handFull) {
        btn.textContent = `🂠 Mano llena (${hand.length}/${MAX_HAND_SIZE})`;
    } else {
        btn.textContent = `🂠 Comprar carta — ${CARD_BUY_COST}💰  (${cardsLeft} restantes)`;
    }
}

function renderPlayerHand(player) {
    const container = document.getElementById(`hand-${player}`);
    if (!container) return;

    const countSpan = document.getElementById(`hand-count-${player}`);
    if (countSpan) countSpan.textContent = playerHands[player].length;

    const hand = playerHands[player];
    const isActive = player === currentPlayer;

    if (hand.length === 0) {
        container.innerHTML = `<span class="hand-empty">Sin cartas</span>`;
        return;
    }

    if (!isActive) {
        container.innerHTML = hand.map(() => `
            <div class="hand-card card-back" title="Carta del oponente">
                <div class="card-back-icon">🂠</div>
            </div>
        `).join('');
        return;
    }

    container.innerHTML = hand.map(card => {
        // Extraemos el primer caracter (el emoji/icono)
        const icon = card.name.split(' ')[0] || '🂠';
        return `
        <div class="hand-card-mini" onclick="openCardModal('${player}', '${card.id}')" data-tooltip="${card.name}\n\n${card.description}">
            ${icon}
        </div>
        `;
    }).join('');
}

// ── Interfaz Modal ────────────────────────────

let activeCardModal = null; // { player, cardId }

function openCardModal(player, cardId) {
    if (player !== currentPlayer) return; // Solo el propietario puede abrirla

    const hand = playerHands[player];
    const card = hand.find(c => c.id === cardId);
    if (!card) return;

    activeCardModal = { player, cardId };

    document.getElementById('cm-title').textContent = card.name;
    document.getElementById('cm-desc').textContent = card.description;

    const btnPlay = document.getElementById('cm-btn-play');
    const btnSell = document.getElementById('cm-btn-sell');

    btnPlay.onclick = () => {
        playCard(player, cardId);
        closeCardModal();
    };

    btnSell.onclick = () => {
        sellCard(player, cardId);
        closeCardModal();
    };

    document.getElementById('card-modal').style.display = 'flex';
}

function closeCardModal() {
    activeCardModal = null;
    document.getElementById('card-modal').style.display = 'none';
}

// ── Persistencia ──────────────────────────────

function saveCards() {
    return {
        cardDeck,
        cardDiscard,
        playerHands: {
            red: playerHands.red.map(c => c.id),
            green: playerHands.green.map(c => c.id),
        },
    };
}

function loadCards(state) {
    if (!state) return;
    cardDeck = state.cardDeck || [];
    cardDiscard = state.cardDiscard || [];
    playerHands.red = (state.playerHands?.red || []).map(id => ({ ...findCardDef(id) })).filter(c => c.id);
    playerHands.green = (state.playerHands?.green || []).map(id => ({ ...findCardDef(id) })).filter(c => c.id);
    renderCardArea();
}
