const lib = require("./board.js");

const SocketLib = require('ws');

class Room {
  constructor(id, host) {
    this.board = new lib.Board();
    this.id = id;
    this.host = host;
    this.second = 0;
    this.currTeam = 1;
  }

  joinPlayer(id) {
    if(this.host === 0) {
      this.host = id;
      return 1;
    }
    else if(this.second === 0) {
      this.second = id;
      return 2;
    }
    else {
      return 0;
    }
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
    this.freeClients = [];

    const server = this;

    this.wss.on('connection', ws => {
      console.log("Connection Received...");

      let clientId = 0;
      if(this.freeClients.length !== 0) {
        clientId = this.freeClients.pop();
        this.clients[clientId - 1] = new Connection(ws, clientId);
      } else {
        clientId = this.clients.length + 1;
        this.clients.push(new Connection(ws, clientId));
      }
      let connectAccept = {id: 1, peerId: clientId};

      //send connection accept
      ws.send(JSON.stringify(connectAccept));
      console.log("Connection accepted to client " + JSON.stringify(connectAccept));

      //prepare move reading
      ws.on('message', message => {
        let parsed = JSON.parse(message);
        console.log("received message: " + message);
        //room join request
        if(parsed.id === 3) {
          let joined = false;
          if(server.rooms.has(parsed.roomId)) {
            const room = server.rooms.get(parsed.roomId);
            const team = room.joinPlayer(parsed.peerId);
            if(team) {
              joined = true;
              console.log("Joining: " + parsed.peerId + " to " + parsed.roomId + " as player " + team);
              parsed["team"] = team;
            }
          } else {
            joined = true;
            server.rooms.set(parsed.roomId, new Room(parsed.roomId, parsed.peerId));
            server.rooms.get(parsed.roomId).board.fillBoard();
            console.log("Creating room " + parsed.roomId + " with host " + parsed.peerId);
            parsed["team"] = 1;
          }
          if(joined) {
            //convert it back and send (team field added)
            this.clients[parsed.peerId - 1].ws.send(JSON.stringify(parsed));
            const currRoom = server.rooms.get(parsed.roomId);
            let pieces = [];
            currRoom.board.pieces.forEach(value => {
              pieces.push(JSON.stringify(value));
            });
            let boardState = { id: 4, board: JSON.stringify(server.rooms.get(parsed.roomId).board), pieces: pieces, currTeam: server.rooms.get(parsed.roomId).currTeam };
            this.clients[parsed.peerId - 1].ws.send(JSON.stringify(boardState));
            console.log("Sending board state...");
          }
        }
        if(parsed.id === 2) {
          const room = server.rooms.get(parsed.roomId);
          room.board.movePiece(parsed.pieceId, parsed.x, parsed.y);

          parsed["teamId"] = room.currTeam;

          if(parsed.teamId === 1)
            room.currTeam = 2;
          if(parsed.teamId === 2)
            room.currTeam = 1;

          if(room.host !== 0)
            this.clients[room.host - 1].ws.send(JSON.stringify(parsed));
          if(room.second !== 0)
            this.clients[room.second - 1].ws.send(JSON.stringify(parsed));
        }
      });

      ws.on('close', e => {
        for(let i = 0; i !== this.clients.length; ++i) {
          const connection = this.clients[i];
          if(connection.ws.readyState === SocketLib.CLOSING || connection.ws.readyState === SocketLib.CLOSED) {
            console.log("Client " + (i + 1) + " disconnected, marking as free");
            this.freeClients.push(i + 1);
          }
        }
        for(const freeId of this.freeClients) {
          this.rooms.forEach(value => {
            console.log("Checking room " + value.id);
            //clear whoever disconnected from their room
            if(value.host === freeId) {
              value.host = 0;
              console.log("Host of room " + value.id + " exited");
            }
            if(value.second === freeId) {
              value.second = 0;
              console.log("Host of room " + value.id + " exited");
            }
            //if the room is now empty
            if(value.host === 0 && value.second === 0) {
              this.rooms.delete(value.id);
              console.log("Room " + value.id + " is empty, clearing.");
            }
          });
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
