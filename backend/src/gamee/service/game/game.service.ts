import { Injectable } from '@nestjs/common';
import { StateI } from 'src/gamee/model/state.interface';
import { PlayerI } from 'src/gamee/model/player.interfae';
import {
    grid,
    BORDURE,
    paddleHeight,
    paddleWidth,
    GRID_SIZE_H,
    GRID_SIZE_L,
    canvas,
    powerUp_color
} from 'src/utils/constants';


@Injectable()
export class GameService {

  constructor() {}

   initGame(is_public: Boolean) {
    let state: StateI = {
      id: 0,
      gameState: "pending",
      score: { p1: 0, p2: 0 },
      ball: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        dx: 5,
        dy: -5,
        resetting: false,
      },
      players: [{
        x: grid,
        y: canvas.height / 2 - paddleHeight / 2,
        vel: 0,
        option: "null"
      }, {
        x: canvas.width - 2 * grid,
        y: canvas.height / 2 - paddleHeight / 2,
        vel: 0,
        option: "null"
        }],
      
      powerUp: [{
        x: canvas.width / 2,
        y: canvas.height / 2,
      },
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
      }],
      
      powerUp_t: "lightblue",
      launchPowerUp: false,
      intervalId: null,
      is_public: is_public,
      status: 0,
      player1Id: 0,
      player2Id: 0,
    };
    return state;
  }
      
  gameLoop(state: StateI): number {
    if (!state) {
      return;
    }
    const ball = state.ball;
    const powerUP = state.powerUp;
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
    if ((ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
      ball.resetting = true;
      
      // give some time for the player to recover before launching the ball again
      setTimeout(() => {
        ball.resetting = false;
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
      }, 400);
    }
      
    // check to see if ball collides with paddle. if they do change x velocity
    if (this.collides(ball, state.players[0])) {
      ball.dx *= -1;
      
      // move ball next to the paddle otherwise the collision will happen again
      // in the next frame
      ball.x = state.players[0].x + /* leftPaddle.width */ 15;
    }
    else if (this.collides(ball, state.players[1])) {
      ball.dx *= -1;
      
      // move ball next to the paddle otherwise the collision will happen again
      // in the next frame
      ball.x = state.players[1].x - /* ball.width */ 15;
    }
      
    if (state.launchPowerUp) {
      powerUP[0].x += ball.dx
      powerUP[1].x -= ball.dx
    }
      
    if (!state.launchPowerUp) {
      state.launchPowerUp = !state.launchPowerUp
      setTimeout(() => {
        state.launchPowerUp = !state.launchPowerUp
        powerUP[0].x = powerUP[1].x = canvas.width / 2
        powerUP[0].y = Math.floor(Math.random() * canvas.height - grid);
        powerUP[1].y = Math.floor(Math.random() * canvas.height - grid);
        state.powerUp_t = powerUp_color[Math.floor(Math.random() * 3)]
      }, 5000);
    }
      
    // See if ball passed the paddle
    if (ball.x == 0) {
      state.score.p2++
      if (state.score.p2 > 15)
        return 2;
    }
    if (ball.x == GRID_SIZE_L * 5) {
      state.score.p1++
      if (state.score.p1 > 15)
        return 1;
    }
    return 0;
      
  }
      
      
  collides(ball, paddle): Boolean {
    const ballsize = grid;
    return ball.x < paddle.x + paddleWidth &&
      ball.x + ballsize > paddle.x &&
      ball.y < paddle.y + paddleHeight &&
      ball.y + ballsize > paddle.y;
  }
      
  getUpdatedVelocity(keyCode): number {
    switch (keyCode) {
      case 38: { // up
        return -20;
      }
      case 40: { // down
        return 20;
      }
    }
  }
    
  makeid(length): string {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  
  getRoomById(rooms: StateI[], id: number): number {

    let index: number = 0;
      for (const room of rooms) {
        if (room.id == id)
          return index;
        index++;
    }
    return -1;    
  }

  getRoomForQueue(rooms: StateI[]): number {

    let index: number = 0;
      for (const room of rooms) {
        if (room.status == 1 && room.is_public == true)
          return index;
        index++;
    }
    return -1;    
  }
}
