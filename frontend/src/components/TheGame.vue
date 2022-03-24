<template>
<!--   <div class="canvas-container">
    <canvas width="750" height="585" id="game" ></canvas> Toggle with : "const canvas = <HTMLCanvasElement>document.getElementById("game"); l.19"
    <canvas ref="game" width="750" height="585"></canvas>
  </div> -->
<!-- NEW VERSION -->
<body>
  <section class="vh-100">
    <div class="container h-100">

      <div ref="initialScreen" class="h-100">
        <div class="d-flex flex-column align-items-center justify-content-center h-100">
            <h1>Multiplayer Pong Game</h1>
            <button
              type="submit"
              class="btn btn-success"
              ref="newGameButton"
            >
              Create New Game
            </button>
            <div>OR</div>
            <div class="form-group">
              <input type="text" placeholder="Enter Game Code" ref="gameCodeInput"/>
            </div>
            <button
              type="submit"
              class="btn btn-success"
              ref="joinGameButton"
            >
              Join Game
            </button>
        </div>
      </div>

      <div ref="gameScreen" class="h-100">
        <div class="d-flex flex-column align-items-center justify-content-center h-100">

          <h1>Your game code is: <span ref="gameCodeDisplay"></span></h1>

          <!-- <canvas ref="canvas"></canvas> // toggle -->
          <canvas ref="canvas"></canvas>
        </div>
      </div>

    </div>
  </section>
</body>

</template>

<script lang="ts">
import { io } from "socket.io-client";
import WelcomeItem from "./WelcomeItem.vue";
import { useUserStore } from "../stores/userStore";


