const { GRID_SIZE_L, GRID_SIZE_H, grid, canvas, paddleHeight, paddleWidth} = require('./constants');

module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
}

function initGame() {
  const state = createGameState()
  return state;
}

function createGameState() {
  return {
    score : { p1 : 0, p2 :0 },
    ball :  { 
      x : GRID_SIZE_H / 2,
      y : GRID_SIZE_L / 2,
      dx: 5,
      dy: -5
    },
    players: [{
      x: grid,
      y: GRID_SIZE_H / 2,
      vel: 0
    }, {
      x: canvas.width - 2 * grid,
      y: GRID_SIZE_H / 2,
      vel: 0
    }],
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }

  const ball = state.ball;
  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  playerOne.x += playerOne.vel;
  playerTwo.x += playerTwo.vel;

  // move ball by its velocity
  ball.x += ball.dx;
  ball.y += ball.dy;

  // prevent ball from going through walls by changing its velocity
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
  }
  else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
  }
  // reset ball if it goes past paddle (but only if we haven't already done so)
  if ( (ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    ball.resetting = true;

    // give some time for the player to recover before launching the ball again
    setTimeout(() => {
      ball.resetting = false;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
    }, 400);
  }

  // check to see if ball collides with paddle. if they do change x velocity
  if (collides(ball, state.players[0])) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = state.players[0].x + /* leftPaddle.width */ 15;
  }
  else if (collides(ball, state.players[1])) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = state.players[1].x - /* ball.width */ 15 ;
  }

  // See if ball passed the paddle
  if (ball.x < 0) {
    return 2;
  }
  if (ball.x > GRID_SIZE_L * 5) {
    console.log("yes", ball.x, GRID_SIZE_L)
    return 1;
  }
  return false;
}

function collides(ball, paddle) {
  const ballsize = grid;
  return ball.x < paddle.x + paddleWidth &&
         ball.x + ballsize > paddle.x &&
         ball.y < paddle.y + paddleHeight &&
         ball.y + ballsize > paddle.y;
}

function getUpdatedVelocity(keyCode) {
  console.log("(getUpdatedVelocity) key pressed :", keyCode)
  switch (keyCode) {
    case 38: { // up
      return -20;
    }
    case 40: { // down
      return 20;
    }
  }
}
