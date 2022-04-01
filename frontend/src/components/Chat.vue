<script lang="ts">
import { io } from "socket.io-client";
import { useUserStore } from "../stores/userStore";
import ChatNewRoom from "./ChatNewRoom.vue";

export interface newRoomInterface {
  name: string;
  users: [{ id: number }];
}

export interface roomInterface {
  created_date: string;
  id: number;
  name: string;
  // password: string;
  protected: boolean;
  status: boolean;
  updated_date: string;
  admins: [];
}

export interface rawServerRoomsInterface {
  items: [roomInterface?];
}

export interface UserInterface {
    id: number;
    username: string;
    avatar: string;
    isTwoFA: boolean;
    secret?: string;
    isOnline: boolean;
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
      selectedRoom: {},
      selectedRoomAdmins: [],
      selectedRoomUsers: [],
      room: {},
      roomPasswordRequired: 0,
      passwordFieldType: "password",
      joinRoomPassword: null,
      wrongPassword: false,
    };
  },
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  props: {
    user: Object,
  },
  components: {
    ChatNewRoom,
  },
  methods: {
    sendMessage() {
      console.log(">>>> sendMessage room", this.room);
      if (this.validateInput()) {
        const message = {
          user: this.userStore.user,
          text: this.text,
          room: this.room,
        };
        this.socket.emit("addMessage", message);
        this.text = "";
        console.log("after sendMessage emit");
      }
    },
    validateInput() {
      return this.text.length > 0;
    },
    joinedRoom(room: roomInterface) {
      this.room = room;
      this.socket.emit("joinRoom", { room: room, password: this.joinRoomPassword });
      this.socket.emit("getAdmins", room);
      this.socket.emit("getUsers", room);
      this.wrongPassword = false;
      this.joinRoomPassword = null;
    },
    leaveRoom(room: roomInterface) {
      this.socket.emit("leaveRoom", room);
      this.selectedRoom = {};
    },
    quitRoom(room: roomInterface) {
      this.socket.emit("quitRoom", { room : room, user : this.userStore.user });
      // this.socket.emit("leaveRoom", room);
      // this.selectedRoom = {};
    },
    createRoom(room: newRoomInterface) {
      console.log("createRoom", room);
      this.socket.emit("createRoom", room);
    },
    resetProtectedRoom()
    {
        this.joinRoomPassword = null;
        this.roomPasswordRequired = 0;
    },
    updateSelected(selectedItem: roomInterface) {
      console.log("updateSelected", selectedItem);
      if (selectedItem.id === this.selectedRoom.id) {
        console.log("leave current room");
        this.socket.emit("leaveRoom", this.selectedRoom);
        this.selectedRoom = {};
        this.resetProtectedRoom();
      } else {
        if (selectedItem.protected == true)
        {
          this.roomPasswordRequired = selectedItem.id;
          this.selectedRoom = {};
          console.log("Trying to join protected room id", this.roomPasswordRequired);
        }
        else
        {
          this.resetProtectedRoom();
          this.selectedRoom = selectedItem;
          this.joinedRoom(selectedItem);
        }
      }
    },
    findRoleInSelectedRoom(userId: number) {
      for (var admin of this.selectedRoomAdmins)
      {
        if (admin.id == userId)
          return "admin";
      }
      return "lambda";
    },
    switchVisibility() {
      if (this.passwordFieldType == 'password')
        this.passwordFieldType = 'text'
      else
        this.passwordFieldType = 'password'
    },
    submitPassword(room: roomInterface) {
      console.log("submitPassword : ", room);
      this.selectedRoom = room;
      this.joinedRoom(room);
      this.roomPasswordRequired = 0;
    },
    addAdmin(room: roomInterface, user: UserInterface, modifier: UserInterface) {
      console.log("### STEP 1");
      this.socket.emit("addAdmin",{ room: room, user: user, modifier: this.userStore.user });
      console.log("this.selectedRoomAdmins before: ", this.selectedRoomAdmins);
      this.socket.emit("getAdmins", room);
      console.log("this.selectedRoomAdmins after: ", this.selectedRoomAdmins);
    },
    // banUser(user) {
    //   ;
    // },
  },
  async created() {
    this.socket = io("http://127.0.0.1:3000", {
      extraHeaders: {
        Authorization: this.user.access_token,
      },
    });
    this.socket.on("rooms", (rooms: rawServerRoomsInterface) => {
      this.myRooms = rooms.items;
      console.log("on \"rooms\" myRooms : ", this.myRooms);
    });
    this.socket.on("getAdmins", (admins: number[]) => {
      console.log("admins : ", admins);
      this.selectedRoomAdmins = admins;
      console.log("on \"getAdmins\" : ", this.selectedRoomAdmins);
    });
    this.socket.on("getUsers", (users: number[]) => {
      this.selectedRoomUsers = users;
      console.log("on \"getUsers\" : ", this.selectedRoomUsers);
    });
    this.socket.on("messageAdded", (message) => {
      console.log("on \"messageAdded\" : ", message);
      // this.receivedMessage(message);
      this.messages.items.push(message);
    });
    this.socket.on("messages", (messages) => {
      console.log("on \"messages\" : ", messages);
      this.messages = messages;
    });
    this.socket.on("WrongPassword", (data) => {
      console.log("on \"WrongPassword\" : ", data);
      this.selectedRoom = {};
      this.wrongPassword = true;
    });
  },
};
</script>
<template>
  <div class="container">
    <ChatNewRoom @onSubmit="createRoom" />

    <h1 style="margin-top: 30px">Salons Disponibles</h1>
    <p v-if="wrongPassword" class="error-paragraf">
      Password not matching
    </p>
    <div class="list-group">
      <ul>
        <div
          v-for="(room, index) in this.myRooms"
          :key="index"
        >
          <div
            v-if="room.id == this.roomPasswordRequired"
            class="list-group-item list-group-item-action"
          >
            💬 {{ room.name }}
            <div>
              <input :type="passwordFieldType" v-model="joinRoomPassword" placeholder="Password" />
              <button class="add-user" @click="switchVisibility">{{passwordFieldType == "password" ? 'SHOW' : 'HIDE'}}</button>
              <button class="add-user on-colors" @click="submitPassword(room)">SUBMIT</button>
            </div>
            <!-- <p v-if="wrongPassword" class="error-paragraf">
              Password not matching
            </p> -->
          </div>
          <div
           @click="updateSelected(room)"
            v-else-if="room.id !== this.selectedRoom.id"
            class="list-group-item list-group-item-action"
          >
            💬 {{ room.name }}
          </div>
          <div
           @click="updateSelected(room)"
            v-else-if="room.id === this.selectedRoom.id"
            class="list-group-item list-group-item-action selected"
          >
            💬 {{ room.name }}
          </div>
        </div>
      </ul>
    </div>

    <!-- CHAT ROOM -->
    <div style="margin-top: 30px" class="" v-if="this.selectedRoom.id">
      <h1 class="text-center">
        <!-- {{ this.selectedRoomAdmins }} -->
        Users in {{ this.selectedRoom.name }} :
        <li v-for="user in this.selectedRoomUsers" :key="user.username">
          {{ user.username }} : {{ findRoleInSelectedRoom(user.id) }}
          <div v-if="findRoleInSelectedRoom(userStore.user.id) == 'admin' && userStore.user.id != user.id" class="empty">
            <button class="new-room-button" @click="banUser(user)">Ban user</button>
            <div v-if="findRoleInSelectedRoom(userStore.user.id) == 'admin' && findRoleInSelectedRoom(user.id) != 'admin'" class="empty">
              <button class="new-room-button" @click="addAdmin(this.selectedRoom, user, userStore.user)">Set as admin</button>
            </div>
          </div>
          <!-- <div v-if="userStore.user.id == user.id" class="message">
            <button class="add-user" @click="quitRoom(this.selectedRoom)">Quit Room</button>
          </div> -->
        </li>
      </h1>
      <br />

      <div id="status"></div>
      <div id="chat">
        <br />
        <div class="message-box">
          <div id="messages-box" class="card-block">
            <div v-for="message of messages.items" :key="message.id">
              <div class="message-box">
                <div
                  v-if="userStore.user.id !== message?.user.id"
                  class="message"
                >
                  <div class="message-user">
                    {{ message?.user.username }}
                  </div>
                  <div class="message-content">{{ message?.text }}</div>
                </div>
              </div>

              <div class="message-box" style="flex-direction: row-reverse">
                <div
                  v-if="userStore.user.id === message?.user.id"
                  class="my-message"
                >
                  <div class="my-message-user">
                    {{ message?.user.username }}
                  </div>
                  <div class="my-message-content">{{ message?.text }}</div>
                </div>
              </div>
            </div>
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
</template>

