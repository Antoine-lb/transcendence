import { Injectable } from '@nestjs/common';
import { StateI } from 'src/gamee/model/state.interface';
import { PlayerI } from 'src/gamee/model/player.interfae';
import {
  grid,
  paddleHeight,
  paddleWidth,
  canvas,
  powerUp_color,
  scoreLimit
} from 'src/utils/constants';
import { FriendsService } from 'src/friends/friends.service';
import { ConnectedUserService } from 'src/chat/service/connected-user/connected-user.service';
import { ConnectedUserI } from 'src/chat/model/connected.user.interface';
import { UsersService } from 'src/users/users.service';



@Injectable()
export class GameService {

  constructor(
    private connectedUserService: ConnectedUserService,
    private readonly friendService: FriendsService,
    private userService: UsersService

    ) {}

  initGame(is_public: Boolean) {
    let state = {
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
        paddleH: 75,
        x: grid,
        y: canvas.height / 2 - paddleHeight / 2,
        vel: 0,
      }, {
        paddleH: 75,
        x: canvas.width - 2 * grid,
        y: canvas.height / 2 - paddleHeight / 2,
        vel: 0,
      }],
      powerUp: [{
        x: canvas.width / 2,
        y: canvas.height / 2,
      },
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
      }],
      powerUp_t: "transparent",
      launchPowerUp: false,
      intervalId: null,
      is_public: is_public,
      status: 0,
      userID: -1,
    };
    return state;
  }

  gameLoop(state: StateI, powerUPenable: boolean = true): number {
    if (!state) {
      return -1;
    }
    const ball = state.ball;
    const p1 = state.players[0];
    const p2 = state.players[1];

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
      // move ball next to the paddle otherwise the collision will happen again in the next frame
      ball.x = state.players[0].x + /* leftPaddle.width */ 15;
    }
    else if (this.collides(ball, state.players[1])) {
      ball.dx *= -1;
      // move ball next to the paddle otherwise the collision will happen again in the next frame
      ball.x = state.players[1].x - /* ball.width */ 15;
    }

    // check to see if paddle collides with walls. if they do stop velocity
    if ((p1.y += p1.vel) < grid) {
      p1.y = grid;
      p1.vel = 0;
    }
    else if (p1.y > canvas.height - grid - p1.paddleH) {
      p1.y = canvas.height - grid - p1.paddleH;
      p1.vel = 0;
    }

    if ((p2.y += p2.vel) < grid) {
      p2.y = grid;
      p2.vel = 0;
    }
    else if (p2.y > canvas.height - grid - p2.paddleH) {
      p2.y = canvas.height - grid - p2.paddleH;
      p2.vel = 0;
    }
    if (powerUPenable)
      this.managePowerUP(state);

    // See if ball passed the paddle
    if (ball.x < 0) {
      state.score.p2++
      this.resetState(state)
      if (state.score.p2 >= scoreLimit)
        return 2;
    }
    if (ball.x > canvas.width) {
      state.score.p1++
      this.resetState(state)
      if (state.score.p1 >= scoreLimit)
        return 1;
    }
    return 0;

  }

  managePowerUP(state: StateI) {
    const powerUP = state.powerUp;

    if (state.launchPowerUp) {
      powerUP[0].x -= 5
      powerUP[1].x += 5

      // check to see if PowerUp collides with paddle.
      if (this.collides(powerUP[0], state.players[0])) {
        powerUP[0].x = -10;
        // function pour changer le comportement de la game
        this.powerUpEffects(state, 0);
      }
      if (this.collides(powerUP[1], state.players[1])) {
        powerUP[1].x = 800;
        // function pour changer le comportement de la game
        this.powerUpEffects(state, 1)
      }
    }

    if (!state.launchPowerUp) {
      state.launchPowerUp = true
      setTimeout(() => {
        state.launchPowerUp = false
        powerUP[0].x = powerUP[1].x = canvas.width / 2
        powerUP[0].y = Math.floor(Math.random() * canvas.height - grid);
        powerUP[1].y = Math.floor(Math.random() * canvas.height - grid);
        state.powerUp_t = powerUp_color[Math.floor(Math.random() * 3)]
      }, 5000);
    }
  }

  collides(ball, paddle): Boolean {
    const ballsize = grid;
    return ball.x < paddle.x + paddleWidth &&
      ball.x + ballsize > paddle.x &&
      ball.y < paddle.y + paddleHeight &&
      ball.y + ballsize > paddle.y;
  }

  getUpdatedVelocity(keyreleased: boolean, keyCode: number, clientPaddle: PlayerI, player) {
    if (keyreleased && (keyCode === 38 || keyCode === 40))
      clientPaddle.vel = 0;
    else {
      switch (keyCode) {
        case 38: { // up
          clientPaddle.vel = -20;
          break;
        }
        case 40: { // down
          clientPaddle.vel = 20;
          break;
        }
      }
    }
  }

  powerUpEffects(state, player) {
    if (state.powerUp_t == "lightblue") {
      state.ball.dx += state.ball.dx > 0 ? 5 : -5;
      state.ball.dy += state.ball.dy > 0 ? 5 : -5;
    }
    else if (state.powerUp_t == "lightcoral") {
      state.players[player].paddleH += (state.players[player].paddleH - 20 < 20) ? 20 : -20;
    }
    else if (state.powerUp_t == "lightgreen") {
      var maxPaddleH = 275;
      state.players[player].paddleH += (state.players[player].paddleH + 20 < maxPaddleH) ? 20 : 0;
    }
  }
  // reset state if PowerUp have been taken
  resetState(state) {
    state.players[0].paddleH = 75;
    state.players[1].paddleH = 75;
    state.ball = {
      x: canvas.width / 2, // { width : 750, height : 585}
      y: canvas.height / 2,
      dx: state.ball.dx > 0 ? 5 : -5,
      dy: state.ball.dy > 0 ? 5 : -5,
    }
  }

  makeid(length): string {
    var result = '';
    var characters = '123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async changeUsersStatus(server, roomName) {
    const clients = server.sockets.adapter.rooms.get(roomName);
    //to just change the status to all members of a room and emit to all there friends
    if (clients)
      for (const clientId of clients) {
              
        // this is the socket of each client in the room.
        const clientSocket = server.sockets.sockets.get(clientId);
                          
        this.userService.updateUserStatus(clientSocket.data.user.id, 1);
                  
        const users = await this.friendService.getFriends(clientSocket.data.user);
        
        for (const user of users) {
        
          const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
          for (const connection of connections) {
            server.to(connection.socketID).emit('status', 1, clientSocket.data.user.id);
          }
        }
    }
  }

}