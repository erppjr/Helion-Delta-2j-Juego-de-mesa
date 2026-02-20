# 🚀 Helion Delta – Juego de Mesa 

**Helion Delta** es un juego de estrategia por turnos para 2 jugadores ambientado en el espacio, jugado sobre un tablero hexagonal.

> ⚠️ **Este proyecto no está acabado.** Lo que ves aquí es la **base jugable** del juego, con las mecánicas fundamentales implementadas. Se seguirá desarrollando.

---

## 🎮 Mecánicas implementadas

| Mecánica | Descripción |
|---|---|
| **Tablero Hex** | Mapa hexagonal con casillas de colores y zonas configurables |
| **Naves** | 4 tipos de nave con costes, velocidad y fuerza distintos |
| **Cartas** | Sistema de cartas de habilidad que se pueden comprar en tienda secreta, vender o usar. |
| **Movimiento** | Movimiento por BFS con rango variable (1-2 casillas según nave) |
| **Flotas** | Agrupación de naves; velocidad limitada por la nave más lenta |
| **Planetas** | Generan ingresos por turno; propiedad dinámica según presencia |
| **Batallas** | Combate por dados (Fuerza + D6 vs Fuerza + D6). Otorga carta gratis al ganador. |
| **Condición de victoria** | Conquistar la base enemiga |
| **Persistencia** | Guardado automático en localStorage |

## 🛠 Tecnologías

- HTML5 / CSS3 / JavaScript vanilla
- SVG para el renderizado del tablero
- Sin dependencias externas

## ▶️ Cómo jugar

1. Abre `index.html` en cualquier navegador moderno.
2. Jugador **Rojo** empieza. 
3. Abre la **Tienda** pulsando en el botón correspondiente en la barra lateral.
4. Compra naves y colócalas en tus casillas de inicio, u obtén cartas de habilidad.
5. Mueve tus naves por el tablero, conquista planetas y ataca al enemigo.
6. **Gana** el jugador que logre colocar una nave en la base enemiga.

## 📁 Estructura

```
├── index.html    → Estructura HTML y modales
├── style.css     → Estilos del tablero, paneles y modales
├── board.js      → Generación y renderizado del tablero hexagonal
├── cards.js      → Sistema de mazo, manos y tienda de cartas
├── game.js       → Lógica principal del juego (turnos, combate, movimiento)
└── README.md
```

## 📋 Por hacer

- [ ] Más tipos de planetas y eventos
- [ ] Implementar efectos reales de cada carta en la mecánica de juego
- [ ] IA para jugar contra la máquina
- [ ] Modo multijugador online
- [ ] Efectos de sonido y animaciones


---

*Proyecto en desarrollo activo.*
