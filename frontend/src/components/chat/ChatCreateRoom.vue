<script lang="ts">
import { useUserStore } from "../../stores/userStore";

export interface newRoomInterface {
  name: string;
  users: [{ id: number }];
  status: boolean;
  protected: boolean;
  password: string; // TODO : crypt it
}

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
  name: "ChatCreateRoom",
  data() {
    return {
      userStore: useUserStore(),
      newRoomName: null,
      newRoomUser: null,
      newRoomError: null,
      newRoomUserShowError: false,
      newRoomUsers: [],
      allUsers: [],
      isPublic: true,
      newRoomPassword: null,
      passwordFieldType: "password",
    };
  },
  props: {
    onSubmit: Function,
    user: Object,
  },
  async created() {
    this.loading = true;
    try {
      const response = await fetchWithHeaders(
        "http://127.0.0.1:3000/api/users"
      );
      if (response.status == 200) {
        this.allUsers = await response.json();
      }
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
  },
  methods: {
    newUser() {
      let valid = true;
      this.newRoomUserShowError = false;
      // verifie si ce n'est pas moi-meme
      if (this.newRoomUser == this.user.username)
      {
        this.newRoomUserShowError = true;
        this.newRoomError = "Cannot add yourself.";
        valid = false;
      }
      // verifie s'il n'existe pas deja dans la liste
      this.newRoomUsers.map((element) => {
        if (element.username === this.newRoomUser) {
          this.newRoomError = "User already in the list.";
          this.newRoomUserShowError = true;
          valid = false;
        }
      });
      if (valid == false)
        return;
      // ajoute newRoomUser to newRoomUsers
      valid = false
      this.allUsers.map((element) => {
        if (element.username === this.newRoomUser) {
          this.newRoomUsers.push(element);
          this.newRoomUser = "";
          valid = true;
        }
      });
      // sinon, "username not found"
      if (!valid) {
        this.newRoomUserShowError = true;
        this.newRoomError = "Username not found"
      }
    },
    removeUser(user) {
      this.allUsers.map((element) => {
        if (element.username === user.username) {
          this.newRoomUsers.splice(this.newRoomUsers.indexOf(user), 1);
        }
      });
    },
    resetVars() {
      this.userStore = "";
      this.newRoomName = null;
      this.newRoomUser = null;
      this.newRoomError = null;
      this.newRoomUserShowError = false;
      this.newRoomUsers = [];
      this.allUsers = [];
      this.isPublic = true;
      this.newRoomPassword = null;
      this.passwordFieldType = "password";
    },
    createRooms() {
      let room: newRoomInterface = {
        name: this.newRoomName ? this.newRoomName : "No Name",
        users: this.newRoomUsers,
        status: this.isPublic ? true : false,
        protected: this.newRoomPassword ? true : false,
        password: !this.isPublic
          ? false
          : this.newRoomPassword
          ? this.newRoomPassword
          : null,
      };
      this.$emit("onSubmit", room);
      this.resetVars();
    },
    toggleStatus() {
      this.isPublic = !this.isPublic;
      if (!this.isPublic) this.newRoomPassword = null;
      else this.newRoomUsers = [];
    },
    switchVisibility() {
      if (this.passwordFieldType == "password") this.passwordFieldType = "text";
      else this.passwordFieldType = "password";
    },
  },
};
</script>

<template>
  <div class="box">
    <h1>Create new Room</h1>
    <div>
      <input type="text" v-model="newRoomName" v-on:keyup.enter="createRooms" placeholder="Room Name" />
      <button
        @click="toggleStatus"
        :class="[
          isPublic ? 'room-settings on-colors' : 'room-settings off-colors',
        ]"
      >
        Public
      </button>
      <button
        @click="toggleStatus"
        :class="[
          !isPublic ? 'room-settings on-colors' : 'room-settings off-colors',
        ]"
      >
        Private
      </button>
      <div v-if="!isPublic">
        <div>
          <input type="text" v-model="newRoomUser" v-on:keyup.enter="newUser" placeholder="Room Users" />
          <button class="add-user" @click="newUser">Add user</button>
        </div>
        <li v-for="user in newRoomUsers" :key="user.username">
          {{ user.username }}
          <button class="add-user" @click="removeUser(user)">
            Remove user
          </button>
        </li>
        <p v-if="newRoomUserShowError" class="error-paragraf">
          {{ this.newRoomError }}
        </p>
      </div>

      <div v-if="isPublic">
        <br />
        You may add a password to protect this public room (leave empty for no
        password) :
        <br />
        <input
          :type="passwordFieldType"
          v-model="newRoomPassword"
          placeholder="Password"
          v-on:keyup.enter="createRooms" 
        />
        <button class="add-user" @click="switchVisibility">
          {{ passwordFieldType == "password" ? "SHOW" : "HIDE" }}
        </button>
      </div>
      <div v-else>
        <br />
        This room will be private (only you and added users can see it).
        <br />
        <span class="bold-red"> You won't be able to add users after creation. </span>
      </div>
      <button class="submit-new-room new-room-button" @click="createRooms">
        Create {{ newRoomName }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.error-paragraf {
  color: red;
}

input {
  color: #703ab8;
  border: 3px solid #703ab8;
  padding: 10px;
  border-radius: 13px;
  font-weight: bold;
  font-size: 16px;
}

.box {
  /* background-color: white; */
  border: none;
  font-weight: bold;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 3px;
  padding: 15px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-top: 10px;
  margin: 10px;
  /* border: 2px solid #703ab8; */
}

.new-room-button {
  border: none;
  border-radius: 13px;
  padding: 6px 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-top: 10px;
  margin-bottom: 10px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}


.bold-red {
  color: darkred;
  font-weight: bold;
}

.submit-new-room {
  background-color: #703ab8;
  margin-bottom: 0px;
  color: white;
  font-weight: bold;
}

.submit-new-room:hover {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  background-color: white;
  color: #703ab8;
}

.room-settings {
  border: 2px solid #703ab8;
  border-radius: 3px;
  padding: 6px 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin: 10px;
  margin-right: 0;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.off-colors {
  background-color: white;
  color: black;
}
.on-colors {
  background-color: #703ab8;
  color: white;
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

.submit-new-room {
  width: 100%;
  border-radius: 3px;
  font-size: 18px;
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

.add-user:hover {
  background-color: #703ab8;
  color: white;
}
</style>
