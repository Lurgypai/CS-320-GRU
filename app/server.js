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
    this.name = "";
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

          let roomFull = false;
          let joined = false;

          if(server.rooms.has(parsed.roomId)) {
            const currRoom = server.rooms.get(parsed.roomId);
            const team = currRoom.joinPlayer(parsed.peerId);
            if(team) {
              console.log("Joining: " + parsed.peerId + " to " + parsed.roomId + " as player " + team);
              parsed["team"] = team;

              roomFull = true;
              joined = true;
            }
          }
          else {
            joined = true;
            server.rooms.set(parsed.roomId, new Room(parsed.roomId, parsed.peerId));
            server.rooms.get(parsed.roomId).board.fillBoard();
            console.log("Creating room " + parsed.roomId + " with host " + parsed.peerId);
            parsed["team"] = 1;
          }
          if(joined) {
            this.clients[parsed.peerId - 1].ws.send(JSON.stringify(parsed));
            this.sendBoardTo(parsed.roomId, parsed.peerId);
            this.notifyRoomOfNames(parsed.roomId);
            if(roomFull) {
              this.notifyRoomOfTurn(parsed.roomId);
            }
          }
        }
        else if(parsed.id === 2) {
          const room = server.rooms.get(parsed.roomId);
          const jumpedPiece = room.board.movePiece(parsed.pieceId, parsed.x, parsed.y)

          parsed["teamId"] = room.currTeam;

          const canJump = room.board.getMoves(parsed.pieceId, 2).length;

          if(!jumpedPiece || !canJump) {
            if (parsed.teamId === 1) {
              room.currTeam = 2;
            }
            if (parsed.teamId === 2) {
              room.currTeam = 1;
            }
          }

          this.notifyRoomOfTurn(parsed.roomId);

          if(room.host !== 0) {
            console.log("sending move data and turn data to host");
            this.clients[room.host - 1].ws.send(message);
          }
          if(room.second !== 0) {
            console.log("sending move data and turn data to second");
            this.clients[room.second - 1].ws.send(message);
          }

        }
        else if(parsed.id === 0) {
          this.clients[parsed.peerId - 1].name = parsed.name;
        }
        else if(parsed.id === 7) {
          const room = this.rooms.get(parsed.roomId);
          room.board.fillBoard();
          this.sendBoardTo(parsed.roomId, room.host);
          this.sendBoardTo(parsed.roomId, room.second);
          this.notifyRoomOfTurn(parsed.roomId);
        }
      });

      ws.on('close', e => {
        for(let i = 0; i !== this.clients.length; ++i) {
          const connection = this.clients[i];
          if(connection.ws.readyState === SocketLib.CLOSED) {
            console.log("Client " + (i + 1) + " disconnected, marking as free");
            this.freeClients.push(i + 1);
          }
        }

        for(const freeId of this.freeClients) {
          this.clients[freeId - 1].name = "None";
          this.rooms.forEach(value => {
            console.log("Checking room " + value.id);
            //clear whoever disconnected from their room
            if(value.host === freeId) {
              value.host = 0;
              console.log("Host of room " + value.id + " exited");
              this.notifyRoomOfNames(value.id)
            }
            if(value.second === freeId) {
              value.second = 0;
              console.log("Second of room " + value.id + " exited");
              this.notifyRoomOfNames(value.id)
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

  notifyRoomOfTurn(roomId) {
    const room = this.rooms.get(roomId);
    console.log("sending turn " + room.currTeam);
    const turnData = {id: 5, team:room.currTeam};
    if(room.host !== 0) {
      console.log("sending turn data to host");
      this.clients[room.host - 1].ws.send(JSON.stringify(turnData));
    }
    if(room.second !== 0) {
      console.log("sending turn data to second");
      this.clients[room.second - 1].ws.send(JSON.stringify(turnData));
    }
  }

  sendBoardTo(roomId, peerId) {
    const currRoom = server.rooms.get(roomId);
    let pieces = [];
    currRoom.board.pieces.forEach(value => {
      pieces.push(JSON.stringify(value));
    });
    let boardState = { id: 4, board: JSON.stringify(currRoom.board), pieces: pieces };
    this.clients[peerId - 1].ws.send(JSON.stringify(boardState));
    console.log("Sending board state...");
  }

  sendAll(message) {
    for(const client of this.clients) {
      client.ws.send(message);
    }
  }

  notifyRoomOfNames(roomId) {
    const room = this.rooms.get(roomId);

    let name1 = "None", name2 = "None";
    let hasHost = false, hasSecond = false;

    if(room.host) {
      const host = this.clients[room.host - 1];
      name1 = host.name;
      hasHost = true;
    }

    if(room.second) {
      const second = this.clients[room.second - 1];
      name2 = second.name;
      hasSecond = true;
    }

    const roomData = {id: 6, name1:name1, name2:name2};
    if(hasHost) {
      console.log("sending name data to host");
      this.clients[room.host - 1].ws.send(JSON.stringify(roomData));
    }

    if(hasSecond) {
      console.log("sending name data to second");
      this.clients[room.second - 1].ws.send(JSON.stringify(roomData));
    }
  }
}

var server = new Server();
