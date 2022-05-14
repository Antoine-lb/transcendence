
<script lang="ts">
import TheGame from "@/components/TheGame.vue";
import { useUserStore } from "../stores/userStore";

export default {
  name: "Game",
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },
  components: {
    TheGame,
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
      <div v-if="isLogged()" class="form-group">
        <TheGame :user="userStore.user" :socket="userStore.socket"/>
      </div>
      <div v-else class="form-group">
        <p>Vous devez être connecté pour voir le jeu.</p>
      </div>
    </div>
  </main>
</template>

