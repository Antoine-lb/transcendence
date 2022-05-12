<script lang="ts">
import SingleGameHistory from "./SingleGameHistory.vue";

function fetchWithHeaders(url: string) {
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
  name: "GamesHistory",

  props: {
    userId: Number,
  },
  components: {
    SingleGameHistory,
  },
  data() {
    return {
      loading: false,
      history: null,
    };
  },
  created() {
    this.fetchAllData();
  },
  // components: {
  //   PublicProfile,
  //   FriendshipManagement,
  // },
  methods: {
    fetchAllData: function () {
      this.fetchUser();
    },
    fetchUser: async function () {
      this.loading = true;
      try {
        const responseHistory = await fetchWithHeaders(
          `http://127.0.0.1:3000/api/history/${this.userId}`
        );
        if (responseHistory.status == 200) {
          const tmp = await responseHistory.json();
          this.history = tmp.items;
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
  <div>
    <div v-if="loading">
      <p>is loading...</p>
    </div>
    <div v-if="!loading">
      <h2 class="custom-title" v-if="history.length">Match History</h2>
      <div v-for="game in history" :key="game.id">
        <div v-if="game.winnerId">
          <SingleGameHistory
            :winnerId="game.winnerId"
            :loserId="game.loserId"
            :gameId="game.id"
            :score="game.score"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Send+Flowers&display=swap");

.profile-image {
  z-index: 30;
  flex-shrink: 0;
  margin: auto;
  height: calc(150px + 6vw);
  width: calc(150px + 6vw);
  border: calc(8px + 0.2vw) solid transparent;
  background-origin: border-box;
  background-clip: content-box, border-box;
  background-size: cover;
  box-sizing: border-box;
  box-shadow: 0 0 6px rgba(120, 61, 204, 0.92), 0 0 30px rgba(94, 14, 206, 0.34),
    0 0 12px rgba(211, 193, 236, 0.52), 0 0 21px rgba(211, 193, 236, 0.92),
    0 0 34px rgba(211, 193, 236, 0.78), 0 0 54px rgba(211, 193, 236, 0.92);
  border-radius: 50% 10%;
  /* background-image: url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=350&h=350&fit=crop&crop=faces'),
              linear-gradient(to bottom right, #8141d4, #9268c9, #9a82ba); */
}

.custom-title {
  font-size: 80px;
  text-transform: capitalize;
  text-align: center;
  color: #703ab8;
  font-family: "Send Flowers", cursive;
  text-shadow: 0 0 6px rgba(120, 61, 204, 0.92),
    0 0 30px rgba(94, 14, 206, 0.34), 0 0 12px rgba(211, 193, 236, 0.52),
    0 0 21px rgba(211, 193, 236, 0.92), 0 0 34px rgba(211, 193, 236, 0.78),
    0 0 54px rgba(211, 193, 236, 0.92); /* box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23); */
}
</style>
