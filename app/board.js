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

  getValidMoves(pieceId) {
    let validMoves = [];
    if(this.pieces.has(pieceId)) {
      const piece = this.pieces.get(pieceId);
      //get team
      //get valid moves based off of team
      var direction = 0;
      if(!piece.king) {
        if(piece.team == 1) {
          direction = 1;
        } else {
          direction = -1;
        }
      }
      let currPos = [piece.col, piece.row];
      if(currPos[0] > 0) {
        let targetPos = [currPos[0] - 1, currPos[1] + direction];
        if(!this.data[targetPos[1]][targetPos[0]]) {
          validMoves.push(targetPos);
        }
      }
      if(currPos[0] < this.width-1) {
        let targetPos = [currPos[0] + 1, currPos[1] + direction];
        if(!this.data[targetPos[1]][targetPos[0]]) {
          validMoves.push(targetPos);
        }
      }

      const jumpMoves = this.getJumpMoves(direction, currPos, piece.team);
      validMoves = validMoves.concat(jumpMoves);
    }
    return validMoves;
  }

  getJumpMoves(direction, currPos, teamId) {
    let targetPos = [0, 0];
    let ret = [];
    if(currPos[0] > 1) {
      targetPos = [currPos[0] - 1, currPos[1] + direction];
      if(targetPos[1] > 0 && targetPos[1] < this.height - 1) {
        let targetId = this.data[targetPos[1]][targetPos[0]];
        if (targetId) {
          const targetPiece = this.pieces.get(targetId);
          if (targetPiece.team !== teamId) {
            let targetMove = [currPos[0] - 2, currPos[1] + (direction * 2)];
            //if there isn't a piece there
            if(!this.data[targetMove[1]][targetMove[0]]) {
              ret.push(targetMove);
              ret = ret.concat(this.getJumpMoves(direction, targetMove, teamId));
            }
          }
        }
      }
    }
    if(currPos[0] < this.width - 2) {
      targetPos = [currPos[0] + 1, currPos[1] + direction];
      if(targetPos[1] > 0 && targetPos[1] < this.height - 1) {
        let targetId = this.data[targetPos[1]][targetPos[0]];
        if (targetId) {
          const targetPiece = this.pieces.get(targetId);
          if (targetPiece.team !== teamId) {
            let targetMove = [currPos[0] + 2, currPos[1] + (direction * 2)];
            //if there isn't a piece  there
            if(!this.data[targetMove[1]][targetMove[0]]) {
              ret.push(targetMove);
              ret = ret.concat(this.getJumpMoves(direction, targetMove, teamId));
            }
          }
        }
      }
    }
    return ret;
  }

  validMove(pieceId, newX, newY)
  {
    if(this.pieces.has(pieceId)) {

    }
    /*
    Needs data regarding the piece chosen & the position chosen to move will then check
    (1)If move is in the bounds of the board
    (2)Piece isn't too far
    (3)Piece moves in the correct direction
    (3)Single jumps are not more than 1piece
    (4)MultiJumps rules are followed
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

  movePiece(pieceId, newX, newY) {
    const piece = this.pieces.get(pieceId);

    this.data[piece.row][piece.col] = 0;
    this.data[newY][newX] = pieceId;
  }
}
module.exports = {Board};
