<script lang="ts">
import { io } from "socket.io-client";
import { useUserStore } from "../stores/userStore";
import ChatNewRoom from "./ChatNewRoom.vue";
import PasswordBtn from "./PasswordBtn.vue";

export interface newRoomInterface {
  name: string;
  users: [{ id: number }];
}

export interface roomInterface {
  created_date: string;
  id: number;
  name: string;
  password: string;
  protected: boolean;
  status: boolean;
  updated_date: string;
  admins: [];
  bans: [];
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

export enum UserRoomRole {
  OWNER = "owner",
  ADMIN = "admin",
  BANNED = "banned",
  LAMBDA = "lambda",
}

export default {
  name: "Chat",
  data() {
    return {
      text: "",
      messages: [],
      socket: null,
      userStore: useUserStore(),
      myRooms: null,
      selectedRoom: {},
      selectedRoomUsers: [],
      selectedRoomRoles: [],
      room: {},
      // Pwd when trying to join room
      roomPasswordRequired: 0,
      joiningPassword: null, // password
      wrongPassword: false, // error
      // Pwd when changing it
      showModifyPassword: false,
      modifyingPasswordSuccess: false, // validation
      // Pwd when adding one
      showAddPassword: false,
      addingPasswordSuccess: false, // validation
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
    PasswordBtn,
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
    getUpdatedRoles(room: roomInterface) {
      this.socket.emit("getUsers", room);
      this.socket.emit("getRoles", room);
    },
    joinedRoom(room: roomInterface) {
      this.room = room;
      this.socket.emit("joinRoom", { room: room, password: this.joiningPassword });
      this.getUpdatedRoles(room);
      this.wrongPassword = false;
      this.joiningPassword = null;
    },
    leaveRoom(room: roomInterface) {
      this.socket.emit("leaveRoom", room);
      this.selectedRoom = {};
    },
    createRoom(room: newRoomInterface) {
      console.log("createRoom", room);
      this.socket.emit("createRoom", room);
    },
    resetValidationMsgs()
    {
      this.modifyingPasswordSuccess = false;
      this.addingPasswordSuccess = false;
    },
    resetProtectedRoom()
    {
        this.joiningPassword = null;
        this.roomPasswordRequired = 0;
        this.resetValidationMsgs();
        this.showModifyPassword = false;
        this.showAddPassword = false;
    },
    updateSelected(selectedItem: roomInterface) {
      // console.log("updateSelected", selectedItem);
      this.resetValidationMsgs();
      // If we click on currently selected room => leave room
      if (selectedItem.id === this.selectedRoom.id) {
        // console.log(">>>>>> If we click on currently selected room => leave room");
        this.socket.emit("leaveRoom", this.selectedRoom);
        this.selectedRoom = {};
        this.resetProtectedRoom();
      } else {
        //  If protected => add roomId to 'roomPasswordRequired'
        if (selectedItem.protected == true)
        {
          // console.log(">>>>>> if protected => add roomId to 'roomPasswordRequired'");
          this.roomPasswordRequired = selectedItem.id;
          this.selectedRoom = {};
          // console.log("Trying to join protected room id", this.roomPasswordRequired);
        }
        //  Else, join room
        else
        {
          // console.log(">>>>>> Else, join room");
          this.resetProtectedRoom();
          this.selectedRoom = selectedItem;
          this.joinedRoom(selectedItem);
        }
      }
    },
    // room getter
    getRoom(roomId: Number) {
      for (var room of this.myRooms)
      {
        if (room.id == roomId)
          return room;
      }
      return null;
    },
    // roles update
    updateRole(room: roomInterface, user: UserInterface, newRole: UserRoomRole) {
      this.socket.emit("updateRole",{ room: room, user: user, modifier: this.userStore.user, newRole: newRole });
      this.getUpdatedRoles(room);
    },
    addAdmin(room: roomInterface, user: UserInterface) {
      if (!this.isAdmin(user))
        this.updateRole(room, user, UserRoomRole.ADMIN)
      else
        this.updateRole(room, user, UserRoomRole.LAMBDA)
    },
    banUser(room: roomInterface, user: UserInterface) {
      if (!this.isBanned(user))
        this.updateRole(room, user, UserRoomRole.BANNED)
      else
        this.updateRole(room, user, UserRoomRole.LAMBDA)
    },
    // roles getter
    getRole(user: UserInterface)
    {
      return this.selectedRoomRoles[user.id];
    },
    // roles check
    isAdmin(user: UserInterface) {
      var role = this.getRole(user);
      if (role == UserRoomRole.ADMIN || role == UserRoomRole.OWNER)
        return true;
      return false;
    },
    isBanned(user: UserInterface) {
      if (this.getRole(user) == UserRoomRole.BANNED)
        return true;
      return false;
    },
    isOwner(user: UserInterface) {
      if (this.getRole(user) == UserRoomRole.OWNER)
        return true;
      return false;
    },
    // room status check
    isProtected() {
      if (this.selectedRoom.status == true && this.selectedRoom.protected == true && this.selectedRoom.password != null)
        return true;
      return false;
    },
    isPublic() {
      if (this.selectedRoom.status == true && this.selectedRoom.protected == false && this.selectedRoom.password == null)
        return true;
      return false;
    },
    // password functions
    joiningPasswordSubmit(roomId: Number, inputPassword: string) {
      var room: roomInterface = this.getRoom(roomId);
      this.joiningPassword = inputPassword;
      this.selectedRoom = room;
      this.joinedRoom(room);
      this.roomPasswordRequired = 0;
    },
    deletePassword(room: roomInterface, modifier: UserInterface) {
      this.roomPasswordRequired = 0;
      this.socket.emit("deletePassword", { room: room, modifier: modifier });
    },
    modifyingPasswordSubmit(roomId: Number, inputPassword: string) {
      this.socket.emit("modifyPassword", { room: this.getRoom(roomId), modifier: this.userStore.user, password: inputPassword });
    },
    addingPasswordSubmit(roomId: Number, inputPassword: string) {
      this.socket.emit("addPassword", { room: this.getRoom(roomId), modifier: this.userStore.user, password: inputPassword });
    },
  },
  async created() {
    this.socket = io("http://127.0.0.1:3000", {
      extraHeaders: {
        Authorization: this.user.access_token,
      },
    });
    this.socket.on("rooms", (rooms: roomInterface[]) => {
      this.myRooms = rooms;
      console.log("------------ rooms : ", rooms);
    });
    this.socket.on("getRoles", (roles) => {
      this.selectedRoomRoles = roles;
    });
    this.socket.on("getUsers", (users: number[]) => {
      this.selectedRoomUsers = users;
    });
    this.socket.on("messageAdded", (message) => {
      // this.receivedMessage(message);
      this.messages.items.push(message);
    });
    this.socket.on("messages", (messages) => {
      this.messages = messages;
    });
    this.socket.on("WrongPassword", (data) => {
      this.selectedRoom = {};
      this.wrongPassword = true;
    });
    this.socket.on("updateSelectedRoom", (room: roomInterface) => {
      this.selectedRoom = room;
    });
    this.socket.on("modifyingPasswordSuccess", (room: roomInterface) => {
      this.modifyingPasswordSuccess = true;
      this.showModifyPassword = false;
      // this.selectedRoom = room;
    });
    this.socket.on("addingPasswordSuccess", (room: roomInterface) => {
      this.addingPasswordSuccess = true;
      this.showAddPassword = false;
      this.selectedRoom = room;
      console.log("room : ", room);
      console.log("this.selectedRoom : ", this.selectedRoom);
    });
  },
};
</script>
<template>
  <div class="container">
    <ChatNewRoom @onSubmit="createRoom" />
    <!-- Available rooms -->
    <h1 style="margin-top: 30px">Salons Disponibles</h1>
    <p v-if="wrongPassword" class="error-paragraf">
      Password not matching
    </p>
    <div class="list-group">
      <ul>
        <div v-for="(room, index) in this.myRooms" :key="index">
          <!-- If room protected and HAS JUST BEEN SELECTED -->
          <div v-if="room.id == this.roomPasswordRequired" class="list-group-item list-group-item-action" >
            💬 {{ room.name }}
            <PasswordBtn @onSubmit="joiningPasswordSubmit" :roomId="room.id" :msg="'JOIN ROOM'"/>
          </div>
          <!-- Else -->
          <div v-else @click="updateSelected(room)" :class="'list-group-item list-group-item-action ' + ((room.id === this.selectedRoom.id) ? 'selected' : '')">
            💬 {{ room.name }}
          </div>
        </div>
      </ul>
    </div>

    <!-- SELECTED ROOM -->
    <div style="margin-top: 30px" class="" v-if="this.selectedRoom.id">

      <!-- Selected room - params -->

      <h1 class="text-center small-text">
        <div v-if="isOwner(userStore.user) && (userStore.user.id == user.id)" class="empty">
          <div v-if="isProtected()">
            <p>You are the owner of this protected room.
              <p>
                <button class="new-room-button" @click="deletePassword(this.selectedRoom, userStore.user)">Delete Password</button>
                <button class="new-room-button" @click="this.showModifyPassword = !this.showModifyPassword">Modify Password</button>
                <div v-if="showModifyPassword">
                  <PasswordBtn @onSubmit="modifyingPasswordSubmit" :roomId="room.id" :msg="'MODIFY PASSWORD'"/>
                </div>
                <p v-if="this.modifyingPasswordSuccess" class="validation-paragraf">
                  Password updated
                </p>
              </p>
            </p>
          </div>
          <div v-if="isPublic()">
            <p>You are the owner of this public room.
              <p>
                <button class="new-room-button" @click="this.showAddPassword = !this.showAddPassword">Add Password</button>
                <p v-if="showAddPassword">
                  <PasswordBtn @onSubmit="addingPasswordSubmit" :roomId="room.id" :msg="'ADD PASSWORD'"/>
                </p>
                <p v-if="this.addingPasswordSuccess" class="validation-paragraf">
                  Password added
                </p>
              </p>
            </p>
          </div>
        </div>

      <!-- Selected room - users -->

        <p>Users in <span class="bold-colored">{{ this.selectedRoom.name }}</span> :</p>
          <!-- this.selectedRoomBans => {{ this.selectedRoomBans }} -->
        <li v-for="user in this.selectedRoomUsers" :key="user.username">
          <span :class="isBanned(user) ? 'bold-red' : 'bold-colored'">{{ user.username }}</span> ({{ getRole(user) }})
          <!-- If admin => Ban user -->
          <div v-if="isAdmin(userStore.user) && userStore.user.id != user.id" class="empty">
              <button class="new-room-button" @click="banUser(this.selectedRoom, user)">{{ isBanned(user) ? 'Accept' : 'Ban'}} user</button>
          </div>
          <!-- If admin and other not admin => set as admin -->
          <div v-if="isAdmin(userStore.user) && !isOwner(user) && userStore.user.id != user.id && !isBanned(user)" class="empty">
            <button class="new-room-button" @click="addAdmin(this.selectedRoom, user)">{{ isAdmin(user) ? 'Remove from admins' : 'Set as admin'}}</button>
          </div>
        </li>
      </h1>
      <br />

    <!-- Selected room - chat -->

      <div id="status"></div>
      <div id="chat">
        <br />
        <div class="message-box">
          <div id="messages-box" class="card-block">
            <!-- Received messages -->
            <div v-for="message of messages.items" :key="message.id">
              <div class="message-box">
                <div v-if="userStore.user.id !== message?.user.id" class="message" >
                  <div class="message-user">
                    {{ message?.user.username }}
                  </div>
                  <div class="message-content">{{ message?.text }}</div>
                </div>
              </div>
            <!-- Sent messages -->
            <div class="message-box" style="flex-direction: row-reverse">
              <div v-if="userStore.user.id === message?.user.id" class="my-message" >
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
        <textarea id="textarea" class="form-control" v-model="text" placeholder="Enter message..."></textarea>
        <br />
        <button id="send" class="btn" @click.prevent="sendMessage(room)"> Send </button>
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

.validation-paragraf {
  color: green;
  font-weight: bold;
}

.empty {
  background-color: white;
  display: inline-block;
}

.bold-colored {
  color: #703ab8;
  font-weight: bold;
}

.bold-red {
  color: darkred;
  font-weight: bold;
}

.small-text {
  background-color: white;
  font-size: 15px;
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