export default {
  name: "TheGame",
  data() {
    return {
      socket : null,
      canvas : null,
      ctx : null,
      grid : 15,
      paddleHeight : this.grid * 5, // 80
      playerNumber : 0,
      gameActive : false,
};
  },
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  props: {
    user: Object,
  },
  methods: {
    init() {
      this.$ref.initialScreen.style.display = "none";
      this.$ref.gameScreen.style.display = "block";

      // canvas = document.getElementById('canvas');
      this.canvas = this.$refs.game;
      this.ctx = this.canvas.getContext('2d');

      this.canvas.width =  750;
      this.canvas.height = 585;

      this.ctx.fillStyle = "#231f20";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      document.addEventListener('keydown', this.keydown);
      this.gameActive = true;
    },

    keydown(e) {
      this.socket.emit('keydown', e.keyCode);
    },

    paintGame(state) {
    
      // clear canvas
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      // draw paddles
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(this.grid, state.players[0].y, 15, this.paddleHeight);
      this.ctx.fillRect(this.canvas.width - 2 * this.grid, state.players[1].y, 15, paddleHeight);

      // draw ball
      this.ctx.fillRect(state.ball.x, state.ball.y, 15, 15);

      // draw walls
      this.ctx.fillStyle = 'lightgrey';
      this.ctx.fillRect(0, 0, this.canvas.width, this.grid);
      this.ctx.fillRect(0, this.canvas.height - this.grid, this.canvas.width, this.canvas.height);

      // draw dotted line down the middle
      for (let i = this.grid; i < this.canvas.height - this.grid; i += this.grid * 2) {
        this.ctx.fillRect(this.canvas.width / 2 - this.grid / 2, i, this.grid, this.grid);
      }

    },

    handleInit(number) {
      this.playerNumber = number;
    },

    handleGameState(gameState) {
      if (!this.gameActive) {
        return;
      }
      gameState = JSON.parse(gameState);
      console.log( "handleGameState gameState : ", gameState);
      requestAnimationFrame(() => this.paintGame(gameState));
    },

    handleGameOver(data) {
      if (!this.gameActive) {
        return;
      }
      data = JSON.parse(data);

      this.gameActive = false;

      if (data.winner === this.playerNumber) {
        alert('You Win!');
      } else {
        alert('You Lose :(');
      }
    },

    handleGameCode(gameCode) {
      this.$ref.gameCodeDisplay.innerText = gameCode;
    },

    handleUnknownCode() {
      this.reset();
      alert('Unknown Game Code')
    },

    handleTooManyPlayers() {
      this.reset();
      alert('This game is already in progress');
    },

    reset() {
      this.playerNumber = null;
      this.$ref.gameCodeInput.value = '';
      this.$ref.initialScreen.style.display = "block";
      this.$ref.gameScreen.style.display = "none";
    },

  },
  async mounted() {
    this.socket = await io("http://127.0.0.1:3000", {
      extraHeaders: {
        Authorization: this.userStore.access_token,
      },
    });

    this.socket.on('test', this.testConnexion);
    this.socket.on('init', this.handleInit);
    this.socket.on('gameState', this.handleGameState);
    this.socket.on('gameOver', this.handleGameOver);
    this.socket.on('gameCode', this.handleGameCode);
    this.socket.on('unknownCode', this.handleUnknownCode);
    this.socket.on('tooManyPlayers', this.handleTooManyPlayers);

/* 
//  ANCIENNE VERSION
    // const canvas = <HTMLCanvasElement>document.getElementById("game");
    const canvas = this.$refs.game;

    const context = canvas.getContext("2d");
    // taile de la grille qui entoure le jeu (et des lignes qui le composent)
    const grid = 15;
    const paddleHeight = grid * 5; // 80
    const maxPaddleY = canvas.height - grid - paddleHeight;

    var paddleSpeed = 6;
    var ballSpeed = 5;

    const leftPaddle = {
      // start in the middle of the game on the left side
      x: grid * 2,
      y: canvas.height / 2 - paddleHeight / 2,
      width: grid,
      height: paddleHeight,

      // paddle velocity
      dy: 0,
    };
    const rightPaddle = {
      // start in the middle of the game on the right side
      x: canvas.width - grid * 3,
      y: canvas.height / 2 - paddleHeight / 2,
      width: grid,
      height: paddleHeight,

      // paddle velocity
      dy: 0,
    };
    const ball = {
      // start in the middle of the game
      x: canvas.width / 2,
      y: canvas.height / 2,
      width: grid,
      height: grid,

      // keep track of when need to reset the ball position
      resetting: false,

      // ball velocity (start going to the top-right corner)
      dx: ballSpeed,
      dy: -ballSpeed,
    };

    // check for collision between two objects using axis-aligned bounding box (AABB)
    // @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    function collides(obj1, obj2) {
      return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
      );
    }

    // game loop
    function loop() {
      requestAnimationFrame(loop);
      context.clearRect(0, 0, canvas.width, canvas.height);

      // move paddles by their velocity
      leftPaddle.y += leftPaddle.dy;
      rightPaddle.y += rightPaddle.dy;

      // prevent paddles from going through walls
      if (leftPaddle.y < grid) {
        leftPaddle.y = grid;
      } else if (leftPaddle.y > maxPaddleY) {
        leftPaddle.y = maxPaddleY;
      }

      if (rightPaddle.y < grid) {
        rightPaddle.y = grid;
      } else if (rightPaddle.y > maxPaddleY) {
        rightPaddle.y = maxPaddleY;
      }

      // draw paddles
      context.fillStyle = "white";
      context.fillRect(
        leftPaddle.x,
        leftPaddle.y,
        leftPaddle.width,
        leftPaddle.height
      );
      context.fillRect(
        rightPaddle.x,
        rightPaddle.y,
        rightPaddle.width,
        rightPaddle.height
      );

      // move ball by its velocity
      ball.x += ball.dx;
      ball.y += ball.dy;

      // prevent ball from going through walls by changing its velocity
      if (ball.y < grid) {
        ball.y = grid;
        ball.dy *= -1;
      } else if (ball.y + grid > canvas.height - grid) {
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
      if (collides(ball, leftPaddle)) {
        ball.dx *= -1;

        // move ball next to the paddle otherwise the collision will happen again
        // in the next frame
        ball.x = leftPaddle.x + leftPaddle.width;
      } else if (collides(ball, rightPaddle)) {
        ball.dx *= -1;

        // move ball next to the paddle otherwise the collision will happen again
        // in the next frame
        ball.x = rightPaddle.x - ball.width;
      }

      // draw ball
      context.fillRect(ball.x, ball.y, ball.width, ball.height);

      // draw walls
      context.fillStyle = "lightgrey";
      context.fillRect(0, 0, canvas.width, grid);
      context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

      // draw dotted line down the middle
      for (let i = grid; i < canvas.height - grid; i += grid * 2) {
        context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
      }
    }

    // listen to keyboard events to move the paddles
    document.addEventListener("keydown", function (e) {
      // up arrow key
      if (e.which === 38) {
        rightPaddle.dy = -paddleSpeed;
      }
      // down arrow key
      else if (e.which === 40) {
        rightPaddle.dy = paddleSpeed;
      }

      // z key
      if (e.which === 90) {
        leftPaddle.dy = -paddleSpeed;
      }
      // s key
      else if (e.which === 83) {
        leftPaddle.dy = paddleSpeed;
      }
    });

    // listen to keyboard events to stop the paddle if key is released
    document.addEventListener("keyup", function (e) {
      if (e.which === 38 || e.which === 40) {
        rightPaddle.dy = 0;
      }

      if (e.which === 83 || e.which === 90) {
        leftPaddle.dy = 0;
      }
    });

    // start the game
    requestAnimationFrame(loop);
 */
  },
};
</script>

<style scoped>
/* ANCIENNE VERSION */
/* main {
  max-width: 500px;
  padding-top: 100px;
  margin: auto;
}

canvas {
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-container {
  display: flex;
  align-items: center;
  justify-content: center;
} */

#gameScreen {
  display: none;
}
</style>
