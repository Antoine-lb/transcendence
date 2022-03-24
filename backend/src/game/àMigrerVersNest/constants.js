const FRAME_RATE = 50;
const GRID_SIZE = 20;
///////
const BORDURE = 15;
const GRID_SIZE_H = 117;
const GRID_SIZE_L = 150;
const grid = 15;
const paddleWidth = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = 585 - grid - paddleHeight;
const canvas = { width : 750, height : 585};

module.exports = {
  FRAME_RATE,
  GRID_SIZE,
///////
  GRID_SIZE_H,
  GRID_SIZE_L,
  BORDURE,
  grid,
  paddleHeight,
  paddleWidth,
  maxPaddleY,
  canvas
}
