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
  new:
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
turn_data
{
  id: 5
  team:
  name:
}
name_data
{
  id: 6
  name1
  name2
}
reset
{
  id:7;
  roomId:
}
*/

class UI {
  constructor(url) {
    this.boardCanvas = document.getElementById('board');
    this.canvasLeft = this.boardCanvas.offsetLeft + this.boardCanvas.clientLeft;
    this.canvasTop = this.boardCanvas.offsetTop + this.boardCanvas.clientTop;
    this.canvasContext = this.boardCanvas.getContext('2d');
    this.elements = [];
    this.board = new Board();
    this.client = new GameClient(this, url);
    this.selectedPieceId = 0;
    this.waiting = true;
    this.jumping = false;
    this.teamId = 0;
    this.highlightedCells = [];

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
          let singleMoves = [];
          if(!this.jumping)
            singleMoves = this.board.getMoves(this.selectedPieceId, 1);
          const jumpMoves = this.board.getMoves(this.selectedPieceId, 2);
          let isSingle = false, isJump = false;
          for (const move of singleMoves) {
            if (move[0] === col && move[1] === row) {
              console.log("found single move");
              isSingle = true;
              break;
            }
          }
          for (const move of jumpMoves) {
            if (move[0] === col && move[1] === row) {
              console.log("found jump move");
              isJump = true;
              this.jumping = true;
              break;
            }
          }
          if (isSingle || isJump) {
            this.client.sendMove("test", this.selectedPieceId, col, row, isJump);
            if(!this.jumping) {
              this.selectedPieceId = 0;
            }
            this.waiting = true;
          }
        }
      }
      if (clickedPieceId && !this.jumping) {
        this.selectedPieceId = clickedPieceId;
        this.highlightAvailableMoves();
      }
    }
  }

  prepareBoard() {
    //set up the click listener
    const canvasContext = this.canvasContext;
    const board = this.board;
    const UI = this;
    const elements = this.elements;
    const boardCanvas = this.boardCanvas;

    this.boardCanvas.addEventListener('click', function (event) {
      const coords = boardCanvas.relMouseCoords(event);
      let x = coords.x,
          y = coords.y;

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
        const piece = board.pieces.get(pieceId);
        if(piece.team === 1) {
            img.src = 'black_piece.png';
            if(piece.king)
              img.src = 'blackking_piece.png';
          }
          else {
            img.src = 'red_piece.png';
            if(piece.king)
              img.src = 'redking_piece.png';
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

  displayImg(pixX, pixY, src) {
    let img = new Image();
    img.onload = () => {
      this.canvasContext.drawImage(img, pixX, pixY);
    }
    img.src = src;
  }

  displayWin() {
    this.displayImg(200, 200, "you_win.png");
  }

  displayLoss() {
    this.displayImg(200, 200, "you_dont_win.png");
  }

  highlightAvailableMoves() {
    this.clearHighlighting();

    this.highlightSingles();
    this.highlightJumps();
  }

  highlightJumps() {
    const jumpMoves = this.board.getMoves(this.selectedPieceId, 2);
    for(const move of jumpMoves) {
      this.displayImg(100 * move[0], 100 * move[1], "highlight_piece.png");
      this.highlightedCells.push(move);
    }
  }

  highlightSingles() {
    const singleMoves = this.board.getMoves(this.selectedPieceId, 1);
    for(const move of singleMoves) {
      this.displayImg(100 * move[0], 100 * move[1], "highlight_piece.png");
      this.highlightedCells.push(move);
    }
  }

  clearHighlighting() {
    for(const cell of this.highlightedCells) {
      this.clearPosition(cell[0], cell[1]);
    }
    this.highlightedCells = [];
  }


  setDisplayNames(name1, name2) {
    document.getElementById("player1_name").innerHTML = name1;
    document.getElementById("player2_name").innerHTML = name2;
  }

  displayTurn(teamId) {
    if(teamId === 1) {
      document.getElementById("player1_turn").innerHTML = "Your Turn!";
      document.getElementById("player2_turn").innerHTML = "Waiting...";
    }
    else {
      document.getElementById("player2_turn").innerHTML = "Your Turn!";
      document.getElementById("player1_turn").innerHTML = "Waiting...";
    }
  }

  makeMove(pieceId, col, row) {

    this.clearHighlighting();

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

    if(this.jumping) {
      if(!this.board.getMoves(this.selectedPieceId, 2).length) {
        this.jumping = false;
        this.selectedPieceId = 0;
      } else {
        this.highlightJumps();
      }
    }

    //this is really important do not delete
    let toerhTeam = 1;

    let team1Pieces = this.board.getValidPieces(1).length;
    let team2Pieces = this.board.getValidPieces(2).length;

    console.log("team 1 has " + team1Pieces + " team 2 has " + team2Pieces);

    if(!team2Pieces) {
      if(this.teamId === 1)
        this.displayWin();
      else
        this.displayLoss();

      let game_over = document.getElementById("game_over_buttons");
      game_over.style.display="block";
    }
    else if (!team1Pieces) {
      if(this.teamId === 2)
        this.displayWin();
      else
        this.displayLoss();

      let game_over = document.getElementById("game_over_buttons");
      game_over.style.display="block";
    }
  }
}
