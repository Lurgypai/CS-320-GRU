//stores a 2d coordinate
class Pos {
  constructor(x_, y_) {
    this.x = x_;
    this.y = y_;
  }
}

//stores an id, and what piece they currently want to move
class Player {
  constructor(id_) {
    this.id = id_;
    this.targetPiece = new Pos(-1, -1);
    this.targetMove = new Pos(-1, -1);
  }
}

class Piece {
  constructor(id_, team_) {
    this.id = id_;
    this.king = false;
    this.team = team_;
    this.alive = false;
  }
}

class Board
{
  //generate a 2d array of pieces
  constructor()
  {
    this.width = 8;
    this.height = 8;
    this.data = [];
    this.pieces = new Map();
    this.pieceCount = 24

    for (var i = 0; i !== this.width; ++i) {
      var row = [];
      for (var j = 0; j !== this.height; ++j) {
        row.push(0);
      }
      this.data.push(row);
    }

    var currPieceId = 0;
    for (var i = 0; i !== this.pieceCount / 2; ++i) {
      this.pieces.set(++currPieceId, new Piece(currPieceId, 1));
    }
    for (var i = 0; i !== this.pieceCount / 2; ++i) {
      this.pieces.set(++currPieceId, new Piece(currPieceId, 2));
    }
  }

  //draw the board as text (for debugging)
  printBoard()
  {
    //removed the row divider as it took to much space and made it hard to see
    //var rowDivider = "+-+-+-+-+-+-+-+-+";
    //console.log(rowDivider);
    for (var row of this.data) {
      var rowString = "|";
      for (var colVal of row) {
        if (colVal === 0) {
          rowString += ' |';
          continue;
        } else {

        }
        var piece = this.pieces.get(colVal);
        var drawChar = ' ';
        switch (piece.team) {
          case 1:
            drawChar = '@';
            break;
          case 2:
            drawChar = '#';
            break;
        }
        rowString += drawChar + '|';
      }
      console.log(rowString);
      //console.log(rowDivider);
    }
  }

  //remove all pieces
  clearBoard()
  {
    for (var i = 0; i != this.height; ++i) {
      for (var j = 0; j != this.width; ++j) {
        this.data[i][j] = 0;
      }
    }
  }

  //clear and fill with pieces
  fillBoard()
  {
    this.clearBoard();
    var currId = 0;

    for (var pair of this.pieces) {
      pair[1].alive = true;
      pair[1].king = false;
    }

    for (var i = 0; i != this.height; ++i) {
      for (var j = 0; j != this.width; ++j) {

        //start with white, every other row fill every other piece
        if (i % 2 == 0 && j % 2 == 1 && i < 3) {
          this.data[i][j] = ++currId;
        } else
          if (i % 2 == 1 && j % 2 == 0 && i < 3) {
            this.data[i][j] = ++currId;
          }
        //black, the same, but lower
        if (i % 2 == 0 && j % 2 == 1 && i >= 5) {
          this.data[i][j] = ++currId;
        } else
          if (i % 2 == 1 && j % 2 == 0 && i >= 5) {
            this.data[i][j] = ++currId;
          }
      }
    }
  }

  validMove()
  {
    /*
    Needs data regarding the piece chosen & the position chosen to move will then check
    (1)If move is in the bounds of the board (2)Piece isn't too far (3)Piece moves in the correct direction
    (3)Single jumps are not more than 1piece (4)MultiJumps rules are followed
    Need to know pieces are a king or pawn to discern valid moves for respective pieces
    */
  }
  checkWin()
  {
    /* This will use the array of active pieces (IF we have separate arrays for each player's pieces)
    to determine a winner, we also need to see if pieces are unable to move which results in a draw or loss
    we will need to cooperate with validity of moves here
    */
  }
}
module.exports = {Board};