import { Injectable } from '@nestjs/common';
import { StateI } from 'src/gamee/model/state.interface';
import {
    grid,
    BORDURE,
    paddleHeight,
    paddleWidth,
    FRAME_RATE,
    GRID_SIZE_H,
    GRID_SIZE_L,
    canvas
} from 'src/utils/constants';


@Injectable()
export class GameService {

    constructor(
    ){}

    initGame() {
        const state: StateI =  this.createGameState()
        return state;
      }
      
      createGameState(): StateI {
          return {
            id: 0,
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
      
       gameLoop(state) {
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
      
      
    collides(ball, paddle) {
        const ballsize = grid;
        return ball.x < paddle.x + paddleWidth &&
               ball.x + ballsize > paddle.x &&
               ball.y < paddle.y + paddleHeight &&
               ball.y + ballsize > paddle.y;
      }
      
       getUpdatedVelocity(keyCode) {
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
    
    makeid(length) {
     var result           = '';
     var characters       = '0123456789';
     var charactersLength = characters.length;
     for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }
     return result;
  }
}
