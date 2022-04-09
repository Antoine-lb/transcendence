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
      let valid = false;
      this.newRoomUserShowError = false;
      this.allUsers.map((element) => {
        if (element.username === this.newRoomUser) {
          console.log("add user { id: element.id }", { id: element.id }, element.username);
          this.newRoomUsers.push(element);
          this.newRoomUser = "";
          valid = true;
        }
      });
      if (!valid) {
        this.newRoomUserShowError = true;
      }
    },
    removeUser(user) {
      this.allUsers.map((element) => {
        if (element.username === user.username) {
          console.log("remove user { id: element.id }", { id: element.id }, element.username);
          this.newRoomUsers.splice(this.newRoomUsers.indexOf(user), 1);
        }
      });
    },
    createRooms() {
      let room: newRoomInterface = {
        name: this.newRoomName ? this.newRoomName : "No Name",
        users: this.newRoomUsers,
        status: this.isPublic ? true : false,
        protected: this.newRoomPassword ? true : false,
        password: !this.isPublic ? false : (this.newRoomPassword ? this.newRoomPassword : null),
      };
      this.$emit("onSubmit", room);
    },
    toggleStatus() {
      this.isPublic = !this.isPublic;
      if (!this.isPublic)
        this.newRoomPassword = null;
      else
        this.newRoomUsers = [];
    },
    switchVisibility() {
      if (this.passwordFieldType == 'password')
        this.passwordFieldType = 'text'
      else
        this.passwordFieldType = 'password'
    }
  },
};
</script>

<template>
  <div class="container">
    <h1>Créer un salon xx</h1>
    <div>
      <input type="text" v-model="newRoomName" placeholder="Room Name" />
      <div v-if="!isPublic">
        <div>
          <input type="text" v-model="newRoomUser" placeholder="Room Users" />
          <button class="add-user" @click="newUser">Add user</button>
        </div>
        <li v-for="user in newRoomUsers" :key="user.username">
          {{ user.username }}
          <button class="add-user" @click="removeUser(user)">Remove user</button>
        </li>
        <p v-if="newRoomUserShowError" class="error-paragraf">
          Username not found
        </p>
      </div>
      <div>
        <button @click="toggleStatus" :class="[isPublic ? 'new-room-button on-colors' : 'new-room-button off-colors']">Public</button>
        <button @click="toggleStatus" :class="[!isPublic ?'new-room-button on-colors' : 'new-room-button off-colors']">Private</button>
      </div>
      <div v-if="isPublic">
        You may add a password to protect this public room :
          <input :type="passwordFieldType" v-model="newRoomPassword" placeholder="Password" />
          <button class="add-user" @click="switchVisibility">{{passwordFieldType == "password" ? 'SHOW' : 'HIDE'}}</button>
      </div>
      <div v-else>
        This room will be private (only you and added users can see it).
      </div>
      <button class="submit-new-room new-room-button" @click="createRooms">
        Créer {{ newRoomName }}
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

.off-colors {
  background-color: lightgray;
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
