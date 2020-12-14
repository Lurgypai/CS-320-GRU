//code adapted from https://stackoverflow.com/questions/9880279/how-do-i-add-a-simple-onclick-event-handler-to-a-canvas-element
class UI {
  constructor() {
    this.boardCanvas = document.getElementById('board');
    this.canvasLeft = this.boardCanvas.offsetLeft + this.boardCanvas.clientLeft;
    this.canvasTop = this.boardCanvas.offsetTop + this.boardCanvas.clientTop;
    this.canvasContext = this.boardCanvas.getContext('2d');
    this.elements = [];
    this.board = new Board();
    this.board.fillBoard();

    this.targetUrl = 'ws://localhost:8080'
    this.connection = new WebSocket(this.targetUrl);

    this.connection.onmessage = e => {
      console.log(e);
    }

    this.board.movePiece(1, 1, 4);
    this.board.movePiece(6, 3, 4);
    this.board.printBoard();
  }

  handleClick(element) {
    const row = element.row;
    const col = element.col;
    const pieceId = this.board.data[row][col];
    console.log(this.board.getValidMoves(pieceId));
  }

  prepareBoard() {
    //set up the click listener
    const connection = this.connection;
    const canvasContext = this.canvasContext;
    const board = this.board;
    const UI = this;
    const elements = this.elements;
    const canvasLeft = this.canvasLeft;
    const canvasTop = this.canvasTop;

    this.boardCanvas.addEventListener('click', function (event) {
      let x = event.pageX - canvasLeft,
          y = event.pageY - canvasTop;

      // Collision detection between clicked offset and element.
      elements.forEach(function (element) {
        if (y > element.top && y < element.top + element.height
            && x > element.left && x < element.left + element.width) {
            UI.handleClick(element);
        }
      });

    }, false);

    // Add elements.
    for (let i = 0; i != 64; ++i) {
      const col = i % 8;
      const row = Math.floor(i / 8);

      let color = "#636363"
      if (col % 2 == 0 && row % 2 == 0) {
        color = "#c26d6d";
      }
      if (col % 2 == 1 && row % 2 == 1) {
        color = "#c26d6d";
      }
      this.elements.push({
        id: i,
        colour: color,
        width: 100,
        height: 100,
        top: row * 100,
        left: col * 100,
        row: row,
        col: col
      });
    }

// Render elements.
    this.elements.forEach(function (element) {

      canvasContext.fillStyle = element.colour;
      canvasContext.fillRect(element.left, element.top, element.width, element.height);

      const pieceId = board.data[element.row][element.col];

      if(pieceId !== 0) {
        let img = new Image();
        img.onload = function () {
          canvasContext.drawImage(img, element.left, element.top);
        }
        if(board.pieces.get(pieceId).team === 1) {
          img.src = 'black_piece.png';
        } else {
          img.src = 'red_piece.png';
        }
      }
    });
  }

// this can be reutilized to be passed arguments from Board to print the desired piece.
  drawPiece(context, element) {
    let img = new Image();
    img.onload = function () {
      context.drawImage(img, element.left, element.top);
    }
    img.src = 'black_piece.png';
  }
}
