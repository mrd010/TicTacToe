// Objects---------------------------------------------
const GameBoard = (function () {
  // private
  let board = [];
  let boardLength = 0;

  // public
  const getBoard = () => {
    return board;
  };

  const getBoardLength = () => {
    return boardLength;
  };

  const setBoardSquare = (index, playerNum) => {
    if (!board[index]) {
      board[index] = playerNum;
      boardLength++;
    } else return false;

    return true;
  };

  const resetBoard = () => {
    board = [];
    boardLength = 0;
  };

  return { getBoard, getBoardLength, setBoardSquare, resetBoard };
})();

const Player = function (playerNum, name, mark) {
  return { playerNum, name, mark };
};

// Modules---------------------------------------------
const GameController = (function () {
  // private
  let player1;
  let player2;

  let turn;

  const winConditions = [
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];

  const changeTurn = () => {
    turn = turn === player1 ? player2 : player1;
    DisplayController.changeTurnIndicator(turn);
  };

  const checkGameOver = () => {
    if (GameBoard.getBoardLength() === 9) {
      return true;
    } else return false;
  };

  const checkWin = () => {
    const board = GameBoard.getBoard();
    let winner = null;
    const areEqual = ([a, b, c]) => {
      if (board[a] || board[b] || board[c]) {
        if (
          board[a] === board[b] &&
          board[b] === board[c] &&
          board[a] === board[c]
        ) {
          winner = board[a];
          return true;
        }
      }
      return false;
    };

    const winnedIndexes = winConditions.filter(areEqual);
    return { winner, winnedIndexes };
  };

  const WinningCeremony = (fulfilledWin) => {
    const winnedSquares = [];
    fulfilledWin.winnedIndexes.flat().forEach((index) => {
      if (!winnedSquares.includes(index)) {
        winnedSquares.push(index);
      }
    });

    DisplayController.showCeremony(
      fulfilledWin.winner === 1 ? player1 : player2,
      winnedSquares
    );
  };

  // public
  const getTurn = function () {
    return turn;
  };

  const startGame = function (p1, p2) {
    player1 = Player(1, p1 || "Player1", "X");
    player2 = Player(2, p2 || "Player2", "O");
    DisplayController.changePlayerInfo(player1.name, player2.name);
    turn = player1;
    GameBoard.resetBoard();
    DisplayController.changeTurnIndicator(turn);
  };

  const playBoardSquare = (index) => {
    const played = GameBoard.setBoardSquare(index, turn.playerNum);

    if (played) {
      DisplayController.setBoardSquareMark(index, turn.mark);
      const win = checkWin();
      if (win.winner) {
        WinningCeremony(win);
      } else if (checkGameOver()) {
        DisplayController.showGameOVer();
      } else {
        changeTurn();
      }
    }
  };

  return { startGame, getTurn, playBoardSquare };
})();

const DisplayController = (function () {
  // private
  const restartBtn = document.querySelector(".restart-button");
  const startGameBtn = document.querySelector(".start-game-button");
  const infoBoard = document.querySelectorAll(".info-board > *");
  const turnIndicatorMark = document.querySelector(".current-player-mark");
  const endGameMessage = document.querySelector(".end-game-message");
  const themeButton = document.querySelector(".theme-button");

  let currentTheme = "Dark";
  const boardButtons = document.querySelectorAll(".game-board .board-square");
  let locked = false;

  const lockInput = () => {
    locked = true;
  };

  const unlockInput = () => {
    locked = false;
  };

  const showNewGameMenu = () => {
    document.querySelector(".main-wrapper").style.display = "none";
    document.querySelector(".form-wrapper").style.display = "grid";
  };

  const playBoardButton = (playButton) => {
    if (!locked) {
      GameController.playBoardSquare(playButton.getAttribute("data-index"));
    }
  };

  const displayGameScreen = () => {
    document.querySelector(".main-wrapper").style.display = "grid";
    document.querySelector(".form-wrapper").style.display = "none";
    endGameMessage.style.display = "none";
    boardButtons.forEach((btn) => {
      btn.classList.remove("circle");
      btn.classList.remove("x");
      btn.classList.remove("blinking");
    });
    unlockInput();

    GameController.startGame(
      document.querySelector("#p1-name").value,
      document.querySelector("#p2-name").value
    );
  };

  const changeTheme = () => {
    const nextTheme = currentTheme === "Dark" ? "Light" : "Dark";
    document.documentElement.classList.replace(currentTheme, nextTheme);
    currentTheme = nextTheme;
    document.querySelector(
      ".theme-button span"
    ).textContent = ` ${currentTheme.toLowerCase()}_mode `;
  };

  startGameBtn.addEventListener("click", (e) => {
    displayGameScreen();
    e.preventDefault();
  });

  boardButtons.forEach((btn) => {
    btn.addEventListener("click", () => playBoardButton(btn));
  });

  restartBtn.addEventListener("click", showNewGameMenu);

  themeButton.addEventListener("click", changeTheme);

  // public
  const changeTurnIndicator = (turn) => {
    if (turn.playerNum === 1) {
      infoBoard[0].style.top = "0px";
    } else infoBoard[0].style.top = "50%";
    infoBoard[1].style.cssText = "";
    infoBoard[2].style.cssText = "";
    infoBoard[turn.playerNum].style.opacity = "1";

    turnIndicatorMark.classList.replace(
      turn.mark === "X" ? "circle" : "x",
      turn.mark === "X" ? "x" : "circle"
    );
  };

  const changePlayerInfo = (p1name, p2name) => {
    infoBoard[1].textContent = p1name;
    infoBoard[2].textContent = p2name;
  };

  const setBoardSquareMark = (btnIndex, playedMark) => {
    boardButtons[btnIndex - 1].classList.add(
      playedMark === "X" ? "x" : "circle"
    );
  };

  const showCeremony = (winner, squares) => {
    lockInput();

    squares.forEach((index) => {
      boardButtons[index - 1].classList.add("blinking");
    });

    endGameMessage.style.display = "block";
    endGameMessage.textContent = `the game ended with ${winner.name} as winner`;
  };

  const showGameOVer = () => {
    endGameMessage.style.display = "block";
    endGameMessage.textContent = `the game ended with no one as winner`;
  };

  return {
    changeTurnIndicator,
    changePlayerInfo,
    setBoardSquareMark,
    showCeremony,
    showGameOVer,
  };
})();
