
<script lang="ts">
import PublicAccount from "@/components/PublicAccount.vue";
import PrivateAccount from "@/components/PrivateAccount.vue";
import { useUserStore } from "../stores/userStore";

export default {
  name: "Game",
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },
  components: {
    PublicAccount,
    PrivateAccount,
  },
};
</script>

<template>
  <main>
    <div v-if="userStore.isLoading">Loading...</div>

    <div v-if="!userStore.isLoading">
      <div v-if="userStore.isLogged" class="form-group">
        <PublicAccount :user="userStore.user" :avatar="userStore.avatarUrl" />
        <PrivateAccount />
      </div>
      <div v-if="!userStore.isLogged" class="form-group">
        <p>Vous devez être connecté pour voir votre profil</p>
      </div>
    </div>
  </main>
</template>

