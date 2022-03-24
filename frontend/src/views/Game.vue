
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
};
</script>

<template>
  <main>
    <div v-if="userStore.isLoading">Loading...</div>

    <div v-if="!userStore.isLoading">
      <div v-if="userStore.isLogged" class="form-group">
        <TheGame :user="userStore.user" />
      </div>
      <div v-if="!userStore.isLogged" class="form-group">
        <p>Vous devez être connecté pour voir le Game</p>
      </div>
    </div>
  </main>
</template>

