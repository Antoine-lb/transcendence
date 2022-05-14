<script lang="ts">
import { useUserStore } from "../stores/userStore";
import TheWelcome from "@/components/TheWelcome.vue";
import PublicProfile from "@/components/PublicProfile.vue";
import GamesHistory from "@/components/GamesHistory.vue";

export default {
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },
  components: {
    TheWelcome,
    PublicProfile,
    GamesHistory
  },
  methods: {
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
    <div v-if="userStore.isLoading">Loading...</div>
    <div v-if="!userStore.isLoading">
      <form v-if="isLogged()" class="form-group">
        <PublicProfile
          :username="userStore.user.username"
          :avatarUrl="userStore.avatarUrl"
          :played="userStore.user.played"
          :victory="userStore.user.victory"
          :defeats="userStore.user.defeats"
          :xp="userStore.user.xp"
          :lvl="userStore.user.lvl"
          :id="userStore.user.id"
          :socket="userStore.socket"
        />
        <GamesHistory :userId="userStore.user.id" />
      </form>
      <div v-else>
        <TheWelcome />
      </div>
    </div>
  </main>
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

.login-container {
  padding-top: 50px;
  display: flex;
}

/* POUR LA TICK BOX */
input[type="checkbox"] {
  height: 0;
  width: 0;
  visibility: hidden;
}

label {
  cursor: pointer;
  /* text-indent: -9999px; */
  text-indent: 115px;
  /* width: 200px; origin */
  width: 20%;
  /* height: 100px; origin */
  /* height: 20%; */
  background: grey;
  /* display: block; */
  border-radius: 100px;
  position: relative;
}

label:after {
  content: "";
  position: absolute;
  top: 5px;
  left: 5px;
  /* width: 90px; origin */
  width: 35%;
  /* height: 90px; origin */
  height: 60%;
  background: #fff;
  border-radius: 90px;
  transition: 0.3s;
}

input:checked + label {
  background: #bada55;
}

input:checked + label:after {
  left: calc(100% - 5px);
  transform: translateX(-100%);
}

label:active:after {
  /* width: 130px; origin */
  width: 5%;
}

/*  centering */
</style>
