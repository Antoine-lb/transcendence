<script lang="ts">
import { useUserStore } from "../stores/userStore";

export interface newRoomInterface {
  name: string;
  users: [{ id: number }];
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
  name: "ChatNewRoom",
  data() {
    return {
      userStore: useUserStore(),
      newRoomName: null,
      newRoomUser: null,
      newRoomUserShowError: false,
      newRoomUsers: [],
      allUsers: [],
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
          console.log("{ id: element.id }", { id: element.id });
          this.newRoomUsers.push(element);
          this.newRoomUser = "";
          valid = true;
        }
      });

      if (!valid) {
        this.newRoomUserShowError = true;
      }
    },
    createRooms() {
      let room: newRoomInterface = {
        name: this.newRoomName ? this.newRoomName : "No Name",
        users: this.newRoomUsers,
      };

      this.$emit("onSubmit", room);
    },
  },
};
</script>

<template>
  <div class="container">
    <h1>Créer un salon</h1>
    <div>
      <input type="text" v-model="newRoomName" placeholder="Room Name" />
      <li v-for="user in newRoomUsers" :key="user.username">
        {{ user.username }}
      </li>
      <div>
        <input type="text" v-model="newRoomUser" placeholder="Room Users" />
        <button class="add-user" @click="newUser">Add user</button>
      </div>
      <p v-if="newRoomUserShowError" class="error-paragraf">
        Username not found
      </p>
      <!-- <input class="button" type="submit" value="Ajouter" /> -->
      <button class="submit-new-room" @click="createRooms">
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
  font-size: 18px;
}

.submit-new-room {
  background-color: #703ab8;
  border: none;
  color: white;
  font-weight: bold;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 13px;
  padding: 6px 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-top: 10px;
  /* display: block; */
}
.submit-new-room:hover {
  background-color: white;
  color: #703ab8;
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
