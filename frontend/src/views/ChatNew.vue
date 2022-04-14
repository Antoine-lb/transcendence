
<script lang="ts">
import ChatNew from "@/components/ChatNew.vue";
import { useUserStore } from "../stores/userStore";

export default {
  name: "Game",
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },
  components: {
    ChatNew,
  },
};
</script>

<template>
  <main>
    <div v-if="userStore.isLoading">Loading...</div>

    <div v-if="!userStore.isLoading">
      <div v-if="userStore.isLogged" class="form-group">
        <ChatNew :user="userStore.user" />
      </div>
      <div v-if="!userStore.isLogged" class="form-group">
        <p>Vous devez être connecté pour voir le chat</p>
      </div>
    </div>
  </main>
</template>

