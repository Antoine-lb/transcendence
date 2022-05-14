<script lang="ts">
import { useUserStore } from "../stores/userStore";
import PublicProfile from "@/components/PublicProfile.vue";
import FriendshipManagement from "@/components/FriendshipManagement.vue";
import GamesHistory from "@/components/GamesHistory.vue";

function fetchWithHeaders(url) {
  return fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cache: "no-cache",
    },
    credentials: "include",
  });
}

export default {
  data() {
    return {
      loading: false,
      userNotFound: false,
      user: {},
      userAvatar: null,
    };
  },
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },
  created() {
    this.fetchAllData();
  },
  components: {
    PublicProfile,
    FriendshipManagement,
    GamesHistory
  },
  methods: {
    fetchAllData: function () {
      this.fetchUser();
    },
    fetchUser: async function () {
      this.loading = true;
      try {
        const response = await fetchWithHeaders(
          `http://127.0.0.1:3000/api/users/${this.$route.params.id}`
        );
        if (response.status == 200) {
          this.user = await response.json();
          if (this.user)
            this.userAvatar = "http://localhost:3000" + this.user.avatar;
          this.userNotFound = false;
        } else {
          this.userNotFound = true;
        }
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
    isLogged() {
      if (this.userStore.isFullyLogged) return true;
      else if (this.userStore.isHalfLogged) this.$router.push("/log2fa");
      else return false;
    },
  },
};
</script>

<template>
  <main>
    <div v-if="loading || userStore.isLoading">Loading...</div>
    <div v-if="!loading && !userStore.isLoading">
      <div v-if="isLogged()" class="form-group">
        <div v-if="userNotFound">L'utilisateur est introuvable</div>
        <div v-if="!userNotFound">
          <PublicProfile
            :username="user.username"
            :avatarUrl="this.userAvatar"
            :played="user.played"
            :victory="user.victory"
            :defeats="user.defeats"
            :xp="user.xp"
            :lvl="user.lvl"
            :id="user.id"
            :socket="userStore.socket"
          />
          <br />
          <br />
          <br />
          <FriendshipManagement
            :user="user"
            :socket="userStore.socket"
            :userStore="userStore"
            v-if="this.userStore.user.id !== user.id"
          />
          <br />
          <GamesHistory :userId="user.id" />

        </div>
      </div>
      <div v-else class="form-group">
        <p>Vous devez être connecté pour voir un profil.
        <br>Connectez-vous sur la page Accueil.</p>
      </div>
    </div>
  </main>
</template>
