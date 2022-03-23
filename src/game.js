// DON'T TOUCH THIS CODE
if (typeof window === 'undefined'){
  var readline = require("readline");
  var Piece = require("./piece.js");
  var Board = require("./board.js");
}
// DON'T TOUCH THIS CODE

/**
 * Sets up the game with a board and the first player to play a turn.
 */
function Game (arg1="computer", arg2="human") {
  this.board = new Board();
  this.turn = "black";
  this.black = arg1;
  this.white = arg2;
};

/**
 * Flips the current turn to the opposite color.
 */
Game.prototype._flipTurn = function () {
  this.turn = (this.turn == "black") ? "white" : "black";
};

// Dreaded global state!
let rlInterface;

/**
 * Creates a readline interface and starts the run loop.
 */
Game.prototype.play = function () {
  rlInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  this.runLoop(function () {
    rlInterface.close();
    rlInterface = null;
  });
};

/**
 * Gets the next move from the current player and
 * attempts to make the play.
 */
Game.prototype.playTurn = function (callback) {
  this.board.print();
  if (this.turn === "black") {
    if (this.black === "human") {
      this.humanTurn(callback);
    }
  }
  else if (this.white === "human") {
    this.humanTurn(callback);
  }
  else {
    this.computerTurn(callback);
  }
};

Game.prototype.computerTurn = function (callback) {
  let moves = this.board.validMoves(this.turn);
  let hashOfMoves = {};
  
  for (let i = 0; i < moves.length; i++) {
    hashOfMoves[moves[i]] = 0;
    for (let j = 0; j < Board.DIRS.length; j++) {
      hashOfMoves[moves[i]] += this.board._positionsToFlip(moves[i], this.turn, Board.DIRS[j]);
    }
  }

  const max = Object.keys(hashOfMoves).reduce((a, v) => Math.max(a, hashOfMoves[v]), 0);
  const result = Object.keys(hashOfMoves).filter(v => hashOfMoves[v] === max);
  
  this.board.placePiece(result[0], this.turn);
  this._flipTurn();
  callback();
};

Game.prototype.humanTurn = function (callback) {
  rlInterface.question(
    `${this.turn}, where do you want to move?`,
    handleResponse.bind(this)
  );

  function handleResponse(answer) {
    const pos = JSON.parse(answer);
    if (!this.board.validMove(pos, this.turn)) {
      console.log("Invalid move!");
      this.playTurn(callback);
      return;
    }

    this.board.placePiece(pos, this.turn);
    this._flipTurn();
    callback();
  }
};

/**
 * Continues game play, switching turns, until the game is over.
 */
Game.prototype.runLoop = function (overCallback) {
  if (this.board.isOver()) {
    console.log("The game is over!");
    overCallback();
  } else if (!this.board.hasMove(this.turn)) {
    console.log(`${this.turn} has no move!`);
    this._flipTurn();
    this.runLoop();
  } else {
    this.playTurn(this.runLoop.bind(this, overCallback));
  }
};

// DON'T TOUCH THIS CODE
if (typeof window === 'undefined') {
  module.exports = Game;
}
// DON'T TOUCH THIS CODE