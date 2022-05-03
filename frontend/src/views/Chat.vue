
<script lang="ts">
import Chat from "@/components/Chat.vue";
import Log from "@/components/Log.vue";
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
  <div>
    <div v-if="userStore.isLoading">Loading...</div>
    <div v-if="!userStore.isLoading">
      <div v-if="isLogged()" class="form-group">
        <Chat :user="userStore.user" />
      </div>

      <div v-else class="form-group">
        <p>Vous devez être connecté pour voir le chat</p>
        <Log />
      </div>
    </div>
  </div>
</template>

