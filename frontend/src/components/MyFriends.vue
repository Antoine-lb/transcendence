<script lang="ts">
import { useUserStore } from "../stores/userStore";

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
  data() {
    return {
      loading: false,
      friendList: [],
      pendingFriendList: [],
      addFriendUsername: "",
    };
  },
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  created() {
    this.fetchFriends();
    this.fetchPendingFriends();
  },
  methods: {
    fetchFriends: async function () {
      this.loading = true;
      try {
        const response = await fetchWithHeaders(
          "http://127.0.0.1:3000/api/friends"
        );
        if (response.status == 200) {
          this.friendList = await response.json();
        }
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
    fetchPendingFriends: async function () {
      this.loading = true;
      try {
        const response = await fetchWithHeaders(
          "http://127.0.0.1:3000/api/friends/requests"
        );
        if (response.status == 200) {
          this.pendingFriendList = await response.json();
          console.log("this.pendingFriendList", this.pendingFriendList);
        }
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
    acceptPendingRequest: async function (id) {
      this.loading = true;
      try {
        const response = await fetchWithHeaders(
          `http://127.0.0.1:3000/api/friends/update/${id}`
        );
        if (response.status == 200) {
          this.fetchFriends();
          this.fetchPendingFriends();
        }
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
    removeFriend: async function (id) {
      this.loading = true;
      try {
        const response = await fetchWithHeaders(
          `http://127.0.0.1:3000/api/friends/remove/${id}`
        );
        if (response.status == 200) {
          this.fetchFriends();
          this.fetchPendingFriends();
        }
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
    blockFriend: async function (id) {
      this.loading = true;
      try {
        const response = await fetchWithHeaders(
          `http://127.0.0.1:3000/api/friends/block/${id}`
        );
        if (response.status == 200) {
          this.fetchFriends();
          this.fetchPendingFriends();
        }
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
    addFriend: async function () {
      this.loading = true;
      try {
        const response = await fetchWithHeaders(
          `http://127.0.0.1:3000/api/friends/add/${this.addFriendUsername}`
        );
        if (response.status == 200) {
          this.fetchFriends();
          this.fetchPendingFriends();
        }
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
  },
};
</script>

<template>
  <main>
    <div v-if="loading">Loading...</div>
    <div v-if="!loading">
      <h1>Amis</h1>

      <div>
        <p v-if="!friendList.length">Vous n'avez pas d'amis</p>
        <div
          class="request"
          v-for="friend in friendList"
          v-bind:key="friend.username"
        >
          <p class="username">{{ friend.username }}</p>
          <div>
            <button v-on:click="() => removeFriend(friend.id)">
              Supprimer l'amitié
            </button>
            <button v-on:click="() => blockFriend(friend.id)">Bloquer</button>
          </div>
        </div>
      </div>

      <h1>Demandes d'amis en attente</h1>
      <div>
        <p v-if="!pendingFriendList.length">
          Vous n'avez pas de demandes d'amis en attente
        </p>
        <div
          class="request"
          v-for="pendingReq in pendingFriendList"
          v-bind:key="pendingReq.users_username"
        >
          <p class="username">{{ pendingReq.users_username }}</p>
          <p v-if="pendingReq.f_creatorId === userStore.user.id">
            <i>en attente de réponse...</i>
          </p>
          <button
            v-if="pendingReq.f_creatorId !== userStore.user.id"
            v-on:click="() => acceptPendingRequest(pendingReq.f_creatorId)"
          >
            Ajouter ami
          </button>
        </div>
      </div>
    </div>

    <h1>Ajouter un ami</h1>
    <form @submit.prevent="addFriend">
      <input type="text" v-model="addFriendUsername" placeholder="username" />
      <input type="submit" value="Submit" />
    </form>

    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <h1>Server response (dev only)</h1>
    <pre>
<code>
<h3>/api/friends</h3>
{{ friendList }}
</code>
<hr/>
<code>
<h3>/api/friends/requests</h3>
{{ pendingFriendList }}
</code>
<hr/>

<code>
<h3>/api/user/me</h3>
{{ userStore }}
</code>
    </pre>
  </main>
</template>

<style scoped>
.request {
  padding: 10px 20px;
  border: 3px solid #703ab8;
  border-radius: 13px;

  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.username {
  text-transform: capitalize;
  font-weight: bold;
  color: #703ab8;
}

button {
  background-color: #703ab8;
  border: none;
  color: white;
  font-weight: bold;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 13px;
  padding: 6px 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-left: 10px;
}
button:hover {
  background-color: white;
  color: #703ab8;
}

h1 {
  margin-top: 40px;
}
</style>


