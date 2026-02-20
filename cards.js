/* =============================================
   HELION DELTA – cards.js
   Sistema de cartas de habilidades
   ============================================= */

// ── Definición del mazo ───────────────────────
// Cada carta: { id, name, description, effect }
// 'effect' es el identificador para la mecánica (TBD = por implementar)

const CARD_DECK_DEF = [
    // 5 Cartas de +1 Movimiento
    { id: 'm1_1', name: '🚀 Propulsores Ligeros', description: 'Otorga +1 casilla de movimiento a una de tus flotas este turno.', effect: { type: 'movement_boost', value: 1 } },
    { id: 'm1_2', name: '🚀 Propulsores Ligeros', description: 'Otorga +1 casilla de movimiento a una de tus flotas este turno.', effect: { type: 'movement_boost', value: 1 } },
    { id: 'm1_3', name: '🚀 Propulsores Ligeros', description: 'Otorga +1 casilla de movimiento a una de tus flotas este turno.', effect: { type: 'movement_boost', value: 1 } },
    { id: 'm1_4', name: '🚀 Propulsores Ligeros', description: 'Otorga +1 casilla de movimiento a una de tus flotas este turno.', effect: { type: 'movement_boost', value: 1 } },
    { id: 'm1_5', name: '🚀 Propulsores Ligeros', description: 'Otorga +1 casilla de movimiento a una de tus flotas este turno.', effect: { type: 'movement_boost', value: 1 } },

    // 4 Cartas de +2 Movimiento
    { id: 'm2_1', name: '☄ Motor Hiperespacial', description: 'Otorga +2 casillas de alcance a una de tus flotas. Cruza distancias más rápido.', effect: { type: 'movement_boost', value: 2 } },
    { id: 'm2_2', name: '☄ Motor Hiperespacial', description: 'Otorga +2 casillas de alcance a una de tus flotas. Cruza distancias más rápido.', effect: { type: 'movement_boost', value: 2 } },
    { id: 'm2_3', name: '☄ Motor Hiperespacial', description: 'Otorga +2 casillas de alcance a una de tus flotas. Cruza distancias más rápido.', effect: { type: 'movement_boost', value: 2 } },
    { id: 'm2_4', name: '☄ Motor Hiperespacial', description: 'Otorga +2 casillas de alcance a una de tus flotas. Cruza distancias más rápido.', effect: { type: 'movement_boost', value: 2 } },

    // 3 Cartas de +3 Movimiento
    { id: 'm3_1', name: '🌌 Salto Cuántico', description: 'Realiza un salto enorme: Otorga +3 casillas extras a la capacidad de salto de una flota.', effect: { type: 'movement_boost', value: 3 } },
    { id: 'm3_2', name: '🌌 Salto Cuántico', description: 'Realiza un salto enorme: Otorga +3 casillas extras a la capacidad de salto de una flota.', effect: { type: 'movement_boost', value: 3 } },
    { id: 'm3_3', name: '🌌 Salto Cuántico', description: 'Realiza un salto enorme: Otorga +3 casillas extras a la capacidad de salto de una flota.', effect: { type: 'movement_boost', value: 3 } },

    // ── Cartas de Fuerza (Batalla) ────────────────
    // +1 Fuerza (6 copias)
    { id: 'f1_1', name: '💥 Fuego de Cobertura', description: 'Apoyo táctico menor. Otorga +1 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 1 } },
    { id: 'f1_2', name: '💥 Fuego de Cobertura', description: 'Apoyo táctico menor. Otorga +1 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 1 } },
    { id: 'f1_3', name: '💥 Fuego de Cobertura', description: 'Apoyo táctico menor. Otorga +1 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 1 } },
    { id: 'f1_4', name: '💥 Fuego de Cobertura', description: 'Apoyo táctico menor. Otorga +1 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 1 } },
    { id: 'f1_5', name: '💥 Fuego de Cobertura', description: 'Apoyo táctico menor. Otorga +1 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 1 } },
    { id: 'f1_6', name: '💥 Fuego de Cobertura', description: 'Apoyo táctico menor. Otorga +1 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 1 } },

    // +2 Fuerza (5 copias)
    { id: 'f2_1', name: '🛡️ Escudos Sobrecargados', description: 'Desvía los primeros disparos. Otorga +2 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 2 } },
    { id: 'f2_2', name: '🛡️ Escudos Sobrecargados', description: 'Desvía los primeros disparos. Otorga +2 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 2 } },
    { id: 'f2_3', name: '🛡️ Escudos Sobrecargados', description: 'Desvía los primeros disparos. Otorga +2 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 2 } },
    { id: 'f2_4', name: '🛡️ Escudos Sobrecargados', description: 'Desvía los primeros disparos. Otorga +2 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 2 } },
    { id: 'f2_5', name: '🛡️ Escudos Sobrecargados', description: 'Desvía los primeros disparos. Otorga +2 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 2 } },

    // +3 Fuerza (4 copias)
    { id: 'f3_1', name: '🎯 Misiles Perforantes', description: 'Impacto directo en el casco enemigo. Otorga +3 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 3 } },
    { id: 'f3_2', name: '🎯 Misiles Perforantes', description: 'Impacto directo en el casco enemigo. Otorga +3 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 3 } },
    { id: 'f3_3', name: '🎯 Misiles Perforantes', description: 'Impacto directo en el casco enemigo. Otorga +3 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 3 } },
    { id: 'f3_4', name: '🎯 Misiles Perforantes', description: 'Impacto directo en el casco enemigo. Otorga +3 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 3 } },

    // +4 Fuerza (3 copias)
    { id: 'f4_1', name: '⚡ Rayo de Iones', description: 'Desactiva los escudos y daña la nave crítica. Otorga +4 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 4 } },
    { id: 'f4_2', name: '⚡ Rayo de Iones', description: 'Desactiva los escudos y daña la nave crítica. Otorga +4 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 4 } },
    { id: 'f4_3', name: '⚡ Rayo de Iones', description: 'Desactiva los escudos y daña la nave crítica. Otorga +4 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 4 } },

    // +5 Fuerza (2 copias)
    { id: 'f5_1', name: '☢️ Prototipo de Fusión', description: 'Arma secreta devastadora de un solo uso. Otorga +5 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 5 } },
    { id: 'f5_2', name: '☢️ Prototipo de Fusión', description: 'Arma secreta devastadora de un solo uso. Otorga +5 de Fuerza en una batalla.', effect: { type: 'combat_boost', value: 5 } },
];

// ── Estado en partida ─────────────────────────

let cardDeck = [];   // ids barajados pendientes de ser comprados
let cardDiscard = [];   // ids de cartas vendidas/usadas
const playerHands = { red: [], green: [] };
// playerHands[player] = array de objetos carta (copias de CARD_DECK_DEF)

let activeCardEffect = null; // { ...cardDef, owner: 'red'|'green' }

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

// ── Uso de cartas (Play) ──────────────────────

function playCard(player, cardId) {
    if (player !== currentPlayer) return;
    if (activeCardEffect) {
        showStatus('⚠️ Ya tienes una carta activa. Úsala o cancélala antes de jugar otra.');
        return;
    }

    const hand = playerHands[player];
    const idx = hand.findIndex(c => c.id === cardId);
    if (idx === -1) return;

    // Quitar la carta de la mano y activar efecto
    const [card] = hand.splice(idx, 1);
    activeCardEffect = { ...card, owner: player };

    // Mostrar mensaje con botón para cancelar la carta
    showStatus(`✨ Carta "${card.name}" ACTIVADA. Selecciona una flota para moverla con alcance ampliado. <button class="move-cancel-btn" style="padding:4px 8px; margin-left:10px" onclick="cancelCardEffect()">✖ Cancelar Carta</button>`, true);

    renderCardArea();
}

function cancelCardEffect() {
    if (!activeCardEffect) return;
    const player = activeCardEffect.owner;

    // Devolver a la mano
    playerHands[player].push(activeCardEffect);
    showStatus(`✖ Carta "${activeCardEffect.name}" cancelada y devuelta a tu mano.`);

    activeCardEffect = null;
    renderCardArea();
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

// ── Persistencia extendida ──────────────────

function saveCards() {
    return {
        cardDeck,
        cardDiscard,
        playerHands: {
            red: playerHands.red.map(c => c.id),
            green: playerHands.green.map(c => c.id),
        },
        activeCardEffect: activeCardEffect ? activeCardEffect.id : null // Guardamos id si hubo F5 a mitad
    };
}

function loadCards(state) {
    if (!state) return;
    cardDeck = state.cardDeck || [];
    cardDiscard = state.cardDiscard || [];
    playerHands.red = (state.playerHands?.red || []).map(id => ({ ...findCardDef(id) })).filter(c => c.id);
    playerHands.green = (state.playerHands?.green || []).map(id => ({ ...findCardDef(id) })).filter(c => c.id);

    if (state.activeCardEffect) {
        // En vez de cargarlo activo y romper un posible "moveState" a medias, devuélvelo a la mano
        const def = findCardDef(state.activeCardEffect);
        if (def) {
            playerHands[currentPlayer].push({ ...def });
        }
    }
    activeCardEffect = null;
    renderCardArea();
}
