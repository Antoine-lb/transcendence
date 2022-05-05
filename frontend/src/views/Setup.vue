
<script lang="ts">
import PrivateProfile from "@/components/PrivateProfile.vue";
import PublicProfile from "@/components/PublicProfile.vue";
import Log from "@/components/Log.vue";
import { useUserStore } from "../stores/userStore";

export default {
  name: "Setup",
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },
  components: {
    PrivateProfile,
    PublicProfile,
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
    <h1>Welcome</h1>
    <div>You can setup some settings</div>
    <div v-if="userStore.isLoading">Loading...</div>

    <div v-if="!userStore.isLoading">
      <div v-if="isLogged()" class="form-group">
        <!-- <PublicProfile
          :username="userStore.user.username"
          :avatarUrl="userStore.avatarUrl"
          :played="userStore.user.played"
          :victory="userStore.user.victory"
          :defeats="userStore.user.defeats"
          :xp="userStore.user.xp"
          :lvl="userStore.user.lvl"
          :id="userStore.user.id"
        /> -->
        <PrivateProfile 
        :socket="userStore.socket"/>
      </div>
      <div v-else class="form-group">
        <p>Vous devez être connecté pour modifier votre profil</p>
      </div>
    </div>
  </main>
</template>

