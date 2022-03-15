<script lang="ts">
import { io } from "socket.io-client";
import { useUserStore } from "../stores/userStore";

function fetchWithHeaders(url) {
  return fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cache: "no-cache",
    },
    credentials: "include",
  });
}

export default {
  name: "Chat",
  data() {
    return {
      title: "Chat Room",
      name: "",
      text: "",
      messages: [],
      socket: null,
      userStore: useUserStore(),
      newRoomName: null,
      newRoomUsers: [],
      // friendList: [],
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

      if (message) {
        this.messages.push(message);
      }
    },
    validateInput() {
      return this.text.length > 0;
    },
    createRooms() {
      let exist = false;
      let room = {
        name: "ROOM1",
        users: [],
      };
      this.friendList.forEach((element) => {
        if (this.newRoomUsers === element.username) {
          console.log(element.username + " added");
          room.users.push(element.id);
          exist = true;
        }
      });
      if (!exist) {
        alert("don't exist");
        return;
      }
      console.log("createRooms with params: ", room);
      this.socket.emit("createRoom", room);
    },
    getMyRooms(rooms) {
      console.log(rooms);
      return this.socket.on("rooms");
    },
  },
  async created() {
    this.socket = io("http://127.0.0.1:3000", {
      extraHeaders: {
        Authorization: this.user.access_token,
      },
    });
    console.log("frontend socket -><>" + this.socket);

    this.loading = true;
    try {
      const response = await fetchWithHeaders(
        "http://127.0.0.1:3000/api/users"
      );
      if (response.status == 200) {
        this.friendList = await response.json();
      }
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
    console.log(this.friendList);

    // function whenMessageReceived(message) {
    //   this.receivedMessage(message);
    // }
    // this.socket.on("msgToClient", whenMessageReceived);

    // this.socket.on("rooms", (rooms) => this.getMyRooms(rooms));
  },
};
</script>
<template>
  <div class="container">
    <h1>Ajouter un ami</h1>
    <form @submit.prevent="createRooms">
      <input type="text" v-model="newRoomName" placeholder="Room Name" />
      <input type="text" v-model="newRoomUsers" placeholder="Room Users" />
      <input class="button" type="submit" value="Ajouter" />
    </form>
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
