<script lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "../stores/userStore";

export default {
  name: "TheGame",
  setup() {
    const userStore = useUserStore();
    const initialScreen = ref(null);
    const gameCodeInput = ref(null);
    const gameCodeSpec = ref(null);

    const gameScreen = ref(null);
    const msgBox = ref(null);
    const canvas = ref(null);
    onMounted(() => {
      // the DOM element will be assigned to the ref after initial render
    });

    return {
      initialScreen,
      gameCodeInput,
      gameCodeSpec,
      gameScreen,
      msgBox,
      canvas,
      userStore,
    };
  },
  props: {
    user: Object,
    socket: Object,
  },
  data() {
    return {
      title: "Game Room",

      score: {},
      gameStatus: String("paused"),
      // socket: ref(),
      ctx: null,
      msg: String(""),
      gameActive: Boolean(false),
    };
  },
  created() {
    this.socketSetter();
  },
  mounted() {
    console.log(`mounted`);
    this.reset();
  },
  unmounted() {
    this.socket.removeAllListeners();
    console.log("unmounted");
  },

  methods: {
    socketSetter() {
      //--> ALTERNATIVE this.userStore.socket.on("connect", () => {console.log(` userStoreSocket working`);})
      this.socket.on("connect", () => {
        this.gameStatus = "idle";
      });
      this.socket.on("init", this.handleInit);
      this.socket.on("gameState", this.handleGameState);
      this.socket.on("gameOver", this.handleGameOver);
      this.socket.on("unknownCode", this.handleUnknownCode);
      this.socket.on("tooManyPlayers", this.handleTooManyPlayers);
      this.socket.on("paused", this.handlePause);
      this.socket.on("notify", this.handleNotification);
      this.socket.on("broadcastMsg", this.receiveMsg);
      this.socket.on("disconnection", this.handleDisconnection);
      this.socket.on("startGameAnimation", this.startGameAnimation);
      this.socket.on("invit", this.invitationRecu);
      this.socket.on("acceptInvit", this.acceptInvit);
      this.socket.on("pushLiveGame", this.pushLiveGame);
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

    joinQueue(playWithPowerUP: boolean) {
      this.socket.emit("joinQueue", playWithPowerUP);
      this.gameState = "play";
    },

    createNewGame() {
      this.socket.emit("newGame");
    },

    invitationRecu(adversaire, code) {
      console.log(`Ds invitation Reçu room : ${code}`);
      if (
        confirm(
          adversaire.username + ", vous défie au pong : lancer la partie ?"
        )
      ) {
        this.socket.emit("newGame", code);
        this.socket.emit("acceptInvit", adversaire, code);
        this.$router.push("Chat");
      } else this.socket.emit("declineGameInvit", adversaire);
    },

    acceptInvit(roomCode) {
      console.log(">>>>>> acceptInvitGame (game) roomCode : ", roomCode);
      // await this.startGameAnimation()
      this.socket.emit("joinGame", roomCode);
    },

    handleJoinGame() {
      const code = this.gameCodeInput.value;
      this.socket.emit("joinGame", code);
    },

    handleSpecGame() {
      const code = this.gameCodeSpec.value;
      this.socket.emit("spec", code);
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
      if (!this.socket.connected) return;
      this.socket.emit("keydown", e.keyCode);
      // if (e.key == "d") this.socket.disconnect();
      // if (e.key == "f") this.socket.connect();
    },

    keyup(e) {
      if (!this.socket.connected) return;
      this.socket.emit("keyup", e.keyCode);
    },

    async startGameAnimation() {
      for (let cntDown = 5; cntDown > 0; --cntDown)
        for (let index = 0; index < 100; ++index) {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.ctx.font = index.toString() + "px Calibri,Geneva,Arial";
          this.ctx.strokeStyle = "rgb(0,0,0)";
          this.ctx.strokeText(
            String(cntDown),
            this.canvas.width / 3 - index / 3,
            this.canvas.height / 3 + index / 3
          );
          await this.sleep(10);
        }
    },

    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    paintGame(state) {
      const grid = 15;
      // clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // draw paddles
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(grid, state.players[0].y, 15, state.players[0].paddleH);
      this.ctx.fillRect(
        this.canvas.width - 2 * grid,
        state.players[1].y,
        15,
        state.players[1].paddleH
      );

      // draw walls
      this.ctx.fillStyle = "lightgrey";
      this.ctx.fillRect(0, 0, this.canvas.width, grid);
      this.ctx.fillRect(
        0,
        this.canvas.height - grid,
        this.canvas.width,
        this.canvas.height
      );

      // draw dotted line down the middle
      for (let i = grid; i < this.canvas.height - grid; i += grid * 2) {
        this.ctx.fillRect(this.canvas.width / 2 - grid / 2, i, grid, grid);
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
      this.ctx.strokeText(
        String(this.score.p1),
        this.canvas.width / 2 - 40,
        40
      );
      this.ctx.strokeText(
        String(this.score.p2),
        this.canvas.width / 2 + 25,
        40
      );
    },

    sendMsg() {
      this.socket.emit("msg", this.msg);
      this.msg = "";
    },

    receiveMsg(msg) {
      // Sig : "broadcastMsg"
      this.msgBox.innerText += "\n" + msg;
      this.msgBox.scrollTop = this.msgBox.scrollHeight;
    },

    handleInit(number) {
      console.log(`handleInit`);

      this.playerNumber = number;
      this.init();
    },

    handleGameState(gameState) {
      if (!this.gameActive) {
        return;
      }
      gameState = JSON.parse(gameState);
      this.score = gameState.score;
      console.log("this.gameStatus : ", this.gameStatus);
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
          position: "center",
          title: "Congratulations !!",
          text: "You Won :)",
          duration: 6000,
        });
      } else {
        this.$notify({
          position: "center",
          title: "Try Again !!",
          text: "You Loose :(",
          duration: 6000,
        });
      }
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
      this.gameStatus = "opponentLeft";
      this.$notify({
        title: "Important message",
        text: "Your opponent disconnected\nYou can wait till he come back or claim victory",
        duration: 6000,
      });
      // alert("Your Opponent disconnected, you can wait till he come back or claim victory");
    },

    handlePause(msg) {
      console.log(
        `%c your opponent paused ${msg}`,
        "background: #222; color: #bada55"
      );
      this.socket.emit("pause");
    },

    handleNotification(msg) {
      this.$notify(msg);
    },

    reset() {
      this.gameStatus = "idle";
      this.playerNumber = null;
      if (this.gameCodeInput) this.gameCodeInput.value = "";
      if (this.gameCodeSpec) this.gameCodeSpec.value = "";
      this.initialScreen.style.display = "block";
      this.gameScreen.style.display = "none";
      this.msgBox.innerText = "";
    },
    liveGame() {
      this.socket.emit("getLiveGame", (response) => {
        console.log(response);
      });
    },
    pushLiveGame(liveGame) {
      console.log("ds pushLiveGame");
      console.log(liveGame);
    },
  },
};
</script>

