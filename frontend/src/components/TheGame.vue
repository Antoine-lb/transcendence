<script lang="ts">
import { ref, onMounted } from 'vue'
import { io } from "socket.io-client";
import { useUserStore } from "../stores/userStore";

export default {
  name: "TheGame",
   setup() {
      const userStore = useUserStore();
      const gameCodeDisplay = ref(null)
      const initialScreen = ref(null)
      const gameCodeInput = ref(null)
      const gameCodeSpec = ref(null)

      const gameScreen = ref(null)
      const msgBox = ref(null)
      const canvas = ref(null)
      onMounted(() => {
        // the DOM element will be assigned to the ref after initial render
        console.log(gameCodeDisplay.value) // <div>This is a gameCodeDisplay element</div>
      })

      return {
        gameCodeDisplay,
        initialScreen,
        gameCodeInput,
        gameCodeSpec,
        gameScreen,
        msgBox,
        canvas,
        userStore,
      }
    },
  props: {
    user: Object,
  },
  data() {
    return {
      title: "Game Room",
      
      score : {},
      gameStatus : String("paused"),
      socket: ref(),
      ctx: null,
      msg: String(''),
      gameActive : Boolean(false),
      // myRooms: null,
      // friendList: [],
      // newRoomName: null,
      // newRoomUsers: null,
      // selectedRoom: {},
      // room: {},
    };
  },
  created () {
    // this.socketSetter();
  },

  methods: {
    socketSetter() {
      this.socket = io("http://127.0.0.1:3000", {
        extraHeaders: {
          Authorization: this.user.access_token,
        },
      });
      //--> ALTERNATIVE this.userStore.socket.on("connect", () => {console.log(` userStoreSocket working`);})
      this.socket.on("connect", () => {this.gameStatus = "idle"})
      this.socket.on("init", this.handleInit);
      this.socket.on("testGame", this.testGame);
      this.socket.on("gameState", this.handleGameState);
      this.socket.on("gameOver", this.handleGameOver);
      this.socket.on("gameCode", this.handleGameCode);
      this.socket.on("unknownCode", this.handleUnknownCode);
      this.socket.on("tooManyPlayers", this.handleTooManyPlayers);
      this.socket.on("paused", this.handlePause);
      this.socket.on("notify", this.handleNotification);
      this.socket.on("broadcastMsg", this.receiveMsg);
      this.socket.on("disconnection", this.handleDisconnection);
      this.socket.on("startGameAnimation", this.startGameAnimation);
      this.socket.on("disconnect", (reason) => {
        if (reason === "io server disconnect") {
          // console.log("the disconnection was initiated by the server, you need to reconnect manually")
          // this.socket.connect();
        }
      // else the socket will automatically try to reconnect
      });

      this.socket.on("samePlayer", (arg1, callback) => {
        console.log(arg1);
        callback({
          status: alert("test"),
          // status1: "ok"
        });
      });
    },

    joinQueue() {
      this.socket.emit("joinQueue");
    },

    createNewGame() {
      this.socket.emit("newGame");
    },

    handleJoinGame() {
      const code = this.gameCodeInput.value;
      this.socket.emit('joinGame', code);
    },

    testGame() {
      console.log(`Front TestGame`);
    },

    handleSpecGame() {
      const code = this.gameCodeSpec.value;
      this.socket.emit('spec', code);
      this.init();
    },

    init() {
      this.initialScreen.style.display = "none";
      this.gameScreen.style.display = "block";
      this.ctx = this.canvas.getContext("2d");
      this.canvas.width = 750;
      this.canvas.height = 590;
      this.ctx.fillStyle = "#231f20";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      document.addEventListener("keydown", this.keydown);
      document.addEventListener("keyup", this.keyup);
      this.gameActive = true;
    },

    keydown(e) {
      if (!this.socket.connected)
        return;
      this.socket.emit("keydown", e.keyCode);
      if (e.key == 'd')
        this.socket.disconnect();
      if (e.key == 'f')
        this.socket.connect();
    },

    keyup(e) {
      if (!this.socket.connected)
        return;
      this.socket.emit("keyup", e.keyCode);
    },

    async startGameAnimation()
    {
      for (let cntDown = 5; cntDown > 0; --cntDown)
        for (let index = 0; index < 100; ++index) {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.ctx.font = (index).toString() + "px Calibri,Geneva,Arial";
          this.ctx.strokeStyle = "rgb(0,0,0)";
          this.ctx.strokeText(String(cntDown), this.canvas.width / 3 - index / 3, this.canvas.height / 3 + index / 3);
          await this.sleep(10);
        }
      this.socket.emit('launchGame');
    },

    sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    },

    paintGame(state) {
      const grid = 15;
      // clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // draw paddles
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(grid, state.players[0].y, 15, state.players[0].paddleH);
      this.ctx.fillRect(this.canvas.width - 2 * grid,state.players[1].y, 15, state.players[1].paddleH);

      // draw walls
      this.ctx.fillStyle = "lightgrey";
      this.ctx.fillRect(0, 0, this.canvas.width, grid);
      this.ctx.fillRect( 0, this.canvas.height - grid, this.canvas.width, this.canvas.height);

      // draw dotted line down the middle
      for (
        let i = grid;
        i < this.canvas.height - grid;
        i += grid * 2
      ) {
        this.ctx.fillRect(
          this.canvas.width / 2 - grid / 2,
          i,
          grid,
          grid
        );
      }
      // draw ball
      this.ctx.fillRect(state.ball.x, state.ball.y, 15, 15);

      // draw PowerUps (if any)
      if (state.powerUp[0].x > 0) {
        // console.log("state.powerUp_t", state.powerUp_t)
        this.ctx.fillStyle = state.powerUp_t;
        this.ctx.fillRect(state.powerUp[0].x, state.powerUp[0].y, 15, 15);
        this.ctx.fillRect(state.powerUp[1].x, state.powerUp[1].y, 15, 15);
      }

      // draw scrore
      this.ctx.font = "20pt Calibri,Geneva,Arial";
      this.ctx.strokeStyle = "rgb(0,0,0)";
      this.ctx.strokeText(String(this.score.p1), this.canvas.width / 2 - 40, 40);
      this.ctx.strokeText(String(this.score.p2), this.canvas.width / 2 + 25, 40);
    },

    sendMsg() {      
      this.socket.emit('msg', this.msg);
      this.msg = "";
    },

    receiveMsg(msg) { // Sig : "broadcastMsg"
      this.msgBox.innerText += '\n' + msg;
      this.msgBox.scrollTop = this.msgBox.scrollHeight;
    },

    handleInit(number) {
      this.playerNumber = number;
      this.init();
    },

    handleGameState(gameState) {
      if (!this.gameActive) {
        return;
      }
      gameState = JSON.parse(gameState);
      this.score = gameState.score;
      // console.log("this.gameStatus : ", this.gameStatus);
      if (this.gameStatus !== "opponentLeft" && this.gameStatus !== "paused")
        requestAnimationFrame(() => this.paintGame(gameState));
    },

    handleGameOver(data) {
      if (!this.gameActive) {
        return;
      }
      document.removeEventListener("keydown", this.keydown);
      document.removeEventListener("keyup", this.keydown);

      data = JSON.parse(data);
      this.gameActive = false;
      if (data.winner === this.playerNumber) {
        this.$notify({
          position : "center",
          title: "Congratulations !!",
          text: "You Won :)",
          duration : 6000
      });
      } else {
        this.$notify({
          position : "center",
          title: "Try Again !!",
          text: "You Loose :(",
          duration : 6000
      });
      }
    },

    handleGameCode(gameCode) {
      this.gameCodeDisplay.innerText = gameCode;
    },

    handleUnknownCode() {
      this.reset();
      alert("Unknown Game Code");
    },

    handleTooManyPlayers() {
      this.reset();
      alert("This game is already in progress");
    },

    handleDisconnection() {
      this.gameStatus = "opponentLeft"
      this.$notify({
        title: "Important message",
        text: "Your opponent disconnected\nYou can wait till he come back or claim victory",
        duration : 6000
      });
      // alert("Your Opponent disconnected, you can wait till he come back or claim victory");
    },

    handlePause(msg) {
      console.log(`%c your opponent paused ${msg}`, 'background: #222; color: #bada55')
      this.socket.emit('pause');
    },

    handleNotification(msg) {
      this.$notify(msg);
    },

    reset() {
      this.playerNumber = null;
      this.gameCodeInput.value = "";
      this.gameCodeSpec.value = "";
      this.initialScreen.style.display = "block";
      this.gameScreen.style.display = "none";
    },
  },
};
</script>

