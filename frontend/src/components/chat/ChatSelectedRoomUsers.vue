<script lang="ts">
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
  name: "ChatSelectedRoomUsers",
  data() {
    return {
      roles: {
        OWNER: "owner",
        ADMIN: "admin",
        LAMBDA: "lambda",
        MUTED: "muted",
        BANNED: "banned",
        // AVAILABLE: "available",
        // FORBIDDEN: "forbidden",
      },
      gameRoomName: null,
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
  components: {},
  methods: {
    // roles check
    getRole(user: UserInterface) {
      return this.userRolesInRoom[user?.id];
    },
    isOwner(user: UserInterface) {
      if (this.getRole(user) == UserRoomRole.OWNER) return true;
      return false;
    },
    isAdmin(user: UserInterface) {
      var role = this.getRole(user);
      if (role == UserRoomRole.OWNER || role == UserRoomRole.ADMIN) return true;
      return false;
    },
    isBanned(user: UserInterface) {
      if (this.getRole(user) == UserRoomRole.BANNED) return true;
      return false;
    },
    isMuted(user: UserInterface) {
      if (this.getRole(user) == UserRoomRole.MUTED) return true;
      return false;
    },
    isLambda(user: UserInterface) {
      if (this.getRole(user) == UserRoomRole.LAMBDA) return true;
      return false;
    },
    // roles update
    updateRole(room: RoomI, user: UserInterface, newRole: UserRoomRole) {
      this.socket.emit("updateRole", {
        room: room,
        user: user,
        modifier: this.user,
        newRole: newRole,
      });
    },
    addAdmin(room: RoomI, user: UserInterface) {
      if (!this.isAdmin(user)) this.updateRole(room, user, UserRoomRole.ADMIN);
      else this.updateRole(room, user, UserRoomRole.LAMBDA);
    },
    banUser(room: RoomI, user: UserInterface) {
      if (!this.isBanned(user))
        this.updateRole(room, user, UserRoomRole.BANNED);
      else this.updateRole(room, user, UserRoomRole.LAMBDA);
    },
    muteUser(room: RoomI, user: UserInterface) {
      if (!this.isMuted(user)) this.updateRole(room, user, UserRoomRole.MUTED);
      else this.updateRole(room, user, UserRoomRole.LAMBDA);
    },
    seeProfile(user: UserInterface) {
      this.$router.push("/user/" + user.id);
    },
    sendInvit(user) {
      this.socket.emit("sendInvit", user, this.user);
    },
    quitRoom() {
      this.socket.emit("quitRoom", {
        room: this.selectedRoom,
        user: this.user,
      });
      // this.socket.emit("leaveRoom", this.selectedRoom);
    },
  },
  async created() {
    this.socket.on("errorQuitRoom", () => {
      this.$emit("notifyWarn", "You can't leave room if you are the last person in it.")
    });
    this.socket.on("successQuitRoom", () => {
      var roomName = this.selectedRoom.name;
      this.socket.emit("leaveRoom", this.selectedRoom);
      this.$emit("notifySuccess", "You have left " + roomName + " !")
    });
  },
};
</script>


<template>
  <div>
    <div v-if="this.selectedRoom?.name && getRole(this.user) != 'banned'" class="box">
      <h1>Users in {{ this.selectedRoom?.name }}</h1>
      <div v-for="role in roles" class="users-list" :key="role">
        <div v-if="role != 'banned' || isAdmin(this.user)">
          <p class="table-title">• {{ role }}</p>
          <div
            v-for="user in this.usersForRoom"
            class="table-body"
            :key="user.id"
          >
            <p v-if="getRole(user) == role" class="">
              <button class="profile-button" @click="seeProfile(user)">
                {{ user.username }}
              </button>
              <span v-if="user.id != this.user.id">
                <button
                  class="on-colors new-room-button"
                  @click="sendInvit(user)"
                >
                  INVITE FOR A GAME
                </button>
                <span v-if="role != 'owner' && role != 'banned'">
                  <button
                    v-if="isOwner(this.user)"
                    class="new-room-button"
                    @click="addAdmin(this.selectedRoom, user)"
                  >
                    {{ isAdmin(user) ? "Remove from admins" : "Add to admins" }}
                  </button>
                </span>
                <span v-if="role != 'owner'">
                  <button
                    v-if="isOwner(this.user) || (isAdmin(this.user) && !isAdmin(user))"
                    class="new-room-button"
                    @click="banUser(this.selectedRoom, user)"
                  >
                    {{ isBanned(user) ? "Accept" : "Ban" }} user
                  </button>
                </span>
                <span
                  v-if="isAdmin(this.user) && (isLambda(user) || isMuted(user))"
                >
                  <button
                    v-if="isAdmin(this.user)"
                    class="new-room-button"
                    @click="muteUser(this.selectedRoom, user)"
                  >
                    {{ isMuted(user) ? "Unmute" : "Mute" }} user
                  </button>
                </span>
              </span>
            </p>
          </div>
        </div>
      </div>
      <button v-if="!isMuted(user)" class="quit-room-button" @click="quitRoom()" title="Quit Room">
        👋 quit room
      </button>
      <div class="bold-red"> You can't leave room if you are muted or the last person in it </div>

      <!-- <code>
        <pre>{{ this.usersForRoom }}</pre>
      </code> -->
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
  font-weight: bold;
  border-radius: 3px;
  padding: 15px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-top: 10px;
  margin: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.16), 0 8px 16px rgba(0, 0, 0, 0.23);
}

.on-colors {
  background-color: #703ab8;
  color: white;
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
  /* color: #703ab8; */
  font-weight: bold;
  font-size: 18px;
  text-transform: capitalize;
  /* margin-bottom: 5px; */
}

.table-body {
  font-size: 15px;
  color: black;
}

.users-list {
  /* margin: 10px; */
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

.profile-button {
  background-color: white;
  border: none;
  color: rgba(0, 0, 0, 0.7);
  /* font-weight: bold; */
  font-size: 20px;
  box-shadow: none;
  border-radius: 3px;
  padding: 6px 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-top: 10px;
  margin: 10px;
  border: none;
  display: inline-block;
  max-width: 300px;
  max-height: 50px;
  text-transform: capitalize;
  text-decoration: underline;
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

.quit-room-button {
  background-color: white;
  border: none;
  color: #dc2626;
  font-weight: bold;
  font-size: 20px;
  box-shadow: 0 3px 6px rgba(221, 7, 7, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  /* padding: 6px 6px; */
  height: 40px;
  /* width: 45px; */
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  /* display: block; */
  margin: 10px;
  padding: 10px;
  border: 4px solid #dc2626;
  border-radius: 50px;
  display: inline-block;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
