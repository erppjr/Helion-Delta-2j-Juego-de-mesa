# Helion Delta 🚀

Un juego de estrategia sci-fi por turnos para dos jugadores en navegador (Rojo vs Verde), donde los almirantes comandan flotas, conquistan planetas y emplean astucia para exterminar a la flota rival en una galaxia con cuadrícula hexagonal.

---

## ⚙️ MECÁNICAS BÁSICAS DE JUEGO

### 1. El Tablero y los Planetas 🪐
La partida se disputa en un extenso entramado hexagonal que funciona tanto de campo de movimiento libre como de zonas de recursos.
Existen cuatro tipos de planetas conquistables:
- **Bases Inexpugnables (Natal):** Las casillas `0,0` y `10,10`. Generan 1 moneda/turno de forma vitalicia. Nunca pueden ser conquistadas por el enemigo, pase lo que pase. 
- **Puestos de Despliegue Avanzado:** Las casillas `1,1` y `9,9`. Acompañan a la base natal para dar el mínimo de ingreso (1 moneda adicional). Estas sí pueden ser conquistadas por el rival cortando tus ingresos.
- **Planetas Terrestres (Normales/Puntos azules):** Esparcidos a los lados y en los bordes. Generan 1 moneda / turno.
- **Planeta Central (Rich):** Ubicado exactamente en el medio `[5, 5]`. Es el principal punto de disputa y genera **2 monedas / turno**.

### 2. Tienda Modular y Economía 💰
Al lado de la interfaz, cada jugador posee su Contador de Monedas (que aumenta automáticamente en cada `Finalizar Turno` acorde con el número de planetas poseídos). 
Utilizando su riqueza, pueden abrir el Modal de la Tienda de juego e invertir recursos para reforzar su flota.
El máximo teórico de aglomeración en un mismo hexágono es de **5 naves por bando**. 
*Naves Disponibles:*
- Nave Ligera (I) - 3 Monedas - Velocidad 2 - Fuerza 2
- Crucero (II) - 6 Monedas - Velocidad 2 - Fuerza 4
- Acorazado (III) - 15 Monedas - Velocidad 1 - Fuerza 6
- Titán (IV) - 20 Monedas - Velocidad 1 - Fuerza 8

Las naves que desees comprar deben ser ubicadas exclusivamente en tus casillas iniciales "Base" que se iluminarán del color de influencia amarilla.

---

## 🗺️ MOVIMIENTO Y DISTANCIAS

La agilidad general de una flota viene determinada por "el eslabón más débil".
Si mezclas Naves Ligeras (Vel 2) con Titanes (Vel 1) e intentas moverlas en grupo como escuadrón, la flota conjunta poseerá alcance 1 (ya que las naves pesadas ralentizan a las rápidas). Siempre tienes la opción en el Panel de Movimiento de dividir naves del hexágono escogiendo específicamente a cuáles mover.
- **Lógica Anti-abusos:** Las naves que hayan saltado recientemente su distancia base entran en estado (ya movida) y no podrán volver a liderar acciones de ruta en el mismo turno por agotamiento lógico de motores.

---

## ⚔️ SISTEMA DE COMBATE

El jugador activo puede lanzar a los escuadrones perimetrales para invadir un sector donde haya fuerzas enemigas. El juego iluminará los posibles escuadrones tácticos y abrirá un **enfrentamiento**.
- **Fuerza Base:** Ambos bandos suman los atributos de `Fuerza` nativa de las naves participantes. Esa será la estadística de armadura/puntería inicial de combate de cada uno.
- **Factor Caos (Cálculo D6):** El Modal de Batalla girará dos dados estándar (`D6` o un dado del 1 al 6) para sumar sus resultados fijos al poder del "Atacante y "Defensor". Quién obtenga un total mayor gana la escaramuza. Gana el Total más alto. La flota perdedora (incluidas todas sus naves apiladas allí) es eliminada del mapa por completo.

### 🎲 Milagros Desesperados (Fuga de Supervivencia)
Incluso con la completa destrucción de tus fuerzas, hay una ínfima esperanza en el vacío inter-estelar. 
Cuando una flota falla su defensa y se procede a su ejecución, cuenta internamente con una **probabilidad interna del 33% (2/6)** de evacuar los restos de la nave principal a las coordenadas vecinas antes del golpe final.
Si ocurre el milagro:
- El juego salvará con vida a **una (1) nave aleatoria** proveniente de tu flota destruida.
- Esa nave salvadora entrará en Fase Especial de Alerta para tu mano. Todo se detiene y estás forzado a escoger en un rango de escape de 2 Hexágonos una casilla refugio vacía o aliada. 
- La nave reaparecerá a salvo ahí (aunque extenuada y sin poder actuar el resto del turno).

---

## 🃏 EL MAZO: CARTAS DE COMANDANTE Y ENGAÑOS
Más allá del combate plano o la pura moneda, Helion Delta cuenta con un Sistema de Robo de Cartas que dictaminan habilidades de un solo uso que desbalancean la galaxia. Su precio son 4 Monedas, y cada jugador tiene Límite de **6 Cartas Máximo** en mano.

**A. Cartas Tácticas de Movimiento Extra:** 
Te permiten potenciar los saltos naturales de avance de las naves en juego. Puedes inyectárselo a flotas descansadas o flotas que ya se hallan movido (exclusivamente avanzan la distancia del bonus). Tienen limitante estricto, provocando el estado `<Impulsada>` la primera vez que tocan una nave e impidiendo que una flota spammee múltiples cartas de movimiento encadenadas infinitamente en el turno.
- *Propulsores Ligeros (+1 Mov. | 5 Existencias)*
- *Motor Hiperespacial (+2 Mov. | 4 Existencias)*
- *Salto Cuántico (+3 Mov. | 3 Existencias)*

