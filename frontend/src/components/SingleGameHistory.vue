<script lang="ts">
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
  name: "SingleGameHistory",

  props: {
    winnerId: Number,
    loserId: Number,
    gameId: Number,

    score: Number,
  },
  data() {
    return {
      loading: false,
      winner: null,
      winnerAvatar: null,
      loser: null,
      loserAvatar: null,
    };
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
      if (!this.winnerId || !this.loserId)
       {
        this.loading = false;
        return;
       }
      try {
        let response = await fetchWithHeaders(
          `http://127.0.0.1:3000/api/users/${this.winnerId}`
        );
        if (response.status == 200) {
          this.winner = await response.json();
          if (this.winner)
            this.winnerAvatar = "http://localhost:3000" + this.winner.avatar;
        }

        response = await fetchWithHeaders(
          `http://127.0.0.1:3000/api/users/${this.loserId}`
        );
        if (response.status == 200) {
          this.loser = await response.json();
          if (this.loser)
            this.loserAvatar = "http://localhost:3000" + this.loser.avatar;
        }
      } catch (error) {
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
    <div v-if="!loading && winner && loser" class="container">
      <div class="player-profile">
        <a class="username" :href="'/user/' + winnerId">
          <div
            v-bind:style="{
              backgroundImage:
                'url(' +
                winnerAvatar +
                '), linear-gradient(to bottom right, #8141d4, #9268c9, #9a82ba)',
            }"
            class="profile-image"
          />
          <p class="player-name">{{ winner.username }}</p>
        </a>
      </div>
      <span style="font-size: 35px">5 - {{ score }}</span>
      <div class="player-profile">
        <a class="username" :href="'/user/' + loserId">
          <div
            v-bind:style="{
              backgroundImage:
                'url(' +
                loserAvatar +
                '), linear-gradient(to bottom right, #8141d4, #9268c9, #9a82ba)',
            }"
            class="profile-image"
          />
          <p class="player-name">{{ loser.username }}</p>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Pacifico&display=swap");

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 350px;
  margin: auto;
}

.player-name {
  z-index: 30;
  text-transform: capitalize;
  text-align: center;
  color: #703ab8;
  font-size: 30px;
  font-family: "Pacifico", cursive;
  margin-top: -30px;
  text-shadow: 0 0 6px rgba(120, 61, 204, 0.92),
    0 0 30px rgba(94, 14, 206, 0.34), 0 0 12px rgba(211, 193, 236, 0.52),
    0 0 21px rgba(211, 193, 236, 0.92), 0 0 34px rgba(211, 193, 236, 0.78),
    0 0 54px rgba(211, 193, 236, 0.92); /* box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23); */
}

.profile-image {
  z-index: 30;
  flex-shrink: 0;
  margin: auto;
  height: calc(85px);
  width: calc(85px);
  border: calc(4px) solid transparent;
  background-origin: border-box;
  background-clip: content-box, border-box;
  background-size: cover;
  box-sizing: border-box;
  box-shadow: 0 0 6px rgba(120, 61, 204, 0.92), 0 0 30px rgba(94, 14, 206, 0.34),
    0 0 12px rgba(211, 193, 236, 0.52), 0 0 21px rgba(211, 193, 236, 0.92),
    0 0 34px rgba(211, 193, 236, 0.78), 0 0 54px rgba(211, 193, 236, 0.92);
  border-radius: 50%;
  /* background-image: url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=350&h=350&fit=crop&crop=faces'),
              linear-gradient(to bottom right, #8141d4, #9268c9, #9a82ba); */
}

.player-profile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
