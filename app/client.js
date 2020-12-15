class GameClient {
  constructor(ui) {
    this.targetUrl = 'ws://167.99.14.174:8080'
    this.connection = new WebSocket(this.targetUrl);
    this.peerId = 0;
    this.roomId = "";
    this.ui = ui;

    const connection = this.connection;

    this.connection.onopen = () => {
      let joinRequest = {id: 0}
      this.connection.send(JSON.stringify(joinRequest));
      console.log("requesting to join: " + JSON.stringify(joinRequest));
    }

    this.connection.onmessage = message => {
      var parsed = JSON.parse(message.data);
      console.log(parsed);
      if(parsed.id === 1) {
        this.peerId = parsed.peerId;

        let roomRequest = {peerId: this.peerId, id: 3, roomId: "test"};
        connection.send(JSON.stringify(roomRequest));
        console.log("requesting a room:" + JSON.stringify(roomRequest));
      }
      if(parsed.id === 3) {
        this.roomId = parsed.roomId;
      }
      this.onReceive(message.data)
    }

    this.connection.onerror = error => {
      console.log(`WebSocket error: ${error}`)
    }
  }

  sendMove(roomId, pieceId, x, y) {
    let move = {peerId: this.peerId, roomId: this.roomId, id: 2, pieceId: pieceId, x: x, y: y};
    this.connection.send(JSON.stringify(move));
  }

  onReceive(message) {
    var parsed = (JSON).parse(message);
    if(parsed.id === 2) {
      this.ui.makeMove(parsed.pieceId, parsed.x, parsed.y);
      this.ui.waiting = false;
    }
  }
}
