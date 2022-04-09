<script lang="ts">
import { io } from "socket.io-client";
import { useUserStore } from "../stores/userStore";
import ChatCreateRoom from "./ChatNew/ChatCreateRoom.vue";
import ChatMyRooms from "./ChatNew/ChatMyRooms.vue";
import ChatAvailableRooms from "./ChatNew/ChatAvailableRooms.vue";
import PasswordBtn from "./PasswordBtn.vue";

export interface newRoomInterface {
  name: string;
  users: [{ id: number }];
}

export interface RoomI {
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
  AVAILABLE = "available",
  FORBIDDEN = "forbidden",
}

export default {
  name: "ChatNew",
  data() {
    return {
      userRooms: null,
      userRoomsRoles: [],
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
    ChatCreateRoom,
    ChatMyRooms,
    ChatAvailableRooms,
    PasswordBtn,
  },
  methods: {
    createRoom(room: newRoomInterface) {
      console.log("createRoom", room);
      this.socket.emit("createRoom", room);
    },
  },
  async created() {
    this.socket = io("http://127.0.0.1:3000", {
      extraHeaders: {
        Authorization: this.user.access_token,
      },
    });
    this.socket.on("getRoomsForUser", (rooms: RoomI[]) => {
      this.userRooms = rooms;
      console.log("ChatNew ------------ getRoomsForUser : ", rooms);
      this.socket.emit("getAllRolesForUser", this.user);
    });
    this.socket.on("getAllRolesForUser", (roles) => {
      this.userRoomsRoles = roles;
      console.log("ChatNew this.userRoomsRoles  : ", this.userRoomsRoles );
    });
  },
};
</script>
<template>
  <div class="container">
    <ChatCreateRoom @onSubmit="createRoom" />
    <ChatMyRooms :user="user" :userRooms="this.userRooms" :userRoomsRoles="this.userRoomsRoles"/>
    <ChatAvailableRooms :user="user" :userRooms="this.userRooms" :userRoomsRoles="this.userRoomsRoles"/>
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
