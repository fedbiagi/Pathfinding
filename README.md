# Descrizione dello Script di Pathfinding (A*)

Questo script implementa un sistema di **pathfinding A\*** per un personaggio rettangolare in un ambiente 2D, pensato per essere utilizzato in **GDevelop**.  
L’obiettivo è calcolare un percorso libero da ostacoli tra il giocatore e il punto cliccato con il mouse, tenendo conto delle dimensioni del personaggio e delle collisioni con i muri.

---

## 🧭 Scopo Generale

Lo script calcola il percorso ottimale su una **griglia logica** che rappresenta la mappa di gioco.  
Tiene conto di:
- **Ostacoli** (oggetti `Wall`);
- **Dimensioni del giocatore** (larghezza e altezza in celle);
- **Punto di arrivo** (clic del mouse);
- **Correzione automatica** del target se è invalido o dentro un muro.

Il percorso finale viene salvato come JSON nelle variabili del giocatore, per poter essere utilizzato in un sistema di movimento automatico.

---

## 🔹 1. Conversione coordinate → griglia
```js
function getGridPos(x, y, cellSize)
```
Converte le coordinate in pixel in coordinate di cella, dividendo per la dimensione delle celle (`cellSize`).

---

## 🔹 2. Coda con priorità
```js
function PriorityQueue()
```
Implementa una semplice **priority queue** per l’algoritmo A\*.  
Estrae sempre il nodo con il costo totale più basso (`f = g + h`).

---

## 🔹 3. Controllo spazio libero
```js
function isFreeSpace(grid, x, y, width, height)
```
Verifica se un rettangolo (il giocatore) può occupare una cella senza toccare muri (`grid[y][x] === 1`).

---

## 🔹 4. Algoritmo A* (A-star)
```js
function aStarGrid(grid, start, goal, width, height)
```
Il cuore dello script:
- Cerca un percorso dal punto di partenza (`start`) al punto di arrivo (`goal`);
- Tiene conto della **dimensione del giocatore**;
- Si muove solo in 4 direzioni (su, giù, sinistra, destra);
- Usa la **distanza di Manhattan** come euristica;
- Ricostruisce il percorso quando il centro del giocatore raggiunge il goal.

---

## 🔹 5. Validazione rettangolo
```js
function isRectValid(grid, target, width, height)
```
Controlla se un rettangolo centrato su un punto `target` è interamente dentro la griglia e non tocca muri.

---

## 🔹 6. Diagnosi collisioni
```js
function getRectIssues(grid, target, width, height)
```
Restituisce un oggetto che indica su quali lati il rettangolo collide:
```js
{ top: true, bottom: false, left: false, right: true }
```

---

## 🔹 7. Correzione del punto di arrivo
```js
function adjustTarget(grid, target, width, height)
```
Se il `goal` è invalido (perché dentro un muro o fuori mappa), lo sposta leggermente nella direzione più vicina libera, mantenendo il punto originale all’interno del rettangolo.

---

## 🔹 8. Costruzione della griglia
Crea una matrice 2D (`grid`) che rappresenta la mappa:
- `0` = spazio libero  
- `1` = muro  

La mappa viene costruita usando la dimensione `cellSize` (in questo caso 2 pixel).

---

## 🔹 9. Marcatura muri
Tutti gli oggetti `Wall` vengono convertiti in celle bloccate (`grid[y][x] = 1`).

---

## 🔹 10. Dati del giocatore
Recupera il primo oggetto `Player`:
- Calcola la posizione di partenza (`start`);
- Determina le dimensioni del giocatore in celle (`playerCellWidth`, `playerCellHeight`).

---

## 🔹 11. Gestione del target
Ottiene la posizione del mouse e crea un marker `Target`.  
Se il punto non è valido, viene corretto con `adjustTarget()` e rappresentato da un `NewTarget`.

---

## 🔹 12. Calcolo del percorso
Chiama:
```js
const path = aStarGrid(grid, start, goal, playerCellWidth, playerCellHeight);
```
Se un percorso viene trovato:
- Lo converte da coordinate di cella a coordinate reali (pixel);
- Lo salva nelle variabili del giocatore:
  ```js
  player.getVariables().get("pathJson").setString(JSON.stringify(worldPath));
  player.getVariables().get("pathStep").setNumber(0);
  player.getVariables().get("pathLength").setNumber(worldPath.length);
  ```

---

## 🔸 In Sintesi

Questo script:
1. Crea una griglia logica della mappa;
2. Marca le celle occupate dai muri;
3. Verifica e corregge il punto di destinazione;
4. Calcola il percorso ottimale con **A\***;
5. Salva il risultato nelle variabili del giocatore per l’esecuzione del movimento automatico.

---

## 🧩 Output finale

Il percorso viene memorizzato in:
- `pathJson` → JSON con le coordinate dei punti del percorso;
- `pathStep` → indice del passo corrente;
- `pathLength` → numero totale di passi.

---
