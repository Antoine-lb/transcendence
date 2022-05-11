<script lang="ts">
import { useUserStore } from "../stores/userStore";

export default {
  data() {
    return {
      loading: false,
      addFriendUsername: ""
    };
  },
    props: {
    socket: Object,
    friendList: Array,
    pendingFriendList: Array,
    blockedFriendList: Array,
    showAddFriendError: String
  },
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  created() {
    // this.fetchAllData();
    this.socket.on("invit", this.invitationRecu);
    this.socket.on("acceptInvit", this.acceptInvit);
  },
  unmounted() {
    this.socket.removeAllListeners();
  },
  methods: {
    refresh: function () {
      this.$router.push('/friends');
    },
    acceptPendingRequest (id) {
      this.$emit("acceptPendingRequest", id);
    },
    removeFriend (id) {
      this.$emit("removeFriend", id);
    },
    blockFriend (id) {
      this.$emit("blockFriend", id);
    },
    unblockFriend (id) {
      this.$emit("unblockFriend", id);
    },
    addFriend () {
      this.$emit("addFriend", this.addFriendUsername);
    },
    getAvatar(user) {
      return "http://localhost:3000" + user.avatar;
    },
    invitationRecu(adversaire, code) {
      if (confirm(adversaire.username + ", vous défie au pong : lancer la partie ?")){
        this.socket.emit('newGame', code);
        this.socket.emit('acceptInvit', adversaire, code);
        this.$router.push("Chat");
      }
      else
        this.socket.emit('declineGameInvit', adversaire);
    },
    
    acceptInvit (roomCode) {
        // await this.startGameAnimation()
        this.socket.emit('joinGame', roomCode);
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
          <a class="username" :href="'/user/' + friend.id">{{
            friend.username
          }}</a>
          <div
            v-bind:style="{
              backgroundImage:
                'url(' +
                getAvatar(friend) +
                '), linear-gradient(to bottom right, #8141d4, #9268c9, #9a82ba)',
            }"
            class="mini-profile-image"
          />
          <div>
            <button class="button" @click="removeFriend(friend.id)">
              Supprimer l'amitié
            </button>
            <button class="button" @click="blockFriend(friend.id)">
              Bloquer
            </button>
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
          <a class="username" :href="'/user/' + pendingReq.users_id">{{
            pendingReq.users_username
          }}</a>
          <p v-if="pendingReq.f_creatorId === userStore.user.id">
            <i>en attente de réponse...</i>
          </p>
          <button
            class="button"
            v-if="pendingReq.f_creatorId !== userStore.user.id"
            @click="acceptPendingRequest(pendingReq.f_creatorId)"
          >
            Ajouter ami
          </button>
        </div>
      </div>

      <h1>Amis bloqués</h1>
      <div>
        <p v-if="!blockedFriendList.length">
          Vous n'avez pas de demandes d'amis bloqués
        </p>
        <div
          class="request"
          v-for="blockedFriend in blockedFriendList"
          v-bind:key="blockedFriend.username"
        >
          <a class="username" :href="'/user/' + blockedFriend.id">{{
            blockedFriend.username
          }}</a>
          <button
            class="button"
            @click="unblockFriend(blockedFriend.id)"
          >
            Débloquer
          </button>
        </div>
      </div>

      <h1>Ajouter un ami</h1>
      <p v-if="showAddFriendError" class="bold-red" style="margin-bottom: 10px">
        {{ showAddFriendError }}
      </p>
      <form @submit.prevent="addFriend">
        <input
          class="input-username"
          type="text"
          v-model="addFriendUsername"
          placeholder="Username"
        />
        <input class="button" type="submit" value="Ajouter" />
      </form>
    </div>
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

.mini-profile-image {
  z-index: 30;
  flex-shrink: 0;
  margin: auto;
  height: calc(20px + 6vw);
  width: calc(20px + 6vw);
  /* border: calc(1px + 0.2vw) solid transparent; */
  background-origin: border-box;
  background-clip: content-box, border-box;
  background-size: cover;
  box-sizing: border-box;
  box-shadow: 0 0 6px rgba(120, 61, 204, 0.92);
  border-radius: 20% 20%;
}

.username {
  text-transform: capitalize;
  font-weight: bold;
  color: #703ab8;
}


.bold-red {
  color: darkred;
  font-weight: bold;
}


.button {
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
.button:hover {
  background-color: white;
  color: #703ab8;
}

h1 {
  margin-top: 40px;
}

.input-username {
  color: #703ab8;
  border: 3px solid #703ab8;
  padding: 10px;
  border-radius: 13px;
  font-weight: bold;
  font-size: 18px;
}
</style>


