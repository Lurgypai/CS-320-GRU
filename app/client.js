class GameClient {
  constructor(ui, url) {
    this.targetUrl = url;
    this.connection = new WebSocket(this.targetUrl);
    this.peerId = 0;
    this.roomId = "";
    this.ui = ui;
    this.name = "fred";

    this.connection.onopen = () => {
    }

    this.connection.onmessage = message => {
      var parsed = JSON.parse(message.data);
      console.log(parsed);
      if(parsed.id === 1) {
        this.peerId = parsed.peerId;

        const connect = {peerId:this.peerId,id:0,name:this.name }
        this.connection.send(JSON.stringify(connect));

        let roomRequest = {peerId: this.peerId, id: 3, roomId: this.roomId};
        this.connection.send(JSON.stringify(roomRequest));
        console.log("requesting a room:" + JSON.stringify(roomRequest));
      }
      if(parsed.id === 3) {
        console.log("Joining room " + parsed.roomId + " as player " + parsed.team);
        this.roomId = parsed.roomId;
        this.ui.teamId = parsed.team;
      }
      if(parsed.id === 4) {
        Object.assign(this.ui.board, JSON.parse(parsed.board));
        this.ui.board.pieces = new Map();
        //console.log("Attempting to load: " + parsed.pieces);
        const pieces = JSON.parse('[' + parsed.pieces + ']');
        //console.log("Attempting to load: " + parsed.pieces);
        for(const obj of pieces) {
          const piece = new Piece();
          Object.assign(piece, obj);
          console.log("loading piece: " + JSON.stringify(piece));
          this.ui.board.pieces.set(piece.id, piece)
        }
        this.ui.prepareBoard();
      }
      this.onReceive(message.data);
    }

    this.connection.onerror = error => {
      console.log(`WebSocket error: ${error}`)
    }
  }

  sendMove(roomId, pieceId, x, y, isJump) {
    console.log("moving piece: " + pieceId + " to " + x +", "+ y);
    let move = {peerId: this.peerId, roomId: this.roomId, id: 2, pieceId: pieceId, x: x, y: y, jump: isJump};
    this.connection.send(JSON.stringify(move));
  }

  onReceive(message) {
    var parsed = (JSON).parse(message);
    if(parsed.id === 2) {
      this.ui.makeMove(parsed.pieceId, parsed.x, parsed.y);
    }
    if(parsed.id === 5) {
      console.log("Received turn notification")
      this.ui.displayTurn(parsed.team);
      if(parsed.team === this.ui.teamId) {
        console.log("Our turn");
        this.ui.waiting = false;
      }
    }
    if(parsed.id === 6) {
      this.ui.setDisplayNames(parsed.name1, parsed.name2);
    }
  }
}
