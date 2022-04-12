<script lang="ts">
import { io } from "socket.io-client";

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
  MUTED = "muted",
}

export default {
  name: "ChatSelectedRoomChat",
  data() {
    return {
      text: "",
      messages: [],
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
  },
  methods: {
    getRole()
    {
      return this.userRoomsRoles[this.selectedRoom.id];
    },
    sendMessage() {
      if (this.validateInput()) {
        const message = {
          user: this.user,
          text: this.text,
          room: this.selectedRoom,
        };
        console.log(">>>>>> emit addMessage : ", message, this.getRole());
        this.socket.emit("addMessage", { message: message, role: this.getRole()});
        this.text = "";
        console.log("after sendMessage emit");
      }
    },
    validateInput() {
      return this.text.length > 0;
    },
  },
  async created() {
    this.socket.on("updateSelected", (room) => {
      this.$emit('updateSelected', room);
    });
    this.socket.on("messageAdded", (message) => {
      this.messages.items.push(message);
    });
    this.socket.on("getMessages", (messages) => {
      this.messages = messages;
    });
  },
};
</script>
<template>
  <div>
      <div v-if="this.selectedRoom?.id" id="chat" class="box">
        <h1>Chat in {{ this.selectedRoom.name }} </h1>
        <div class="message-box">
          <div id="messages-box" class="card-block">
            <!-- Received messages -->
            <div v-for="message of messages.items" :key="message.id">
              <div class="message-box">
                <div v-if="this.user.id !== message?.user.id" class="message" >
                  <div class="message-user">
                    {{ message?.user.username }}
                  </div>
                  <div class="message-content">{{ message?.text }}</div>
                </div>
              </div>
            <!-- Sent messages -->
            <div class="message-box" style="flex-direction: row-reverse">
              <div v-if="this.user.id === message?.user.id" class="my-message" >
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
        <div v-if="getRole() != 'muted'">
          <textarea id="textarea" class="form-control" v-model="text" placeholder="Enter message..."></textarea>
          <br />
          <button id="send" class="btn" @click.prevent="sendMessage(this.selectedRoom)"> Send </button>
        </div>
        <div v-else>
          You have been muted in this room.
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

.box {
  background-color: white;
  border: none;
  font-weight: bold;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 3px;
  padding: 15px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-top: 10px;
  margin: 10px;
  border: 2px solid #703ab8;
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
  /* margin-bottom: 100px; */
}
</style>
