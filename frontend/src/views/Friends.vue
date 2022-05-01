<script lang="ts">
import MyFriends from "../components/MyFriends.vue";
import { useUserStore } from "../stores/userStore";

export default {
  name: "Friends",
  data() {
    return { count: 0, friends: [] };
  },
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();

    return { userStore };
  },
  components : {
    MyFriends,
  }
};

</script>

<template>

  <main>
    <div v-if="userStore.isLoading">Loading...</div>

    <div v-if="!userStore.isLoading">
      <div v-if="userStore.isLogged">
        <MyFriends :socket="userStore.socket" />
      </div>
      <div v-if="!userStore.isLogged">
        <p>Vous devez être connecté pour voir vos amis</p>
      </div>
    </div>
  </main>
</template>

<style>

</style>
