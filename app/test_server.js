const lib = require("./board.js");

const SocketLib = require('ws');

class Room {
  constructor(id, host) {
    this.board = new lib.Board();
    this.id = id;
    this.host = host;
    this.second = 0;
  }
}

class Connection {
  constructor(ws, id) {
    this.ws = ws;
    this.id = id;
  }
}


class Server {
  constructor() {
    this.rooms = new Map();
    this.wss = new SocketLib.Server({ port: 8080 })
    this.clients = [];

    const server = this;

    this.wss.on('connection', ws => {
      console.log("Connection Received...");
      this.clients.push(new Connection(ws, this.clients.length + 1));
      let connectAccept = {id: 1, peerId: this.clients.length};
      //send connection accept
      ws.send(JSON.stringify(connectAccept));
      console.log("Sent connection accepted: " + JSON.stringify(connectAccept));

      //prepare move reading
      ws.on('message', message => {
        let parsed = JSON.parse(message);
        console.log("received message: " + message);
        //room join request
        if(parsed.id === 3) {
          if(server.rooms.has(parsed.roomId)) {
            const room = server.rooms.get(parsed.roomId);
            room.second = parsed.peerId;
            console.log("Joining: " + parsed.peerId + " to " + parsed.roomId);
          } else {
            server.rooms.set(parsed.roomId, new Room(parsed.roomId, parsed.peerId));
            server.rooms.get(parsed.roomId).board.fillBoard();
            console.log("Creating room " + parsed.roomId + " with host " + parsed.peerId);
          }
          this.clients[parsed.peerId - 1].ws.send(message);
          const currRoom = server.rooms.get(parsed.roomId);
          let pieces = [];
          currRoom.board.pieces.forEach(value => {
            pieces.push(JSON.stringify(value));
          });
          let boardState = {id: 4, board: JSON.stringify(server.rooms.get(parsed.roomId).board), pieces:pieces};
          this.clients[parsed.peerId - 1].ws.send(JSON.stringify(boardState));
          console.log("Sending board state...");
        }
        if(parsed.id === 2) {
          const room = server.rooms.get(parsed.roomId);
          room.board.movePiece(parsed.pieceId, parsed.x, parsed.y);

          this.clients[room.host - 1].ws.send(message);
          if(room.second !== 0)
            this.clients[room.second - 1].ws.send(message);
        }
      });
    });
  }

  sendAll(message) {
    for(const client of this.clients) {
      client.ws.send(message);
    }
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

  switchPlayer() {
    this.curPlayer = (this.curPlayer % 2) + 1;
  }

}


var server = new Server();
