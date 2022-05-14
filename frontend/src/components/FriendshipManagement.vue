<script lang="ts">
export interface UserI {
  id: number;
  username: string;
  avatar: string;
  isTwoFA: boolean;
  secret?: string;
  isOnline: number;
}

function fetchWithHeaders(url: string) {
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
      blockedFriendList: [],
      addFriendUsername: "",
      onlineStatus: 0,
    };
  },
  props: {
    user: {
      type: Object as () => UserI,
    },
    socket: Object,
    userStore: Object,
  },
  created() {
    this.fetchAllData();
    this.askForStatus();
    this.socket.on("status", this.changeStatus);
  },
  methods: {
    changeStatus(status, userId) {
      if (userId == this.user.id) this.onlineStatus = status;
    },
    askForStatus() {
      this.socket.emit("getStatus", this.user.id);
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
          this.fetchAllData();
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
          this.fetchAllData();
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
          this.fetchAllData();
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
          this.fetchAllData();
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
          `http://127.0.0.1:3000/api/friends/add/${this.user.username}`
        );
        if (response.status == 200) {
          this.fetchAllData();
        }
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
    isFriend() {
      for (var f of this.friendList) {
        if (f.id == this.user.id) return true;
      }
      return false;
    },
    isPendingSent() {
      for (var f of this.pendingFriendList) {
        if (
          f.f_creatorId == this.userStore.user.id &&
          f.f_receiverId == this.user.id
        )
          return true;
      }
      return false;
    },
    isPendingReceived() {
      for (var f of this.pendingFriendList) {
        if (
          f.f_creatorId == this.user.id &&
          f.f_receiverId == this.userStore.user.id
        )
          return true;
      }
      return false;
    },
    isBlocked() {
      for (var f of this.blockedFriendList) {
        if (f.id == this.user.id) return true;
      }
      return false;
    },
    getFriendshipStatus() {
      if (this.isFriend()) return "";
      if (this.isPendingSent())
        return "You have sent a friend request to " + this.user.username + ".";
      if (this.isPendingReceived())
        return this.user.username + " sent you a friend request.";
      if (this.isBlocked())
        return "You have blocked " + this.user.username + ".";
      else return "You and " + this.user.username + " are not friends.";
    },
  },
};
</script>

<template>
  <div style="display: flex; flex-direction: column; font-size: 20px;">
    <!-- <p> loading => {{ this.loading }} </p>
      <p> friendList => {{ this.friendList }} </p>
      <p> pendingFriendList => {{ this.pendingFriendList }} </p>
      <p> blockedFriendList => {{ this.blockedFriendList }} </p>
      <p> addFriendUsername => {{ this.addFriendUsername }} </p> -->
    <p
      class="txt"
      style="font-size: x-large; text-transform: capitalize"
      v-if="isFriend()"
    >
      <!-- {{ user.username }} is {{ this.onlineStatus }} -->
      <span v-if="this.onlineStatus == 0">{{ user.username }} is offline 🔘​ </span>
      <span v-if="this.onlineStatus == 1">{{ user.username }} is online 🟢​ ​</span>
      <span v-if="this.onlineStatus == 2">{{ user.username }} is playing 👾 </span>
    </p>
    <p class="txt">{{ getFriendshipStatus() }}</p>
    <button
      v-if="!isFriend() && !isPendingSent() && !isPendingReceived() && !isBlocked()"
      class="pwd-btn on-colors"
      @click="addFriend()"
    >
      ADD {{ this.user.username }} AS FRIENDS
    </button>
    <button
      v-if="isFriend()"
      class="pwd-btn on-colors"
      @click="removeFriend(this.user.id)"
    >
      REMOVE {{ this.user.username }} FROM FRIENDS
    </button>
    <button
      v-if="isPendingReceived()"
      class="pwd-btn on-colors"
      @click="acceptPendingRequest(this.user.id)"
    >
      ACCEPT PENDING REQUEST
    </button>
    <div v-if="isPendingSent()" class="no-btn">
      ...WAITING FOR {{ this.user.username }} APPROVAL...
    </div>
  </div>
</template>

<style scoped>
.pwd-btn {
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
  margin: 10px;
  border: 2px solid #703ab8;
  text-transform: uppercase;
}

.no-btn {
  background-color: white;
  border: none;
  color: #703ab8;
  font-weight: bold;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 3px;
  padding: 6px 15px;
  /* cursor: pointer; */
  /* transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); */
  margin-top: 10px;
  margin: 10px;
  border: 2px solid #703ab8;
  width: fit-content;
  text-transform: uppercase;
}

.on-colors {
  background-color: #703ab8;
  color: white;
}

.txt {
  /* text-transform: capitalize; */
}
</style>
