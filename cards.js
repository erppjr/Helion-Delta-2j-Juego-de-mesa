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

    // ── Cartas de Economía ────────────────────────
    { id: 'p1_1', name: '🪙 X2 Monedas (1r)', description: 'Duplica la producción de un planeta neutral tuyo durante 1 ronda (+3 extra de reembolso).', effect: { type: 'production_boost', value: 1 } },
    { id: 'p1_2', name: '🪙 X2 Monedas (1r)', description: 'Duplica la producción de un planeta neutral tuyo durante 1 ronda (+3 extra de reembolso).', effect: { type: 'production_boost', value: 1 } },
    { id: 'p1_3', name: '🪙 X2 Monedas (1r)', description: 'Duplica la producción de un planeta neutral tuyo durante 1 ronda (+3 extra de reembolso).', effect: { type: 'production_boost', value: 1 } },
    { id: 'p1_4', name: '🪙 X2 Monedas (1r)', description: 'Duplica la producción de un planeta neutral tuyo durante 1 ronda (+3 extra de reembolso).', effect: { type: 'production_boost', value: 1 } },

    { id: 'p2_1', name: '🪙 X2 Monedas (2r)', description: 'Duplica la producción de un planeta neutral tuyo durante 2 rondas (+3 extra de reembolso).', effect: { type: 'production_boost', value: 2 } },
    { id: 'p2_2', name: '🪙 X2 Monedas (2r)', description: 'Duplica la producción de un planeta neutral tuyo durante 2 rondas (+3 extra de reembolso).', effect: { type: 'production_boost', value: 2 } },
    { id: 'p2_3', name: '🪙 X2 Monedas (2r)', description: 'Duplica la producción de un planeta neutral tuyo durante 2 rondas (+3 extra de reembolso).', effect: { type: 'production_boost', value: 2 } },

    { id: 'p3_1', name: '🪙 X2 Monedas (3r)', description: 'Duplica la producción de un planeta neutral tuyo durante 3 rondas (+3 extra de reembolso).', effect: { type: 'production_boost', value: 3 } },
    { id: 'p3_2', name: '🪙 X2 Monedas (3r)', description: 'Duplica la producción de un planeta neutral tuyo durante 3 rondas (+3 extra de reembolso).', effect: { type: 'production_boost', value: 3 } },

    { id: 'p_inf', name: '🪙 X2 Monedas (∞r)', description: 'Genera el doble de ingresos en un planeta neutral controlado de forma permanente.', effect: { type: 'production_boost', value: 'infinite' } },

    { id: 's_1', name: '💣 Sabotaje Económico', description: 'Destruye por completo el depósito de monedas activo de cualquier planeta.', effect: { type: 'sabotage', value: 0 } },
    { id: 's_2', name: '💣 Sabotaje Económico', description: 'Destruye por completo el depósito de monedas activo de cualquier planeta.', effect: { type: 'sabotage', value: 0 } },
    { id: 's_3', name: '💣 Sabotaje Económico', description: 'Destruye por completo el depósito de monedas activo de cualquier planeta.', effect: { type: 'sabotage', value: 0 } },
    { id: 's_4', name: '💣 Sabotaje Económico', description: 'Destruye por completo el depósito de monedas activo de cualquier planeta.', effect: { type: 'sabotage', value: 0 } },
    { id: 's_5', name: '💣 Sabotaje Económico', description: 'Destruye por completo el depósito de monedas activo de cualquier planeta.', effect: { type: 'sabotage', value: 0 } },

    { id: 'u_1', name: '🔄 Cambiar Monedas', description: 'Intercambia instantáneamente tu reserva de monedas con la del jugador rival.', effect: { type: 'swap_coins', value: 0 } },
    { id: 'u_2', name: '🔄 Cambiar Monedas', description: 'Intercambia instantáneamente tu reserva de monedas con la del jugador rival.', effect: { type: 'swap_coins', value: 0 } },

    // ── Cartas Especiales (Tácticas Avanzadas) ─────────────────────────
    { id: 'd_1', name: '🛸 Despliegue Avanzado', description: 'Permite desplegar una nave comprada directamente en un planeta de la zona neutral (gris) que controles.', effect: { type: 'deploy_neutral' } },
    { id: 'd_2', name: '🛸 Despliegue Avanzado', description: 'Permite desplegar una nave comprada directamente en un planeta de la zona neutral (gris) que controles.', effect: { type: 'deploy_neutral' } },

    { id: 'r_1', name: '🧲 Robar Nave', description: 'Úsala al ganar una batalla para asimilar y quedarte con una nave de la flota enemiga derrotada en vez de destruirla.', effect: { type: 'steal_ship' } },

    { id: 'l_1', name: '🔍 Infiltración', description: 'Espía y revela todas las cartas ocultas en la mano de tu enemigo.', effect: { type: 'espionage' } },
    { id: 'l_2', name: '🔍 Infiltración', description: 'Espía y revela todas las cartas ocultas en la mano de tu enemigo.', effect: { type: 'espionage' } },
    { id: 'l_3', name: '🔍 Infiltración', description: 'Espía y revela todas las cartas ocultas en la mano de tu enemigo.', effect: { type: 'espionage' } },
    { id: 'l_4', name: '🔍 Infiltración', description: 'Espía y revela todas las cartas ocultas en la mano de tu enemigo.', effect: { type: 'espionage' } },

    // ── Naves Gratuitas ─────────────────────────
    { id: 'f_t1_1', name: '🚀 +1 Nave Nivel 1', description: 'Te permite desplegar una Nave Nivel 1 de manera gratuita. Tiene sinergia con Despliegue Avanzado.', effect: { type: 'free_ship', level: 1 } },
    { id: 'f_t1_2', name: '🚀 +1 Nave Nivel 1', description: 'Te permite desplegar una Nave Nivel 1 de manera gratuita. Tiene sinergia con Despliegue Avanzado.', effect: { type: 'free_ship', level: 1 } },
    { id: 'f_t1_3', name: '🚀 +1 Nave Nivel 1', description: 'Te permite desplegar una Nave Nivel 1 de manera gratuita. Tiene sinergia con Despliegue Avanzado.', effect: { type: 'free_ship', level: 1 } },
    { id: 'f_t1_4', name: '🚀 +1 Nave Nivel 1', description: 'Te permite desplegar una Nave Nivel 1 de manera gratuita. Tiene sinergia con Despliegue Avanzado.', effect: { type: 'free_ship', level: 1 } },
    { id: 'f_t1_5', name: '🚀 +1 Nave Nivel 1', description: 'Te permite desplegar una Nave Nivel 1 de manera gratuita. Tiene sinergia con Despliegue Avanzado.', effect: { type: 'free_ship', level: 1 } },

    { id: 'f_t2_1', name: '🛸 +1 Nave Nivel 2', description: 'Te permite desplegar una Nave Nivel 2 de manera gratuita. Tiene sinergia con Despliegue Avanzado.', effect: { type: 'free_ship', level: 2 } },
    { id: 'f_t2_2', name: '🛸 +1 Nave Nivel 2', description: 'Te permite desplegar una Nave Nivel 2 de manera gratuita. Tiene sinergia con Despliegue Avanzado.', effect: { type: 'free_ship', level: 2 } },
    { id: 'f_t2_3', name: '🛸 +1 Nave Nivel 2', description: 'Te permite desplegar una Nave Nivel 2 de manera gratuita. Tiene sinergia con Despliegue Avanzado.', effect: { type: 'free_ship', level: 2 } },
    { id: 'f_t2_4', name: '🛸 +1 Nave Nivel 2', description: 'Te permite desplegar una Nave Nivel 2 de manera gratuita. Tiene sinergia con Despliegue Avanzado.', effect: { type: 'free_ship', level: 2 } },

    { id: 'f_t3_1', name: '🛰️ +1 Nave Nivel 3', description: 'Te permite desplegar una Nave Nivel 3 de manera gratuita. Tiene sinergia con Despliegue Avanzado.', effect: { type: 'free_ship', level: 3 } },
    { id: 'f_t3_2', name: '🛰️ +1 Nave Nivel 3', description: 'Te permite desplegar una Nave Nivel 3 de manera gratuita. Tiene sinergia con Despliegue Avanzado.', effect: { type: 'free_ship', level: 3 } },
    { id: 'f_t3_3', name: '🛰️ +1 Nave Nivel 3', description: 'Te permite desplegar una Nave Nivel 3 de manera gratuita. Tiene sinergia con Despliegue Avanzado.', effect: { type: 'free_ship', level: 3 } },

    { id: 'f_t4_1', name: '🌌 +1 Nave Nivel 4', description: 'Te permite desplegar una Nave Nivel 4 de manera gratuita. Tiene sinergia con Despliegue Avanzado.', effect: { type: 'free_ship', level: 4 } },
    { id: 'f_t4_2', name: '🌌 +1 Nave Nivel 4', description: 'Te permite desplegar una Nave Nivel 4 de manera gratuita. Tiene sinergia con Despliegue Avanzado.', effect: { type: 'free_ship', level: 4 } },

    // ── Guerras Electrónicas (Bloqueos) ─────────────────────────
    { id: 'b_1r_1', name: '🔒 Bloqueo de Motor (1r)', description: 'Paraliza una flota enemiga impidiendo que pueda moverse durante 1 ronda completa.', effect: { type: 'ship_block', duration: 1 } },
    { id: 'b_1r_2', name: '🔒 Bloqueo de Motor (1r)', description: 'Paraliza una flota enemiga impidiendo que pueda moverse durante 1 ronda completa.', effect: { type: 'ship_block', duration: 1 } },
    { id: 'b_1r_3', name: '🔒 Bloqueo de Motor (1r)', description: 'Paraliza una flota enemiga impidiendo que pueda moverse durante 1 ronda completa.', effect: { type: 'ship_block', duration: 1 } },
    { id: 'b_1r_4', name: '🔒 Bloqueo de Motor (1r)', description: 'Paraliza una flota enemiga impidiendo que pueda moverse durante 1 ronda completa.', effect: { type: 'ship_block', duration: 1 } },
    { id: 'b_1r_5', name: '🔒 Bloqueo de Motor (1r)', description: 'Paraliza una flota enemiga impidiendo que pueda moverse durante 1 ronda completa.', effect: { type: 'ship_block', duration: 1 } },

    { id: 'b_2r_1', name: '🧊 Pulso Electromagnético (2r)', description: 'Congela completamente a una flota enemiga, inhabilitándola para saltar durante 2 rondas.', effect: { type: 'ship_block', duration: 2 } },
    { id: 'b_2r_2', name: '🧊 Pulso Electromagnético (2r)', description: 'Congela completamente a una flota enemiga, inhabilitándola para saltar durante 2 rondas.', effect: { type: 'ship_block', duration: 2 } },
    { id: 'b_2r_3', name: '🧊 Pulso Electromagnético (2r)', description: 'Congela completamente a una flota enemiga, inhabilitándola para saltar durante 2 rondas.', effect: { type: 'ship_block', duration: 2 } },

    { id: 'ab_1', name: '🔓 Purga de Sistemas', description: 'Elimina al instante cualquier estado de bloqueo o sabotaje de movimiento sobre una de tus flotas afectadas.', effect: { type: 'anti_block' } },
    { id: 'ab_2', name: '🔓 Purga de Sistemas', description: 'Elimina al instante cualquier estado de bloqueo o sabotaje de movimiento sobre una de tus flotas afectadas.', effect: { type: 'anti_block' } },
    { id: 'ab_3', name: '🔓 Purga de Sistemas', description: 'Elimina al instante cualquier estado de bloqueo o sabotaje de movimiento sobre una de tus flotas afectadas.', effect: { type: 'anti_block' } },

    // ── Cartas de Daño Directo (Kamikaze) ───────────────────
    { id: 'k_1', name: '☄️ Kamikaze (Bowler)', description: 'Sacrifica una flota moviéndola hasta +3 hexágonos en estricta línea recta. Si choca contra una flota enemiga, se destruye y tiene N/6 probabilidades (N=naves rivales) de aniquilar una nave enemiga.', effect: { type: 'kamikaze', range: 3 } },
    { id: 'k_2', name: '☄️ Kamikaze (Bowler)', description: 'Sacrifica una flota moviéndola hasta +3 hexágonos en estricta línea recta. Si choca contra una flota enemiga, se destruye y tiene N/6 probabilidades (N=naves rivales) de aniquilar una nave enemiga.', effect: { type: 'kamikaze', range: 3 } },
    { id: 'k_3', name: '☄️ Kamikaze (Bowler)', description: 'Sacrifica una flota moviéndola hasta +3 hexágonos en estricta línea recta. Si choca contra una flota enemiga, se destruye y tiene N/6 probabilidades (N=naves rivales) de aniquilar una nave enemiga.', effect: { type: 'kamikaze', range: 3 } },
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
    if (typeof gameStats !== 'undefined') {
        gameStats[player].cardsPlayed++;
    }

    // Si la carta es de resolución instantánea (Swap de oros)
    if (card.effect && card.effect.type === 'swap_coins') {
        const enemy = player === 'red' ? 'green' : 'red';
        const myCoins = coins[player];
        const enemyCoins = coins[enemy];

        coins[player] = enemyCoins;
        coins[enemy] = myCoins;

        // Repintado DOM inmediato
        if (document.getElementById('coins-red')) document.getElementById('coins-red').textContent = coins.red;
        if (document.getElementById('coins-green')) document.getElementById('coins-green').textContent = coins.green;

        cardDiscard.push(card.id);
        showStatus(`🔄 ¡Golpe de estado financiero! Las reservas de oro han sido intercambiadas con tu rival.`);
        renderCardArea();
        if (typeof renderShopButtons === 'function') renderShopButtons();
        saveGame();
        return; // Detener flujo para que no pase a selección en el tablero
    }

    // Lupa - Resolución Instantánea
    if (card.effect && card.effect.type === 'espionage') {
        const enemy = player === 'red' ? 'green' : 'red';
        const enemyHand = playerHands[enemy];

        const container = document.getElementById('espionage-cards');
        if (container) {
            container.innerHTML = '';
            if (enemyHand.length === 0) {
                container.innerHTML = '<div style="color: #bdc3c7; width: 100%; text-align: center;">El enemigo no tiene ninguna carta en su mano en este momento.</div>';
            } else {
                enemyHand.forEach(enemyCard => {
                    const cDiv = document.createElement('div');
                    cDiv.className = 'battle-card'; // Reutilizamos clases del combat modal
                    cDiv.innerHTML = `
                        <div style="font-weight:bold; margin-bottom:5px; font-size:0.9rem;">${enemyCard.name}</div>
                        <div style="font-size:0.8rem; color:#bdc3c7;">${enemyCard.description}</div>
                    `;
                    container.appendChild(cDiv);
                });
            }
            document.getElementById('espionage-modal').style.display = 'flex';
        }

        cardDiscard.push(card.id);
        showStatus(`🔍 Inteligencia activada: Desplegando informe de espionaje sobre el enemigo.`);
        renderCardArea();
        saveGame();
        return;
    }

    // Protección Carta Botín (Reactiva pura)
    if (card.effect && card.effect.type === 'steal_ship') {
        showStatus('⚠️ Esta carta no se puede activar manualmente. Se revelará como opción al ganar una batalla marítima a tu adversario.');
        // Anular y retornar la carta al array
        hand.splice(idx, 0, card);
        return;
    }

    // Naves Gratuitas
    if (card.effect && card.effect.type === 'free_ship') {
        const typeObj = typeof SHIP_TYPES !== 'undefined' ? SHIP_TYPES.find(t => t.level === card.effect.level) : null;
        if (!typeObj) return;

        // Creamos un clon temporal de la nave para que cueste 0 y sepamos que es gratuita
        const freeShipObj = { ...typeObj, cost: 0, isFreeCard: true, cardRef: card.id };

        // Arrojamos la carta al descarte
        cardDiscard.push(card.id);

        // Se la pasamos al hook de game.js para que encienda los planetas para colocar
        if (typeof startBuyShip === 'function') {
            startBuyShip(freeShipObj);
            showStatus(`🃏 Has usado tu carta. Elige dónde soltar tu ${typeObj.label} gratuito.`);
        }

        renderCardArea();
        saveGame();
        return;
    }

    activeCardEffect = { ...card, owner: player };

    // Mostrar mensaje con botón para cancelar la carta
    let instructionText = 'Selecciona una flota para moverla con alcance ampliado.';
    if (card.effect && card.effect.type === 'production_boost') {
        instructionText = 'Haz clic en un planeta de la zona neutral (coloreado) que controles.';
    } else if (card.effect && card.effect.type === 'sabotage') {
        instructionText = 'Haz clic en cualquier planeta con un depósito activo para volarlo por los aires.';
    } else if (card.effect && card.effect.type === 'deploy_neutral') {
        instructionText = 'Abre la Tienda y compra una nave. Podrás asentar la unidad en cualquier planeta gris que controles en lugar de tu base natural.';
    } else if (card.effect && card.effect.type === 'ship_block') {
        instructionText = `Haz clic en una casilla que contenga una flota enemiga para bloquear sus motores durante ${card.effect.duration} ronda(s).`;
    } else if (card.effect && card.effect.type === 'anti_block') {
        instructionText = 'Haz clic en una flota propia que esté sufriendo un bloqueo para depurar sus sistemas y devolverle la movilidad al instante.';
    }

    showStatus(`✨ Carta "${card.name}" ACTIVADA. ${instructionText} <button class="move-cancel-btn" style="padding:4px 8px; margin-left:10px" onclick="cancelCardEffect()">✖ Cancelar Carta</button>`, true);

    renderCardArea();
    saveGame();
}

function cancelCardEffect(customMessage) {
    if (!activeCardEffect) return;
    const player = activeCardEffect.owner;

    // Devolver a la mano
    playerHands[player].push(activeCardEffect);

    if (customMessage) {
        showStatus(customMessage);
    } else {
        showStatus(`✖ Carta "${activeCardEffect.name}" cancelada y devuelta a tu mano.`);
    }

    activeCardEffect = null;
    renderCardArea();
    saveGame();
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
