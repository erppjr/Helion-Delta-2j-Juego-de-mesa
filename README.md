# ⬡ Helion Delta – Juego de Mesa Hexagonal

Juego de estrategia por turnos para 2 jugadores en un tablero hexagonal. Conquista la base enemiga moviendo flotas, controlando planetas y ganando batallas.

## 🎮 Cómo jugar

Abre `index.html` en cualquier navegador moderno. No requiere servidor ni dependencias.

### Objetivo
- **Rojo** debe colocar una nave en la casilla `10,10` (base Verde).
- **Verde** debe colocar una nave en la casilla `0,0` (base Roja).

### Turnos
Cada turno puedes:
1. **Comprar naves** en la tienda lateral (si tienes monedas).
2. **Mover flotas** haciendo clic en una casilla con naves propias.
3. **Atacar** flotas enemigas adyacentes tras mover.
4. **Terminar turno** para pasar al siguiente jugador.

### Naves

| Nave | Coste | Fuerza | Velocidad |
|------|-------|--------|-----------|
| Nave I (▲) | 3 🪙 | 2 ⚔️ | 2 casillas |
| Nave II (◆) | 6 🪙 | 4 ⚔️ | 2 casillas |
| Nave III (★) | 15 🪙 | 6 ⚔️ | 1 casilla |
| Nave IV (⬟) | 20 🪙 | 8 ⚔️ | 1 casilla |

### Flotas
- Máximo **5 naves** por casilla.
- La velocidad de una flota está **limitada por la nave más lenta**.
- Botón **"✂️ Dividir flota"** para mover solo algunas naves.

### Planetas
Los planetas generan **ingresos al inicio de cada turno**. Su propietario cambia si hay naves de un jugador en la casilla.

### Combate
- Se activa al mover junto a una flota enemiga.
- Cada bando suma su **fuerza total + 1D6**.
- El perdedor es **eliminado por completo**.
- En caso de empate se repite la tirada.

## 🛠 Tecnologías
- HTML5 + CSS3 + JavaScript vanilla
- SVG para el tablero hexagonal
- localStorage para guardar la partida

## 📁 Estructura
```
├── index.html   → Página principal
├── board.js     → Generación del tablero hexagonal (SVG)
├── game.js      → Lógica del juego (naves, planetas, batalla)
├── style.css    → Estilos y tema oscuro
└── .gitignore
```

## 📜 Licencia
Proyecto personal.
