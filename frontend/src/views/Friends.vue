<script lang="ts">
import MyFriends from "../components/MyFriends.vue";
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
  name: "Friends",
  data() {
    return {
      count: 0,
      friends: [],
      friendList: [],
      pendingFriendList: [],
      blockedFriendList: [],
      showAddFriendError: "",
    };
  },
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },
  components : {
    MyFriends,
  },
  created() {
    this.fetchAllData();
  },
  methods: {
    refresh: function () {
      this.$router.go('/friends');
    },
    isLogged() {
      if (this.userStore.isFullyLogged)
        return true;
      else if (this.userStore.isHalfLogged)
        this.$router.push('/log2fa');
      else
        return false;
    },
    fetchAllData: function () {
      this.fetchFriends();
      this.fetchPendingFriends();
      this.fetchBlockedFriends();
    },
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
        }
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
    fetchBlockedFriends: async function () {
      this.loading = true;
      try {
        const response = await fetchWithHeaders(
          "http://127.0.0.1:3000/api/friends/blocked"
        );
        if (response.status == 200) {
          this.blockedFriendList = await response.json();
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
          this.refresh();
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
          this.refresh();
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
          this.refresh();
        }
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
    unblockFriend: async function (id) {
      this.loading = true;
      try {
        const response = await fetchWithHeaders(
          `http://127.0.0.1:3000/api/friends/unblock/${id}`
        );
        if (response.status == 200) {
          this.refresh();
        }
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
    addFriend: async function (username) {
      this.loading = true;
      if (this.userStore.user.username === username) {
        this.showAddFriendError = "Cannot add yourself";
        this.loading = false;
        return;
      }
      try {
        const response = await fetchWithHeaders(
          `http://127.0.0.1:3000/api/friends/add/${username}`
        );
        if (response.status == 200) {
          this.refresh();
          this.showAddFriendError = "";
        } else {
          this.showAddFriendError = "User not found";
        }
      } catch (error) {
        console.error(error);
        this.showAddFriendError = "User not found";
      }
      this.loading = false;
    },
  }
};

</script>

<template>

  <main>
    <div v-if="userStore.isLoading">Loading...</div>

    <div v-if="!userStore.isLoading">
      <div v-if="isLogged()">
        <MyFriends
          :friendList="friendList"
          :pendingFriendList="pendingFriendList"
          :blockedFriendList="blockedFriendList"
          :showAddFriendError="showAddFriendError"
          :socket="userStore.socket"
          @blockFriend="blockFriend"
          @unblockFriend="unblockFriend"
          @acceptPendingRequest="acceptPendingRequest"
          @removeFriend="removeFriend"
          @addFriend="addFriend"
        />
      </div>
      <div v-else>
        <p>Vous devez être connecté pour voir vos amis.</p>
      </div>
    </div>
  </main>
</template>

<style>

</style>
