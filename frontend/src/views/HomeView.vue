<script lang="ts">
import { useUserStore } from "../stores/userStore";
import TheWelcome from "@/components/TheWelcome.vue";
import PublicProfile from "@/components/PublicProfile.vue";

export default {
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },

  components: {
    TheWelcome,
    PublicProfile,
  },
};
</script>

<template>
  <main>
    <div v-if="userStore.isLoading">Loading...</div>
    <div v-if="!userStore.isLoading">
      <form v-if="userStore.isLogged" class="form-group">
        <PublicProfile
          :username="userStore.user.username"
          :avatarUrl="userStore.avatarUrl"
          :played="userStore.user.played"
          :victory="userStore.user.victory"
          :defeats="userStore.user.defeats"
          :id="userStore.user.id"
        />
        <div class="login-container">
          <a class="intra-login" href="http://127.0.0.1:3000/api/auth/logout">
            <div class="intra-login-wrapper">
              <p>Se déconnecter</p>
              <img
                alt="Invader Logo"
                class="logo-42"
                src="@/assets/logo-42-black.png"
              />
            </div>
          </a>
        </div>
      </form>
      <div v-if="!userStore.isLogged">
        <TheWelcome />
        <div class="login-container">
          <a class="intra-login" href="http://127.0.0.1:3000/api/auth/login">
            <div class="intra-login-wrapper">
              <p>Se connecter avec</p>
              <img
                alt="Invader Logo"
                class="logo-42"
                src="@/assets/logo-42-black.png"
              />
            </div>
          </a>
        </div>
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

.intra-login {
  margin: auto;
  color: rgba(0, 0, 0, 0.822);
  display: flex;
  flex-direction: row;
}

.intra-login:hover {
  background-color: rgba(0, 0, 0, 0.096);
}

.intra-login-wrapper {
  border: 4px solid rgba(0, 0, 0, 0.822);
  padding: 10px;
  align-items: stretch;
  justify-content: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.intra-login-wrapper:hover {
  padding: 10px 25px;
  align-items: stretch;
  justify-content: center;
}

.intra-login-wrapper p {
  display: inline-block;
  font-size: 30px;
  vertical-align: middle;
}

.logo-42 {
  display: inline-block;
  /* max-width: 100%; */
  /* align: center; */
  vertical-align: middle;
  width: 70px;
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
