
<script lang="ts">
import PrivateProfile from "@/components/PrivateProfile.vue";
import PublicProfile from "@/components/PublicProfile.vue";
import { useUserStore } from "../stores/userStore";

export default {
  name: "Settings",
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },
  components: {
    PrivateProfile,
    PublicProfile,
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
        <PrivateProfile 
        :socket="userStore.socket"/>
      </div>
      <div v-else class="form-group">
        <p>Vous devez être connecté pour modifier votre profil.</p>
      </div>
    </div>
  </main>
</template>