<style scoped>
main {
  max-width: 500px;
  padding-top: 50px; /* Original 100px */
  margin: auto;
}

input[type="submit"]:hover {
  background-color: white;
  color: #703ab8;
}
.error-paragraf {
  color: red;
}

.empty {
  background-color: white;
  display: inline-block;
}

.new-room-button {
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
  /* display: block; */
  margin: 10px;
  border: 2px solid #703ab8;
  display: inline-block;
  max-width: 300px;
  max-height: 50px;
}

.add-user {
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
  /* display: block; */
  margin: 10px;
  border: 2px solid #703ab8;
}

/* POUR LES SALONS */
.list-group-item {
  border: 3px solid #703ab8;
  padding: 10px 20px;
  border: 3px solid #703ab8;
  border-radius: 13px;
  color: #703ab8;
  text-transform: capitalize;
  text-align: center;
  font-size: 20px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-top: 15px;
}

.list-group-item:hover {
  background-color: #713ab834;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
}

.selected:hover {
  color: #703ab8;
  background-color: white;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
}

.selected {
  color: white;
  font-weight: bold;
  background-color: #713ab8;
}

.message-box {
  display: flex;
}
#messages-box {
  height: 450px;
  overflow-y: scroll;
  width: 500px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  border-radius: 20px;
}

.on-colors {
  background-color: #703ab8;
  color: white;
}

.message {
  color: white;
  background-color: #713ab8;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 23px 23px 23px 3px;
  display: inline-block;
  padding: 10px;
  margin: 10px;
  overflow-wrap: break-word;
  max-width: 300px;
}

.message-user {
  overflow-wrap: break-word;
  font-weight: bold;
}
.message-content {
  overflow-wrap: break-word;
}
.my-message {
  color: #713ab8;
  align-self: end;
  border: 2px solid #703ab8;
  background-color: white;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 23px 23px 3px 23px;
  display: inline-block;
  padding: 10px;
  margin: 10px;
  overflow-wrap: break-word;
  max-width: 300px;
}

.my-message-user {
  overflow-wrap: break-word;

  font-weight: bold;
}
.my-message-content {
  overflow-wrap: break-word;
}

textarea {
  border: 3px solid #703ab8;
  border-radius: 13px;
  width: 100%;
  padding: 10px;
}

#send {
  background-color: #713ab8;
  color: white;
  border: none;
  font-size: 30px;
  padding: 10px;
  border-radius: 13px;
  margin-bottom: 100px;
}
</style>
