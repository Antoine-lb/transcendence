<script lang="ts">
import { io } from "socket.io-client";
import { useUserStore } from "../stores/userStore";

export default {
  name: "TheGame",
  data() {
    return {
      socket: null,
      canvas: null,
      ctx: null,
      grid: 15,
      paddleHeight: this.grid * 5, // 80
      playerNumber: 0,
      gameActive: false,
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
      this.ctx = this.canvas.getContext("2d");

      this.canvas.width = 750;
      this.canvas.height = 585;

      this.ctx.fillStyle = "#231f20";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      document.addEventListener("keydown", this.keydown);
      this.gameActive = true;
    },

    keydown(e) {
      this.socket.emit("keydown", e.keyCode);
    },

    paintGame(state) {
      // clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // draw paddles
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(this.grid, state.players[0].y, 15, this.paddleHeight);
      this.ctx.fillRect(
        this.canvas.width - 2 * this.grid,
        state.players[1].y,
        15,
        this.paddleHeight
      );

      // draw ball
      this.ctx.fillRect(state.ball.x, state.ball.y, 15, 15);

      // draw walls
      this.ctx.fillStyle = "lightgrey";
      this.ctx.fillRect(0, 0, this.canvas.width, this.grid);
      this.ctx.fillRect(
        0,
        this.canvas.height - this.grid,
        this.canvas.width,
        this.canvas.height
      );

      // draw dotted line down the middle
      for (
        let i = this.grid;
        i < this.canvas.height - this.grid;
        i += this.grid * 2
      ) {
        this.ctx.fillRect(
          this.canvas.width / 2 - this.grid / 2,
          i,
          this.grid,
          this.grid
        );
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
      console.log("handleGameState gameState : ", gameState);
      requestAnimationFrame(() => this.paintGame(gameState));
    },

    handleGameOver(data) {
      if (!this.gameActive) {
        return;
      }
      data = JSON.parse(data);

      this.gameActive = false;

      if (data.winner === this.playerNumber) {
        alert("You Win!");
      } else {
        alert("You Lose :(");
      }
    },

    handleGameCode(gameCode) {
      this.$ref.gameCodeDisplay.innerText = gameCode;
    },

    handleUnknownCode() {
      this.reset();
      alert("Unknown Game Code");
    },

    handleTooManyPlayers() {
      this.reset();
      alert("This game is already in progress");
    },

    reset() {
      this.playerNumber = null;
      this.$ref.gameCodeInput.value = "";
      this.$ref.initialScreen.style.display = "block";
      this.$ref.gameScreen.style.display = "none";
    },

    testConnexion(data) {
      console.log("test connection", data);
    },

    handleJoinGame() {
      const code = this.gameCodeInput.value;
      this.socket.emit('joinGame', code);
      this.init();
    },
    createNewGame() {
      console.log("new game");
      console.log("this.socket", this.socket.emit("createGame"));
      this.socket.emit("createGame");
    },
  },
  async created() {
    console.log("this.user.access_token", this.user.access_token);
    this.socket = await io("http://127.0.0.1:3000", {
      extraHeaders: {
        Authorization: this.user.access_token,
      },
    });
    console.log("this.socket game", this.socket.connected );

    this.socket.on("test", this.testConnexion);
    this.socket.on("init", this.handleInit);
    this.socket.on("gameState", this.handleGameState);
    this.socket.on("gameOver", this.handleGameOver);
    this.socket.on("gameCode", this.handleGameCode);
    this.socket.on("unknownCode", this.handleUnknownCode);
    this.socket.on("tooManyPlayers", this.handleTooManyPlayers);
  },
};
</script>

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
          <div
            class="
              d-flex
              flex-column
              align-items-center
              justify-content-center
              h-100
            "
          >
            <h1>Multiplayer Pong Game</h1>
            <button
              class="btn btn-success"
              ref="newGameButton"
              @click="createNewGame"
            >
              Create New Game
            </button>
            <div>OR</div>
            <div class="form-group">
              <input
                type="text"
                placeholder="Enter Game Code"
                ref="gameCodeInput"
              />
            </div>
            <button
              type="submit"
              class="btn btn-success"
              ref="joinGameButton"
              @click="handleJoinGame"
            >
              Join Game
            </button>
          </div>
        </div>

        <div ref="gameScreen" class="h-100">
          <div
            class="
              d-flex
              flex-column
              align-items-center
              justify-content-center
              h-100
            "
          >
            <h1>Your game code is: <span ref="gameCodeDisplay"></span></h1>

            <!-- <canvas ref="canvas"></canvas> // toggle -->
            <canvas ref="canvas"></canvas>
          </div>
        </div>
      </div>
    </section>
  </body>
</template>



<style scoped>
#gameScreen {
  display: none;
}
</style>
