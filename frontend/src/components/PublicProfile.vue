<script lang="ts">

export default {
  props: {
    username: String,
    avatarUrl: String,
    played: Number,
    victory: Number,
    defeats: Number,
    xp: Number,
    lvl: Number,
    id: Number,
  },
};
</script>

<template>
  <div>
    <h1 class="name-title" :title="id">
      {{ username }}
    </h1>
    <div
      v-bind:style="{
        backgroundImage:
          'url(' +
          avatarUrl +
          '), linear-gradient(to bottom right, #8141d4, #9268c9, #9a82ba)',
      }"
      class="profile-image"
    />
    <div class="stats">
      <p>🎮 Level {{ lvl }} ({{ xp }} XP)</p>
      <p>👾 Played - {{ played }}</p>
      <p>🏆 Victory - {{ victory }}</p>
      <p>💩 Defeats - {{ defeats }}</p>
    </div>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Pacifico&display=swap");

.stats {
  background-color: rgba(120, 61, 204, 0.2);
  backdrop-filter: blur(5px);
  text-align: center;
  font-size: 30px;
  padding-top: 50px;
  padding-bottom: 20px;
  margin-top: -30px;
  border-radius: 50px;
  box-shadow: 0 0 6px rgba(213, 183, 255, 0.2),
    0 0 30px rgba(219, 202, 243, 0.34), 0 0 12px rgba(211, 193, 236, 0.52),
    0 0 21px rgba(211, 193, 236, 0.92), 0 0 34px rgba(211, 193, 236, 0.78),
    0 0 54px rgba(211, 193, 236, 0.92);
}

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

.name-title {
  font-size: 80px;
  text-transform: capitalize;
  text-align: center;
  color: #703ab8;
  font-family: "Pacifico", cursive;
  text-shadow: 0 0 6px rgba(120, 61, 204, 0.92),
    0 0 30px rgba(94, 14, 206, 0.34), 0 0 12px rgba(211, 193, 236, 0.52),
    0 0 21px rgba(211, 193, 236, 0.92), 0 0 34px rgba(211, 193, 236, 0.78),
    0 0 54px rgba(211, 193, 236, 0.92); /* box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23); */
}
</style>
