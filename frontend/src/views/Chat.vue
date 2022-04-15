
<script lang="ts">
import Chat from "@/components/Chat.vue";
import { useUserStore } from "../stores/userStore";

export default {
  name: "Chat New",
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },
  components: {
    Chat,
  },
};
</script>

<template>
  <main>
    <div v-if="userStore.isLoading">Loading...</div>

    <div v-if="!userStore.isLoading">
      <div v-if="userStore.isLogged" class="form-group">
        <Chat :user="userStore.user" />
      </div>
      <div v-if="!userStore.isLogged" class="form-group">
        <p>Vous devez être connecté pour voir le chat</p>
      </div>
    </div>
  </main>
</template>