<template>
  <section class="vh-100">
    <div class="container h-100">

      <div ref="initialScreen" class="h-100">
        <div class="d-flex flex-column align-items-center justify-content-center h-100">
            <h1>Multiplayer Pong Game</h1>
            <h1>myRoom is : {{this.socket != null ? this.socket.id : "Undefined yet"}}</h1>
          <div>
            <button
              type="submit"
              class="btn btn-success"
              @click="joinQueue"
            >
              Play 
            </button>
          </div>
            <div>OR</div>
          <div>
            <button
              type="submit"
              class="btn btn-success"
              @click="createNewGame"
            >
              Create Game code 
            </button>
          </div>

            <div class="form-group">
              <input type="text" placeholder="Enter Game Code" ref="gameCodeInput"/>
            </div>
            <button
              type="submit"
              class="btn btn-success"
              v-on:click="handleJoinGame"
            >
              Join Game
            </button>


            <div class="form-groupp">
              <input type="text" placeholder="Enter Game Codee" ref="gameCodeSpec"/>
            </div>
            <button
              type="submit"
              class="btn btn-success"
              v-on:click="handleSpecGame"
            >
              Spec Game
            </button>
        </div>
      </div>

      <div ref="gameScreen" id="gameScreen" class="h-100">
        <div class="d-flex flex-column align-items-center justify-content-center h-100">
          <h1>myRoom is : {{this.socket != null ? this.socket.id : "Undefined yet"}}</h1>
          <h1>Your game code is: <span ref="gameCodeDisplay"></span></h1>
          <canvas ref="canvas"></canvas>
          <button
            type="submit"
            class="btn btn-success"
            ref="pauseButton"
            v-on:click="handlePause()"
          >
          pause
          </button>
          <button type="submit"
            class="btn btn-success"
            ref="notifyButton"
            v-if="this.gameStatus === 'opponentLeft'"
            v-on:click="claimVictory"
          >
          claimVictory
          </button>
        </div>
          <div class=chat>
            <div 
              ref="msgBox"
              class="message-box">
            </div>

            <div>
              <textarea
                id="textarea"
                v-model="msg"
                placeholder="Enter message...">
              </textarea>
            </div>

            <div>
              <button type="submit"
              ref="sendButton"

              v-on:click="sendMsg">
              Send
              </button>
            </div>
          </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
#gameScreen {
  display: none;
}

.chat {
  height: 40px;
  color: blueviolet;
  border: 1px;
  border-radius: 25px;
}

textarea {
  border: 3px solid #703ab8;
  border-radius: 13px;
  width: 100%;
  padding: 10px;
  margin: 10px;
}
.message-box {
  overflow: scroll;
  border: 3px solid #703ab8;
  border-radius: 13px;
  width: 100%;
  height: 300%;
  padding: 10px;
  margin: 10px;

}
</style>
