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
  name: "ChatMyRooms",
  data() {
    return {
      showPasswordToJoin: 0,
      roles: {
        OWNER: "owner",
        ADMIN: "admin",
        LAMBDA: "lambda",
        MUTED: "muted",
      },
    };
  },
  props: {
    socket: Object,
    user: Object, // = userStore.user
    userRooms: Object,
    userRoomsRoles: Object,
    selectedRoom: {
      type: Object as () => RoomI,
    },
  },
  components: {
    PasswordBtn,
  },
  methods: {
    getRole(room: RoomI) {
      return this.userRoomsRoles[room.id];
    },
    isRoomInMyRooms(room: RoomI) {
      var role = this.getRole(room);
      if (
        role == UserRoomRole.OWNER ||
        role == UserRoomRole.ADMIN ||
        role == UserRoomRole.LAMBDA
      )
        return true;
      return false;
    },
    isOwner(room: RoomI) {
      if (this.getRole(room) == UserRoomRole.OWNER) return true;
      return false;
    },
    isRoomAvailable(room: RoomI) {
      if (this.getRole(room) == UserRoomRole.AVAILABLE) return true;
      return false;
    },
    resetProtectedRoom() {
      this.showPasswordToJoin = 0;
      this.joiningPassword = null;
    },
    selectRoom(room: RoomI, password: string) {
      this.socket.emit("selectRoom", { room: room, password: password });
      this.wrongPassword = false;
      this.resetProtectedRoom();
    },
    leaveRoom(room: RoomI) {
      this.socket.emit("leaveRoom", room);
      this.resetProtectedRoom();
    },
    updateSelected(room: RoomI) {
      if (this.selectedRoom && room.id == this.selectedRoom.id)
        this.leaveRoom(room);
      else {
        if (room.protected == false) this.selectRoom(room, null);
        else this.showPasswordToJoin = room.id; // affiche jsute la possibilite d'entrer un password
      }
    },
  },
  async created() {
    this.socket.on("updateSelected", (room) => {
      this.$emit("updateSelected", room);
    });
    this.socket.on("WrongPassword", () => {
      this.$emit("notifyError", "Wrong password !");
    });
  },
};
</script>
<template>
  <div class="box">
    <h1>My rooms</h1>
    <div class="list-group">
      <ul>
        <div v-for="role in roles" class="users-list" :key="role">
          <p class="table-title">
            {{ role }}
          </p>
          <div v-for="(room, index) in userRooms" :key="index">
            <div
              style="
                display: flex;
                justify-content: center;
                align-items: center;
              "
              v-if="getRole(room) == role"
            >
              <div
                v-if="room.id == this.showPasswordToJoin"
                class="list-group-item"
              >
                💬 {{ room.name }}
                <PasswordBtn
                  @onSubmit="selectRoom"
                  :room="room"
                  :msg="'JOIN ROOM'"
                />
              </div>
              <div
                v-else
                @click="updateSelected(room)"
                :class="
                  'list-group-item ' +
                  (room.id === this.selectedRoom?.id ? 'selected' : '')
                "
              >
                💬 {{ room.name }}
              </div>
            </div>
          </div>
        </div>
      </ul>
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

.box {
  border: none;
  /* font-weight: bold; */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.16), 0 8px 16px rgba(0, 0, 0, 0.23);
  border-radius: 3px;
  padding: 15px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-top: 10px;
  /* margin: 10px; */
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

.table-title {
  /* color: #703ab8; */
  /* font-weight: bold; */
  font-size: 18px;
  text-transform: capitalize;
  margin-bottom: 5px;
}

.table-body {
  background-color: white;
  font-size: 15px;
  color: black;
}

.users-list {
  /* margin: 30px; */
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
  width: 100%;
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
  background-color: rgba(255, 255, 255, 0.489);
  backdrop-filter: blur(5px);
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
