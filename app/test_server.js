const readline = require("readline");
const lib = require("./board.js");
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
      ws.send(true)
    })
  }
}

class Game {
  constructor() {
    this.board = new lib.Board();
    // this.players = [new Player(1), new Player(2)];
    this.curPlayer = 1;
  }

  startGame() {
    this.board.fillBoard();
    this.board.printBoard();
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



//class containing board data

var server = new Server();
server.start();
var game = new Game();
game.startGame();
