
<script lang="ts">
import PrivateProfile from "@/components/PrivateProfile.vue";
import PublicProfile from "@/components/PublicProfile.vue";
import { useUserStore } from "../stores/userStore";

export default {
  name: "Game",
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },
  components: {
    PrivateProfile,
    PublicProfile,
  },
};
</script>

<template>
  <main>
    <div v-if="userStore.isLoading">Loading...</div>

    <div v-if="!userStore.isLoading">
      <div v-if="userStore.isLogged" class="form-group">
        <PublicProfile
          :username="userStore.user.username"
          :avatarUrl="userStore.avatarUrl"
          :played="userStore.user.played"
          :victory="userStore.user.victory"
          :defeats="userStore.user.defeats"
          :xp="userStore.user.xp"
          :lvl="userStore.user.lvl"
          :id="userStore.user.id"
        />
        <PrivateProfile />
      </div>
      <div v-if="!userStore.isLogged" class="form-group">
        <p>Vous devez être connecté pour voir votre profil</p>
      </div>
    </div>
  </main>
</template>

