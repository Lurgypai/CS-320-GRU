class GameClient {
  constructor() {
    this.targetUrl = 'ws://localhost:8080'
    this.connection = new WebSocket(this.targetUrl);
    this.onReceive = function (message) {};

    this.connection.onopen = () => {
      let joinRequest = {id: 0, name: "test"}
      this.connection.send(JSON.stringify(joinRequest));
    }

    this.connection.onmessage = message => {
      console.log(message);
      this.onReceive(message)
    }

    this.connection.onerror = error => {
      console.log(`WebSocket error: ${error}`)
    }
  }

  sendMove(roomId, pieceId, x, y) {
    let move = {id: 2, pieceId: pieceId, x: x, y: y};
    this.connection.send(JSON.stringify(move));
  }
}
