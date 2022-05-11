<script lang="ts">
import { io } from "socket.io-client";
import PasswordBtn from "../PasswordBtn.vue";

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
  MUTED = "muted",
}

export default {
  name: "ChatSelectedRoomParams",
  data() {
    return {
      // Modification
      showModifyPassword: false,
      // Addition
      showAddPassword: false,
      // room renaming
      newName : "",
    };
  },
  props: {
    user: Object, // = this.user
    userRooms: Object,
    userRoomsRoles: Object,
    selectedRoom: {
      type: Object as () => RoomI,
    },
    socket: Object,
    userRolesInRoom: Object,
    usersForRoom: Object,
  },
  components: {
    PasswordBtn,
  },
  methods: {
    // roles check
    getRole(user: UserInterface) {
      return this.userRolesInRoom[user?.id];
    },
    isOwner(user: UserInterface) {
      if (this.getRole(user) == UserRoomRole.OWNER) return true;
      return false;
    },
    // room status check
    isProtected() {
      if (
        this.selectedRoom.status == true &&
        this.selectedRoom.protected == true &&
        this.selectedRoom.password != null
      )
        return true;
      return false;
    },
    isPublic() {
      if (
        this.selectedRoom.status == true &&
        this.selectedRoom.protected == false &&
        this.selectedRoom.password == null
      )
        return true;
      return false;
    },
    deletePassword(room: RoomI, modifier: UserInterface) {
      this.socket.emit("deletePassword", { room: room, modifier: modifier });
    },
    modifyingPasswordSubmit(room: RoomI, inputPassword: string) {
      this.socket.emit("modifyPassword", {
        room: room,
        modifier: this.user,
        password: inputPassword,
      });
    },
    addingPasswordSubmit(room: RoomI, inputPassword: string) {
      this.socket.emit("addPassword", {
        room: room,
        modifier: this.user,
        password: inputPassword,
      });
    },
    renameRoom() {
      this.socket.emit("renameRoom", {
        room: this.selectedRoom,
        modifier: this.user,
        newName: this.newName
      });
    },
  },
  async created() {
    this.socket.on("modifyingPasswordSuccess", (room: RoomI) => {
      this.$notify("Password modified !");
      this.showModifyPassword = false;
      this.$emit("refreshSelected", room);
    });
    this.socket.on("addingPasswordSuccess", (room: RoomI) => {
      this.$notify({
        title: "Password added !",
        type: "success"
      });
      this.showAddPassword = false;
      this.$emit("refreshSelected", room);
    });
    this.socket.on("deletingPasswordSuccess", (room: RoomI) => {
      this.$notify({
        title: "Password deleted !",
        type: "success"
      });
      this.$emit("refreshSelected", room);
    });
    this.socket.on("renamingRoomSuccess", (room: RoomI) => {
      this.$notify({
        title: "Room renamed !",
        type: "success"
      });
      this.newName = "",
      this.$emit("refreshSelected", room);
    });
  },
};
</script>
<template>
  <div style="margin: 20px">
    <div v-if="this.selectedRoom?.name && isOwner(this.user)" class="box">
      <h1 >Settings for {{ this.selectedRoom?.name }} </h1>
      <div v-if="isPublic()">
        <p>You are the owner of this public room.
          <p>
            <button class="new-room-button" @click="this.showAddPassword = !this.showAddPassword">Add Password</button>
            <p v-if="showAddPassword">
              <PasswordBtn @onSubmit="addingPasswordSubmit" :room="this.selectedRoom" :msg="'ADD PASSWORD'"/>
            </p>
          </p>
        </p>
      </div>
      <div v-if="isProtected()">
        <p>You are the owner of this protected room.
          <p>
            <button class="new-room-button" @click="deletePassword(this.selectedRoom, this.user)">Delete Password</button>
            <button class="new-room-button" @click="this.showModifyPassword = !this.showModifyPassword">Modify Password</button>
            <div v-if="showModifyPassword">
              <PasswordBtn @onSubmit="modifyingPasswordSubmit" :room="this.selectedRoom" :msg="'MODIFY PASSWORD'"/>
            </div>
          </p>
        </p>
      </div>
      <div>
        <p>You can rename this room.</p>
        <input type="text" v-model="newName" v-on:keyup.enter="renameRoom" :placeholder="this.selectedRoom.name" />
        <button class="add-user" @click="renameRoom">Rename room</button>
      </div>
    </div>
    </div>
</template>

<style scoped>
main {
  max-width: 500px;
  padding-top: 50px; /* Original 100px */
  /* margin: auto; */
}

input {
  color: #703ab8;
  border: 3px solid #703ab8;
  padding: 10px;
  border-radius: 13px;
  font-weight: bold;
  font-size: 16px;
}

input[type="submit"]:hover {
  background-color: white;
  color: #703ab8;
}

.box {
  /* background-color: white; */
  border: none;
  font-weight: bold;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.16), 0 8px 16px rgba(0, 0, 0, 0.23);
  /* box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23); */
  border-radius: 3px;
  /* padding: 15px; */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-top: 10px;
  margin: 10px;
  /* border: 2px solid #703ab8; */
}

.error-paragraf {
  color: red;
}

.debug {
  border: #703ab8 1px solid;
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

.table-title {
  color: #703ab8;
  font-weight: bold;
  font-size: 18px;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.table-body {
  background-color: white;
  font-size: 15px;
  color: black;
}

.users-list {
  margin: 30px;
}

.bold-red {
  color: darkred;
  font-weight: bold;
}

.small-text {
  background-color: white;
  font-size: 15px;
  display: inline-block;
  color: black;
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
