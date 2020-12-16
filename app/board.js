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
    this.col = 0;
    this.row = 0;
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

    this.pieces.clear();
  }

  debugBoard() {
    this.clearBoard();
    var currId = 0;

    var currPieceId = 0;
    for (var i = 0; i !== this.pieceCount / 2; ++i) {
      this.pieces.set(++currPieceId, new Piece(currPieceId, 1));
    }

    for (var pair of this.pieces) {
      pair[1].alive = true;
      pair[1].king = false;
    }

    for (var i = 0; i != this.height; ++i) {
      for (var j = 0; j != this.width; ++j) {

        //start with white, every other row fill every other piece
        if (i % 2 == 0 && j % 2 == 1 && i < 3) {
          this.data[i][j] = ++currId;
          this.pieces.get(currId).col = j;
          this.pieces.get(currId).row = i;
        } else
          if (i % 2 == 1 && j % 2 == 0 && i < 3) {
            this.data[i][j] = ++currId;
            this.pieces.get(currId).col = j;
            this.pieces.get(currId).row = i;
          }
      }
    }
    this.data[5][2] = ++currId;
    this.pieces.set(currId, new Piece(currId, 2));
    this.pieces.get(currId).row = 5;
    this.pieces.get(currId).col = 2;
  }

  //clear and fill with pieces
  fillBoard()
  {
    this.clearBoard();

    var currPieceId = 0;
    for (var i = 0; i !== this.pieceCount / 2; ++i) {
      this.pieces.set(++currPieceId, new Piece(currPieceId, 1));
    }
    for (var i = 0; i !== this.pieceCount / 2; ++i) {
      this.pieces.set(++currPieceId, new Piece(currPieceId, 2));
    }

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
          this.pieces.get(currId).col = j;
          this.pieces.get(currId).row = i;
        } else
          if (i % 2 == 1 && j % 2 == 0 && i < 3) {
            this.data[i][j] = ++currId;
            this.pieces.get(currId).col = j;
            this.pieces.get(currId).row = i;
          }
        //black, the same, but lower
        if (i % 2 == 0 && j % 2 == 1 && i >= 5) {
          this.data[i][j] = ++currId;
          this.pieces.get(currId).col = j;
          this.pieces.get(currId).row = i;
        } else
          if (i % 2 == 1 && j % 2 == 0 && i >= 5) {
            this.data[i][j] = ++currId;
            this.pieces.get(currId).col = j;
            this.pieces.get(currId).row = i;
          }
      }
    }
  }

  getMoves(pieceId, distance) {
    let validMoves = [];
    if(this.pieces.has(pieceId)) {
      const piece = this.pieces.get(pieceId);
      //get team
      //get valid moves based off of team
      let offsets = [];
      if(!piece.king) {
        let direction = 0;
        if(piece.team === 1) {
          direction = 1;
        } else {
          direction = -1;
        }
        offsets.push([-1, direction]);
        offsets.push([1, direction]);
      } else {
        offsets.push([-1, -1]);
        offsets.push([1, -1]);
        offsets.push([-1, 1]);
        offsets.push([1, 1]);
      }

      for(let i = 0; i !== offsets.length; ++i)
        for(let j = 0; j !== offsets[i].length; ++j)
          offsets[i][j] *= distance;

      console.log("distance: " + distance + ", offset " + offsets);

      let currPos = [piece.col, piece.row];
      for(const offset of offsets) {
        let newPos = [offset[0] + currPos[0], offset[1] + currPos[1]];
        if(newPos[0] >= 0 && newPos[0] < this.width && newPos[1] >= 0 && newPos[1] < this.height) {
          if(!this.data[newPos[1]][newPos[0]]) {
            const jumpedId = this.getJumpedPiece(currPos, [newPos[0], newPos[1]]);

            if(distance === 1) {
              validMoves.push(newPos);
            }
            else if(jumpedId) {
              const jumpedPiece = this.pieces.get(jumpedId);
              if(jumpedPiece.team !== piece.team) {
                validMoves.push(newPos);
              }
            }
          }
        }
      }
    }
    return validMoves;
  }

  getJumpedPiece(startPos, endPos) {
    let pieceId = 0;
    if(startPos[0] < endPos[0]) {
      //moved right down
      if(startPos[1] < endPos[1]) {
        pieceId = this.data[startPos[1] + 1][startPos[0] + 1];
      }
      //moved right up
      else if(startPos[1] > endPos[1]) {
        pieceId = this.data[startPos[1] - 1][startPos[0] + 1];
      }
    }
    else if(startPos[0] > endPos[0]) {
      //moved left down
      if(startPos[1] < endPos[1]) {
        pieceId = this.data[startPos[1] + 1][startPos[0] - 1];
      }
      //moved left up;
      else if(startPos[1] > endPos[1]) {
        pieceId = this.data[startPos[1] - 1][startPos[0] - 1];
      }
    }
    return pieceId;
  }

  doJump(startPos, endPos) {
    let pieceId = this.getJumpedPiece(startPos, endPos);
    if(pieceId !== 0) {
      console.log("Jumping piece " + pieceId);
      const targetPiece = this.pieces.get(pieceId);
      this.data[targetPiece.row][targetPiece.col] = 0;
      this.pieces.delete(pieceId);
      return true;
    }
    return false;
  }

  getValidPieces(teamId) {
    let validPieces = [];

    this.pieces.forEach(value => {
      //console.log("Currpiece team: " + value.team + " teamId: " + teamId);
      let singleMoveCount = this.getMoves(value.id, 1).length;
      let jumpMoveCount = this.getMoves(value.id, 2).length;

      if (value.team === teamId && (singleMoveCount || jumpMoveCount)) {
        validPieces.push(value.pieceId);
      }
    });

    return validPieces;
  }

  movePiece(pieceId, newX, newY) {
    const piece = this.pieces.get(pieceId);

    const pieceDeleted = this.doJump([piece.col, piece.row], [newX, newY]);

    this.data[piece.row][piece.col] = 0;
    piece.row = newY;
    piece.col = newX;
    this.data[newY][newX] = pieceId;

    if((piece.team === 1 && newY === this.height - 1) || (piece.team === 2 && newY === 0)) {
      piece.king = true;
    }
    return pieceDeleted;
  }
}
module.exports = {Board};