**B. Cartas Tácticas de Interrupción Militar (Fuerza Extra):** 
Cartas que permanecen escondidas en las manos de los jugadores (inactivas a no ser que entres en choque bélico con el del frente). Si ocurre el Modal de Batalla, aquellos afortunados que posean en inventario este pool de apoyo podrán hacer clics rápidos consumiendo las existencias desde sus manos e introduciendo el Modificador Final al marcador numérico base que determinará la explosión o no del contrincante.
- *Fuego de Cobertura (+1 Fuerza combate | 6 Existencias)*
- *Escudos Sobrecargados (+2 Fuerza | 5 Existencias)*
- *Misiles Perforantes (+3 Fuerza | 4 Existencias)*
- *Rayo de Iones (+4 Fuerza | 3 Existencias)*
- *Prototipo de Fusión (+5 Fuerza Masiva | 2 Existencias)*

**C. Cartas de Ingresos y Minería Hostil:** 
Puedes convertirlas en oro puro al inyectarlas en un *Planeta de Zona Neutral* que tú domines pacíficamente. Al hacerlo, el planeta se iluminará generando un **Depósito de Oro** explícito con (+X) monedas extras sobre la producción original. El ingreso se dosificará a plazos cobrándolo al inicio de tu turno.
Pero ten cuidado: este Depósito y su oro extra no está atado a ti. Si un enemigo logra conquistar tu planeta gris antes de que se agote la reserva instalada, **él** pasará a ser el beneficiario de tus ganancias en su turno.
- *X2 Monedas (1r)* (+3 oro plano extra | 4 Existencias)
- *X2 Monedas (2r)* (+3 oro plano extra | 3 Existencias)
- *X2 Monedas (3r)* (+3 oro plano extra | 2 Existencias)
- *X2 Monedas (Infinita)* (Produce un inagotable `x2` permanente de oro en la roca | 1 Existencia)
- **Sabotaje Económico:** El reverso de la moneda. Se usa haciendo clic sobre el planeta inflado (amigo o enemigo) y provoca la destrucción y evaporación inmediata del depósito de minería albergado de la faz de la galaxia (5 Existencias).
- **Cambiar Monedas:** Un golpe de estado financiero inmediato. Si la usas, tus ahorros actuales en tu contador de monedas se intercambiarán en el acto con las monedas totales del enemigo, perjudicando su capacidad brutal de compra si estaba ahorrando (2 Existencias).

**D. Cartas Tácticas Especiales (Guerra e Inteligencia):**
- **Infiltración:** Un satélite de reconocimiento revelará exactamente qué cartas secretas oculta tu enemigo en su mano actual mostrándolas en un panel visual de inteligencia militar (4 Existencias).
- **Despliegue Avanzado:** Esta carta rompe las reglas de compra. Una vez jugada, al gastar monedas en obtener una nave de la tienda, te permitirá materializar tu compra directamente en un planeta gris neutral asegurado en lugar de confinarte a tu base natal, reduciendo los tiempos de viaje del frente (2 Existencias).
- **Robar Nave (Asimilación Reactiva):** Esta carta dorada no se "juega" manual ni proactivamente en tu turno. Quédatela en la recámara. Cuando envíes una flota de asalto al frente y ganes holgadamente tu ofensiva marítima (destrozando todos los dados del defensor enemgo de la casilla conflictiva), si tienes esta carta, el juego congelará el tiempo. Te pedirá elegir UNA de las naves destruidas del general enemigo; la absorberás mágicamente hacia la tuya propia sin coste, eliminando para siempre la de él (1 Existencia).

**E. Refuerzos Materiales (Naves Gratuitas):**
- **Naves Nivel 1 al 4:** Estas cartas te abastecen directamente con armamento pesado sin tocar tu economía. Al jugarlas, entrarás en modo "despliegue de compra", pero el costo de la nave que dicte la carta será 0. Además, tienen sinergia de anidamiento; si primero activaste "Despliegue Avanzado" y luego tiras una Nave Nivel 4 Gratis, podrás colocar a esa nave gratis en la frontera central del mapa en vez de en tu base natal (14 Existencias divididas por Tiers).

**F. Sabotaje y Guerra Electrónica:**
- **Bloqueo (1 y 2 Rondas):** Al activar esta carta y hacer clic sobre una casilla ocupada por naves enemigas, sus sistemas de salto se congelarán de golpe. Aparecerá un candado 🔒 sobre su icono en el mapa, y el rival se verá inhabilitado de mover o dividir esas naves en concreto hasta que termine su turno un número de veces igual a la severidad de la carta (8 Existencias).
- **Anti Bloqueo (Purga de Sistemas):** Cómprate algo de paz mental. Si tu rival inmovilizó tus naves clave cerca del Nexo Central, usa esta carta sobre tu flota congelada para eliminar cualquier penalización de `Bloqueo` instantáneamente y poder mover (3 Existencias).

---

### MODO DEBUG (Desarrollador)
La caja de herramientas integrada en el Panel Izquierdo te facilita probar la integridad de las implementaciones:
- Colocas naves instantáneas a todas sus formas con solo usar el "Modo Rosa" (Debug Selection), y usar `btn-debug` elimina las restricciones de zonas de despliegue amarillas.
- Puedes inyectarte tanto Oro Ilimitado como obligar al sistema de manos a darte Cartas Tácticas del Pool Aleatorio del mazo con tan solo pulsar su botón en cada turno para observar batallas completas y efectos en dos o tres clicks simulando finales de partida reales de 2h de partida.
