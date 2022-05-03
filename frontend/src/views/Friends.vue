<script lang="ts">
import MyFriends from "../components/MyFriends.vue";
import Log from "../components/Log.vue";
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
    Log,
  },
  methods: {
    isLogged() {
      if (this.userStore.isFullyLogged)
        return true;
      else if (this.userStore.isHalfLogged)
        this.$router.push('/log2fa');
      else
        return false;
    }
  }
};

</script>

<template>

  <main>
    <div v-if="userStore.isLoading">Loading...</div>

    <div v-if="!userStore.isLoading">
      <div v-if="isLogged()">
        <MyFriends />
      </div>
      <div v-else>
        <p>Vous devez être connecté pour voir vos amis</p>
        <Log />
      </div>
    </div>
  </main>
</template>

<style>

</style>
