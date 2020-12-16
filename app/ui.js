//code adapted from https://stackoverflow.com/questions/9880279/how-do-i-add-a-simple-onclick-event-handler-to-a-canvas-element
/*
client->server
connect_request
{
  id: 0
  name:
}
server->client
connect_accept
{
  id: 1
  peerId:
  teamId
}

room
{
  peerId:
  id: 3
  roomId:
}

client->server
server->client
make_move
{
  id: 2
  roomId:
  pieceId:
  moveX:
  moveY:
  peerId:
  jump:
}

server->client
send_board
{
  id: 4
  board
  pieces
  currTeam
}

server->client
your_turn
{
  id: 5
}
*/

class UI {
  constructor() {
    this.boardCanvas = document.getElementById('board');
    this.canvasLeft = this.boardCanvas.offsetLeft + this.boardCanvas.clientLeft;
    this.canvasTop = this.boardCanvas.offsetTop + this.boardCanvas.clientTop;
    this.canvasContext = this.boardCanvas.getContext('2d');
    this.elements = [];
    this.board = new Board();
    this.client = new GameClient(this);
    this.selectedPieceId = 0;
    this.waiting = true;
    this.teamId = 0;

    this.board.printBoard();
  }

  handleClick(element) {
    const row = element.row;
    const col = element.col;
    let clickedPieceId = this.board.data[row][col];
    //console.log("ValidPieces: " + this.board.getValidPieces(this.teamId));
    console.log("Selected piece " + clickedPieceId);
    if(clickedPieceId && this.board.pieces.get(clickedPieceId).team !== this.teamId)
      clickedPieceId = 0;

    if(!this.waiting) {
      if (this.selectedPieceId) {
        if (!clickedPieceId) {
          const singleMoves = this.board.getMoves(this.selectedPieceId, 1);
          const jumpMoves = this.board.getMoves(this.selectedPieceId, 2);
          let isSingle = false, isJump = false;
          for (const move of singleMoves) {
            if (move[0] === col && move[1] === row) {
              console.log("found single move");
              isSingle = true;
              break;
            }
          }
          if(!isSingle) {
            for (const move of jumpMoves) {
              if (move[0] === col && move[1] === row) {
                console.log("found jump move");
                isJump = true;
                break;
              }
            }
          }
          if (isSingle || isJump) {
            if(isJump)
              console.log("sending jump...");
            else
              console.log("sending single...")
            this.client.sendMove("test", this.selectedPieceId, col, row, isJump);
            this.waiting = true;
          }
        }
      }
      if (clickedPieceId)
        this.selectedPieceId = clickedPieceId;
    }
  }

  prepareBoard() {
    //set up the click listener
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
  drawPiece(x, y, team, king) {
    let img = new Image();
    const canvasContext = this.canvasContext;
    img.onload = function () {
      canvasContext.drawImage(img, x*100, y*100);
    }
    if(team === 1) {
      img.src = 'black_piece.png';
      if(king)
        img.src = 'blackking_piece.png';
    }
    else {
      img.src = 'red_piece.png';
      if(king)
        img.src = 'redking_piece.png';
    }
  }

  clearPosition(x, y) {
    const element = this.elements[x + y * this.board.width];
    this.canvasContext.fillStyle = element.colour;
    this.canvasContext.fillRect(element.left, element.top, element.width, element.height);
  }

  makeMove(pieceId, col, row) {
    console.log("Moving piece " + pieceId)
    const piece = this.board.pieces.get(pieceId);
    this.clearPosition(piece.col, piece.row);
    const jumped = this.board.getJumpedPiece([piece.col, piece.row], [col, row]);
    if(jumped) {
      const jumpedPiece = this.board.pieces.get(jumped);
      this.clearPosition(jumpedPiece.col, jumpedPiece.row);
    }

    this.board.movePiece(pieceId, col, row);
    //update gfx
    this.drawPiece(col, row, piece.team, piece.king);
  }
}
