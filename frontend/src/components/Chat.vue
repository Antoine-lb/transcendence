<script lang="ts">
import ChatCreateRoom from "./chat/ChatCreateRoom.vue";
import ChatMyRooms from "./chat/ChatMyRooms.vue";
import ChatGame from "./chat/ChatGame.vue";
import ChatAvailableRooms from "./chat/ChatAvailableRooms.vue";
import ChatSelectedRoomChat from "./chat/ChatSelectedRoomChat.vue";
import ChatSelectedRoomParams from "./chat/ChatSelectedRoomParams.vue";
import ChatSelectedRoomUsers from "./chat/ChatSelectedRoomUsers.vue";
import ChatCreatePrivateRoom from "./chat/ChatCreatePrivateRoom.vue";

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
  isOnline: number;
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
  name: "Chat",
  data() {
    return {
      userRooms: null,
      userRoomsRoles: [], // roles in all rooms for current user
      selectedRoom: null,
      userRolesInRoom: [], // all roles in current room
      usersForRoom: [], // all users for current room (even AVAILABLE BANNED or FORBIDDEN)
      blockedFriends: [],
    };
  },
  // setup() {
  //   const userStore = useUserStore();
  //   return { userStore };
  // },
  props: {
    user: Object,
    socket: Object,
  },
  components: {
    ChatCreateRoom,
    ChatMyRooms,
    ChatGame,
    ChatAvailableRooms,
    ChatSelectedRoomChat,
    ChatSelectedRoomParams,
    ChatSelectedRoomUsers,
    ChatCreatePrivateRoom,
  },
  methods: {
    notifyError(msg) {
      this.$notify({
        title: msg,
        type: "error"
      })
    },
    notifyWarn(msg) {
      this.$notify({
        title: msg,
        type: "warn"
      })
    },
    notifySuccess(msg) {
      this.$notify({
        title: msg,
        type: "success"
      })
    },
    createRoom(room: newRoomInterface) {
      this.socket.emit("createRoom", room);
    },
    updateSelected(room: RoomI) {
      if (this.selectedRoom && room.id == this.selectedRoom.id)
        this.selectedRoom = {};
      else this.selectedRoom = room;
    },
    refreshSelected(room: RoomI) {
      this.socket.emit("getRoles", room);
      this.selectedRoom = room;
    },
  },
  async created() {
    // this.socket = io("http://127.0.0.1:3000", {
    //   extraHeaders: {
    //     Authorization: this.user.access_token,
    //   },
    // });
    this.socket.on("getRoomsForUser", (rooms: RoomI[]) => {
      this.userRooms = rooms;
      this.socket.emit("getAllRolesForUser", this.user);
    });
    this.socket.on("getAllRolesForUser", (roles) => {
      this.userRoomsRoles = roles;
    });
    this.socket.on("getRoles", (roles) => {
      this.userRolesInRoom = roles;
      this.socket.emit("getAllRolesForUser", this.user);
    });
    this.socket.on("getUsers", (users) => {
      this.usersForRoom = users;
    });
    this.socket.on("getBlockedFriends", (users) => {
      this.blockedFriends = users;
    });
    this.socket.on("error", (error) => {
      this.$notify({
        title: "An error has occured : " + error.message + ".",
        type: "error"  
      })
    });
    this.socket.emit("getAllInformation", this.user);
  },
};
</script>
<template>
  <div class="container">
    <div class="chat-container">
      <div class="chat-side">
        <ChatMyRooms
          v-if="userRooms && userRooms.length"
          @updateSelected="updateSelected"
          :socket="this.socket"
          :selectedRoom="this.selectedRoom"
          :user="user"
          :userRooms="this.userRooms"
          :userRoomsRoles="this.userRoomsRoles"
          @notifyWarn="notifyWarn"
          @notifyError="notifyError"
          @notifySuccess="notifySuccess"
        />
        <ChatAvailableRooms
          v-if="userRooms && userRooms.length"
          :user="user"
          :socket="this.socket"
          :userRooms="this.userRooms"
          :userRoomsRoles="this.userRoomsRoles"
        />
        <ChatCreateRoom
          @onSubmit="createRoom"
          :user="user"
        />
        <ChatCreatePrivateRoom @onSubmit="createRoom" />
      </div>
      <div class="main-chat">
        <ChatGame
          :selectedRoom="this.selectedRoom"
          :usersForRoom="this.usersForRoom"
          :userRolesInRoom="this.userRolesInRoom"
          :socket="this.socket"
          :user="user"
          :userRooms="this.userRooms"
          :userRoomsRoles="this.userRoomsRoles"
        />
        <ChatSelectedRoomChat
          :selectedRoom="this.selectedRoom"
          :blockedFriends="this.blockedFriends"
          :socket="this.socket"
          :user="user"
          :userRooms="this.userRooms"
          :userRoomsRoles="this.userRoomsRoles"
          @notifyWarn="notifyWarn"
          @notifyError="notifyError"
          @notifySuccess="notifySuccess"
        />
        <ChatSelectedRoomUsers
          :selectedRoom="this.selectedRoom"
          :usersForRoom="this.usersForRoom"
          :userRolesInRoom="this.userRolesInRoom"
          :socket="this.socket"
          :user="user"
          :userRooms="this.userRooms"
          :userRoomsRoles="this.userRoomsRoles"
          @notifyWarn="notifyWarn"
          @notifyError="notifyError"
          @notifySuccess="notifySuccess"
        />
        <ChatSelectedRoomParams
          @refreshSelected="refreshSelected"
          :selectedRoom="this.selectedRoom"
          :usersForRoom="this.usersForRoom"
          :userRolesInRoom="this.userRolesInRoom"
          :socket="this.socket"
          :user="user"
          :userRooms="this.userRooms"
          :userRoomsRoles="this.userRoomsRoles"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  margin-top: 30px;
  margin-bottom: 150px;
}

.chat-side {
  width: 50%;
  /* background-color: rgba(120, 61, 204, 0.2); */
  /* backdrop-filter: blur(5px); */
  /* border-radius: 50px; */
  border-right: 2px solid #713ab8a8;
  padding: 10px;
  /* box-shadow: 0 0 6px rgba(213, 183, 255, 0.2),
    0 0 30px rgba(219, 202, 243, 0.34), 0 0 12px rgba(211, 193, 236, 0.52),
    0 0 21px rgba(211, 193, 236, 0.92), 0 0 34px rgba(211, 193, 236, 0.78),
    0 0 54px rgba(211, 193, 236, 0.92); */
}

.main-chat {
  width: 60%;
  margin-left: 10px;
}

@media screen and (max-width: 840px) {
  .chat-container {
    flex-direction: column;
  }

  .chat-side {
    width: 100%;
  }

  .main-chat {
    width: 100%;
  }
}
main {
  /* max-width: 500px; */
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
