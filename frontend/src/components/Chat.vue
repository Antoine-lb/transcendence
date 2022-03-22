<script lang="ts">
import { io } from "socket.io-client";
import { useUserStore } from "../stores/userStore";
import ChatNewRoom from "./ChatNewRoom.vue";

interface roomInterface {
  name: string;
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
      myRooms: null,
      newRoomName: null,
      newRoomUsers: null,
      friendList: [],
      showRooms: false,
      selectedRoom: {},
      room: {},
    };
  },
  props: {
    user: Object,
  },
  components: {
    ChatNewRoom,
  },
  methods: {
    sendMessage() {
      console.log(this.room);
      if (this.validateInput()) {
        const message = {
          user: this.userStore.user,
          text: this.text,
          room: this.room,
        };
        this.socket.emit("addMessage", message);
        this.text = "";
      }
    },
    receivedMessage(message) {
      console.log("received old message");
      console.log(message);
      this.messages.push(message);
    },
    receivedOldMessages(message) {
      console.log("received old message");
      console.log(message);
      // this.messages.push(message);
    },
    validateInput() {
      return this.text.length > 0;
    },
    joinedRoom(room) {
      this.room = room;
      this.socket.emit("joinRoom", room);
    },
    leaveRoom(room) {
      this.socket.emit("leaveRoom", room);
      this.showRooms = false;
      // this.selectedItems = {};
    },
    createRoom(room: roomInterface) {
      console.log("createRoom", room);
      this.socket.emit("createRoom", room);
    },
    updateSelected(selectedItem) {
      this.selectedRoom = selectedItem.name;
      this.showRooms = true;
      this.joinedRoom(selectedItem);
    },
  },
  async created() {
    this.socket = io("http://127.0.0.1:3000", {
      extraHeaders: {
        Authorization: this.user.access_token,
      },
    });

    this.socket.on("rooms", (rooms) => {
      this.myRooms = rooms.items;
    });

    this.socket.on("messageAdded", (message) => {
      this.receivedMessage(message);
    });
    this.socket.on("messages", (message) => {
      this.receivedOldMessages(message);
    });
  },
};
</script>
<template>
  <div class="container">
    <ChatNewRoom @onSubmit="createRoom" />

    <h1>Salons Disponibles</h1>
    <div class="list-group">
      <ul>
        <div
          class="list-group-item list-group-item-action"
          @click="updateSelected(room)"
          v-for="(room, index) in this.myRooms"
          :key="index"
        >
          {{ room?.name }}
        </div>
      </ul>
    </div>

    <div>
      <button class="btn btn-primary" @click="leaveRoom(selectedRoom)">
        Go back
      </button>
      <p>
        You have choosen
        <span class="highlight">{{ this.selectedRoom }}</span>
      </p>
    </div>
    <!-- CHAT ROOM -->
    <div class="row">
      <div class="col-md-6 offset-md-3 col-sm-12">
        <h1 class="text-center">
          {{ title }}
          <span v-if="showRooms == true"> : {{ this.selectedRoom }} </span>
        </h1>
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
          <button id="send" class="btn" @click.prevent="sendMessage(room)">
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
main {
  max-width: 500px;
  padding-top: 50px; /* Original 100px */
  margin: auto;
}

input {
  color: #703ab8;
  border: 3px solid #703ab8;
  padding: 10px;
  border-radius: 13px;
  font-weight: bold;
  font-size: 18px;
}

input[type="submit"] {
  background-color: #703ab8;
  border: none;
  color: white;
  font-weight: bold;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 13px;
  padding: 6px 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-top: 10px;
  display: block;
}
input[type="submit"]:hover {
  background-color: white;
  color: #703ab8;
}

/* POUR LES SALONS */
.list-group-item {
  /* display: block; */ /* remove dot */
  text-decoration: none;
  /* margin: 1em 0.2em; */
  color: #4a4a4a;
}

.list-group-item:hover {
  color: red;
}

.highlight {
  color: blue;
}
</style>
