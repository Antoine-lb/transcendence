<script lang="ts">
import { useUserStore } from "../stores/userStore";
import PublicAccount from "@/components/PublicAccount.vue";

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
    return { userStore };
  },
  created() {
    this.fetchAllData();
  },
  components: {
    PublicAccount,
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
          console.log("this.user", this.user);
          if (this.user)
            this.userAvatar = "http://localhost:3000" + this.user.avatar
          this.userNotFound = false;
        } else {
          this.userNotFound = true;
          console.log("user not found");
        }
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
  },
};
</script>

<template>
  <main>
    <div v-if="loading">Loading...</div>
    <div v-if="!loading">
      <div v-if="userNotFound">L'utilisateur est introuvable</div>
      <div v-if="!userNotFound">
        <PublicAccount :user="user" :avatar="this.userAvatar" />
      </div>
    </div>
  </main>
</template>
