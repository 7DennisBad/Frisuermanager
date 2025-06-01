let playerSelection = 0;
let gameStage = 1;

function changeCellColor(cell) {
  // Spieler 1 = Schwarz, Spieler 2 = Grau
  if (playerSelection === 1 && cell.style.backgroundColor !== "grey") {
    cell.style.backgroundColor = "black";
  } else if (playerSelection === 0 && cell.style.backgroundColor !== "black") {
    cell.style.backgroundColor = "grey";
  }


  playerSelection = playerSelection ^ 1;
  console.log(`PlayerSelection: ${playerSelection}`);
}

function cellById(id) {
  return document.getElementById(`${id}`);
}

function CellColor(ind) {
  return cellById(ind).style.backgroundColor;
}

function checkWinRow() {
  for (let i = 0; i < 9; i += 3) {
    let first = CellColor(i);
    let second = CellColor(i + 1);
    let third = CellColor(i + 2);

    if (first && first !== "white" && first === second && second === third) {
      console.log("Win row:", first);
      return first;
    }
  }
  return 0;
}

function checkWinColumn() {
  for (let i = 0; i < 3; i++) {
    let first = CellColor(i);
    let second = CellColor(i + 3);
    let third = CellColor(i + 6);

    if (first && first !== "white" && first === second && second === third) {
      console.log("Win column:", first);
      return first;
    }
  }
  return 0;
}

function checkWinDiagonal() {
  let center = CellColor(4);

  if (center && center !== "white") {
    if ((CellColor(0) === center && CellColor(8) === center) ||
      (CellColor(2) === center && CellColor(6) === center)) {
      console.log("Win diagonal:", center);
      return center;
    }
  }
  return 0;
}

function createWinMessage(PlayerColor) {
  let winMsg = document.createElement("p");
  winMsg.textContent = `Color ${PlayerColor} has Won!`;
  winMsg.style.fontSize = "40px";
  winMsg.style.fontStyle = "oblique";
  winMsg.style.color = PlayerColor;
  document.getElementById("winDisplay").appendChild(winMsg);
}

function checkWinCondition() {
  let winner = checkWinRow() || checkWinColumn() || checkWinDiagonal();
  if (winner) {
    createWinMessage(winner);
    gameStage = 0;
  }
}


function registerClick(event) {
  if (event.target.classList.contains("cell") && gameStage) {
    changeCellColor(event.target);
    checkWinCondition();
  }
}


function restart() {
  // Setze alle Zellen auf "white"
  for (let i = 0; i < 9; i++) {
    let cell = cellById(i);
    cell.style.backgroundColor = "white";
  }


  playerSelection = 0;
  gameStage = 1;


  let winDisplay = document.getElementById("winDisplay");
  winDisplay.textContent = "";

  console.log("Game restarted.");
}

// Eventlistener für Spielfeld und Restart-Button
document.getElementById("Board").addEventListener("click", registerClick);
document.getElementById("restart").addEventListener("click", restart);
