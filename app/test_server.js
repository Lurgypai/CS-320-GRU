const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class Server {
  start() {
    const WebSocket = require('ws')
    console.log("Starting server...")

    const wss = new WebSocket.Server({ port: 8080 })

    wss.on('connection', ws => {
      ws.on('message', message => {
        console.log(`Received message => ${message}`)
      })
      ws.send('ho!')
    })
  }
}

class Game {
  constructor() {
    this.board = new Board();
    this.players = [new Player(1), new Player(2)];
    this.curPlayer = 1;
  }

  startGame() {
    this.board.fillBoard();
    this.runGame();
  }

  resetGame() {
    //reset game state (in board class) or not needed?
    this.board.clearBoard();
    this.startGame(); //Do we have to worry about calling runGame while a game is already in progress?
    //or should we just perform "this.board.fillBoard();"?
  }

  cancelGame() {
    //Stop interactions with the board and boot players to landing page?
    //Or stop players from using anything other than the menu?
  }

  getCurrentPlayerTargetPiece() {
  }

  getCurrentPlayerTargetMove() {
  }

  doMove() {
    const targetPiece = this.players[this.curPlayer].targetPiece;
    const targetMove = this.players[this.curPlayer].targetMove;

    this.board.data[targetMove.y][targetMove.x] = this.curPlayer;
    this.board.data[targetPiece.y][targetPiece.x] = 0;
  }

  switchPlayer() {
    this.curPlayer = (this.curPlayer % 2) + 1;
  }

  runGame() {
    this.consolePlayerMove();
  }


  //calback that calls itself
  consolePlayerMove(move) {
    const game = this;

    rl.question("Player " + game.curPlayer + ", enter a piece position: ", function (pos) {
      console.log(pos);
      rl.question("Player " + game.curPlayer + ", enter a move position: ", function (pos) {
        console.log(pos);
        game.switchPlayer();
        game.consolePlayerMove();
      });
    });
  }
}

//stores a 2d coordinate
class Pos {
  constructor(x_, y_) {
    this.x = x_;
    this.y = y_;
  }
}

//stores and id, and what piece they currently want to move
class Player {
  constructor(id_) {
    this.id = id_;
    this.targetPiece = new Pos(-1, -1);
    this.targetMove = new Pos(-1, -1);
  }
}

//class containing board data
class Board {
  //generate a 2d array of pieces
  constructor() {
    this.width = 8;
    this.height = 8;
    this.data = [];

    for(var i = 0; i !== this.width; ++i) {
      var row = [];
      for(var j = 0; j !== this.height; ++j) {
        row.push(0);
      }
      this.data.push(row);
    }
  }

  //draw the board as text (for debugging)
  printBoard() {
    //removed the row divider as it took to much space and made it hard to see
    //var rowDivider = "+-+-+-+-+-+-+-+-+";
    //console.log(rowDivider);
    for(var row of this.data) {
      var rowString = "|";
      for(var colVal of row) {
        var drawChar = ' ';
        switch (colVal) {
          case 0:
            drawChar = ' ';
            break;
          case 1:
            drawChar = '@';
            break;
          case 2:
            drawChar = '#';
            break;
        }
        rowString += drawChar + '|';
      }
      console.log(rowString);
      //console.log(rowDivider);
    }
  }

  //remove all pieces
  clearBoard() {
    for(var i =0; i != this.height; ++i) {
      for(var j = 0; j != this.width; ++j) {
        this.data[i][j] = 0;
      }
    }
  }

  //clear and fill with pieces
  fillBoard() {
    this.clearBoard();
    for(var i = 0; i != this.height; ++i) {
      for(var j =0; j != this.width; ++j) {

        //start with white, every other row fill every other piece
        if(i % 2 == 0 && j % 2 == 1 && i < 3)
          this.data[i][j] = 1;
        else if(i % 2 == 1 && j % 2 == 0 && i < 3)
          this.data[i][j] = 1;
        //black, the same, but lower
        if(i % 2 == 0 && j % 2 == 1 && i >= 5)
          this.data[i][j] = 2;
        else if(i % 2 == 1 && j % 2 == 0 && i >= 5)
          this.data[i][j] = 2;
      }
    }
  }

  validMove() {
    /*
    Needs data regarding the piece chosen & the position chosen to move will then check
    (1)If move is in the bounds of the board (2)Piece isn't too far (3)Piece moves in the correct direction
    (3)Single jumps are not more than 1piece (4)MultiJumps rules are followed
    Need to know pieces are a king or pawn to discern valid moves for respective pieces
    */
  }
  checkWin() {
    /* This will use the array of active pieces (IF we have separate arrays for each player's pieces)
    to determine a winner, we also need to see if pieces are unable to move which results in a draw or loss
    we will need to cooperate with validity of moves here
    */
  }
}

var game = new Game();
game.startGame();
