<script lang="ts">
import { io } from "socket.io-client";
import { useUserStore } from "../stores/userStore";

export default {

  name: "Chat",
  data() {
    return {
      title: "Chat Room",
      name: "",
      text: "",
      messages: [],
      socket: null,
      userStore: useUserStore()
    };
  },
  // setup() {
  //   const userStore = useUserStore();
  //   userStore.requestLogState();
  //   return { userStore };
  // },

  props: {
    user: Object,
  },
  methods: {
    sendMessage() {
      if (this.validateInput()) {
        const message = {
          name: this.userStore.user.username,
          text: this.text,
        };
        this.socket.emit("msgToServer", message);
        this.text = "";
      }
    },
    receivedMessage(message) {
      console.log(this.userStore.user.username);

      if (!Array.isArray(message)) {
        this.messages.push(message);
      }
    },
    validateInput() {
      return this.text.length > 0;
    },
  },
  created() {
    const options = {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: this.user.access_token,
          },
        },
      },
    };

    this.socket = io("http://127.0.0.1:3000", options);

    console.log(this.socket);

    // function whenMessageReceived(message) {
    //   this.receivedMessage(message);
    // }
    // this.socket.on("msgToClient", whenMessageReceived);

    this.socket.on("msgToClient", (message) => this.receivedMessage(message));
  },
};
</script>
<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6 offset-md-3 col-sm-12">
        <h1 class="text-center">{{ title }}</h1>
        <br />
        <div id="status"></div>
        <div id="chat">
          <br />
          <div class="card">
            <div id="messages" class="card-block">
              <ul>
                <li v-for="message of messages">
                  {{ message?.name }}: {{ message?.text }}
                </li>
              </ul>
            </div>
          </div>
          <br />
          <textarea
            id="textarea"
            class="form-control"
            v-model="text"
            placeholder="Enter message..."
          ></textarea>
          <br />
          <button id="send" class="btn" @click.prevent="sendMessage">
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
main {
  max-width: 500px;
  padding-top: 50px; /* Original 100px */
  margin: auto;
}
</style>
