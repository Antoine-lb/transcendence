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
  name: "ChatSelectedRoomParams",
  data() {
    return {
      showAddPassword: false,
      addingPasswordSuccess: false, // validation
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
  },
  components: {
    PasswordBtn,
  },
  methods: {
    getRole()
    {
      return this.userRoomsRoles[this.selectedRoom?.id];
    },
    isOwner() {
      if (this.getRole() == UserRoomRole.OWNER)
        return true;
      return false;
    },   
    isPublic() {
      if (this.selectedRoom.status == true && this.selectedRoom.protected == false && this.selectedRoom.password == null)
        return true;
      return false;
    },
    addingPasswordSubmit(room: RoomI, inputPassword: string) {
      console.log(">>>>>> emitting addPassword");
      this.socket.emit("addPassword", { room: room, modifier: this.user, password: inputPassword });
    },
  },
  async created() {
    this.socket.on("addingPasswordSuccess", (room: RoomI) => {
      console.log(">>>>>> return on addingPasswordSuccess COMPONENT");
      this.addingPasswordSuccess = true;
      this.showAddPassword = false;
      // this.selectedRoom = room;
      // console.log("room : ", room);
      // console.log("this.selectedRoom : ", this.selectedRoom);
    });
  },
};
</script>
<template>
  <div class="container" style="margin: 20px">
    <div v-if="isOwner()">
      <div v-if="isPublic()">
        <p>You are the owner of this public room.
          <p>
            <button class="new-room-button" @click="this.showAddPassword = !this.showAddPassword">Add Password</button>
            <p v-if="showAddPassword">
              <PasswordBtn @onSubmit="addingPasswordSubmit" :room="this.selectedRoom" :msg="'ADD PASSWORD'"/>
            </p>
            <p v-if="this.addingPasswordSuccess" class="validation-paragraf">
              Password added
            </p>
          </p>
        </p>
      </div>
    </div>
      <!-- <div v-if="this.selectedRoom?.id" id="params">
        <br />
        <h1 style="margin-top: 30px">Selected room => {{ this.selectedRoom.name }} </h1>
        <div v-if="isOwner(this.user) && (this.user.id == user.id)" class="empty">
          <div v-if="isProtected()">
            <p>You are the owner of this protected room.
              <p>
                <button class="new-room-button" @click="deletePassword(this.selectedRoom, this.user)">Delete Password</button>
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
      </div> -->
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
