<script lang="ts">
import { useUserStore } from "../stores/userStore";

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
    };
  },
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  created() {
    this.fetchAllData();
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
        <h1 style="text-transform: capitalize">{{ user.username }}</h1>
        <p>Is Online: {{ user.isOnline }}</p>
        <p>Played: {{ user.played }}</p>
        <p>Victories: {{ user.victory }}</p>
        <p>Defeats: {{ user.defeats }}</p>
      </div>
    </div>
  </main>
</template>
