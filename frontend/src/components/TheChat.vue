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
      myRooms: null,
      newRoomName: null,
      newRoomUsers: null,
      friendList: [],
      showRooms: false,
      selectedRoom: {},
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
      let room = {
        name: this.newRoomName,
        users: [],
      };
      this.newRoomUsers = this.newRoomUsers.split(/[ ,]+/);
      console.log(this.newRoomUsers);
      this.newRoomUsers.forEach((userAsked) => {
        let exist = false;
        this.friendList.forEach((validUser) => {
          if (userAsked === validUser.username) {
            console.log(validUser.username + " added");
            room.users.push({ id: validUser.id });
            exist = true;
          }
        });
        if (!exist) alert(userAsked + " don't exist");
      });
      // console.log("createRooms with params: ", room);
      this.socket.emit("createRoom", room);
    },
    getMyRooms(rooms) {
      // console.log(rooms);
      return this.socket.on("rooms");
    },
    updateSelected(selectedItem) {
      console.log(selectedItem.name);
      this.selectedRoom = selectedItem.name;
      this.showRooms = true;
    },
  },
  async created() {
    this.socket = io("http://127.0.0.1:3000", {
      extraHeaders: {
        Authorization: this.user.access_token,
      },
    });
    // console.log("frontend socket -><>" + this.socket);

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
    // console.log(this.friendList);

    // function whenMessageReceived(message) {
    //   this.receivedMessage(message);
    // }
    // this.socket.on("msgToClient", whenMessageReceived);

    this.socket.on("rooms", (rooms) => {
      console.log("rooms created :", rooms);
      this.myRooms = rooms.items;
    });
  },
};
</script>
<template>
  <div class="container">
    <h1>Créer un salon</h1>
    <form @submit.prevent="createRooms">
      <input type="text" v-model="newRoomName" placeholder="Room Name" />
      <input type="text" v-model="newRoomUsers" placeholder="Room Users" />
      <input class="button" type="submit" value="Ajouter" />
    </form>

    <h1>Salons Disponibles</h1>
    <div class="list-group" v-if="showRooms == false">
      <ul>
        <li
          class="list-group-item list-group-item-action"
          @click="updateSelected(room)"
          v-for="(room, index) in this.myRooms"
          :key="index"
        >
          {{ room?.name }}
        </li>
      </ul>
    </div>

    <div v-else>
      <button class="btn btn-primary" @click="showRooms = false">
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