<template>
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
          <div>
            <button type="submit" class="pwd-btn" @click="joinQueue(false)">
              Play Basic Pong
            </button>
            <button type="submit" class="pwd-btn" @click="joinQueue(true)">
              Play PowerUP Pong!!!
            </button>
          </div>
        </div>
      </div>

      <div ref="gameScreen" id="gameScreen" class="h-100">
        <div
          class="
            d-flex
            flex-column
            align-items-center
            justify-content-center
            h-100
          "
        >
          <h1>
            myRoom is :
            {{ this.socket != null ? this.socket.id : "Undefined yet" }}
          </h1>
          <canvas ref="canvas"></canvas>
          <button
            type="submit"
            class="btn btn-success"
            ref="pauseButton"
            v-on:click="handlePause()"
          >
            pause
          </button>
          <button
            type="submit"
            class="btn btn-success"
            ref="notifyButton"
            v-if="this.gameStatus === 'opponentLeft'"
            v-on:click="claimVictory"
          >
            claimVictory
          </button>
          <button
            type="submit"
            class="btn btn-success"
            ref="notifyButton"
            v-if="!this.gameActive"
            v-on:click="reset"
          >
            ← Go back ←
          </button>
        </div>
        <div class="chat">
          <h1>Instant Chat</h1>
          <div ref="msgBox" class="message-box"></div>
          <div>
            <textarea
              id="textarea"
              v-model="msg"
              placeholder="Enter message..."
            >
            </textarea>
          </div>
          <div>
            <button type="submit" ref="sendButton" v-on:click="sendMsg">
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
  overflow: hidden;
  border: 3px solid #703ab8;
  border-radius: 13px;
  width: 100%;
  height: 300%;
  padding: 10px;
  margin: 10px;
}

.pwd-btn {
  background-color: white;
  border: none;
  color: #703ab8;
  font-weight: bold;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 3px;
  padding: 6px 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-top: 10px;
  margin: 10px;
  border: 2px solid #703ab8;
}
</style>
