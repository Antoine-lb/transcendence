<script lang="ts">
import { useUserStore } from "../stores/userStore";

export default {
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },
};
</script>

<template>
  <main>
    <div v-if="userStore.isLoading">Loading...</div>
    <div v-if="!userStore.isLoading">
      <form v-if="userStore.isLogged" class="form-group">
        <h1>Bonjour {{ userStore.user.username }}</h1>
        <img :src="userStore.user.avatar" />
        <p>isOnline: {{ userStore.user.isOnline }}</p>
        <p>played: {{ userStore.user.played }}</p>
        <!-- <input type="checkbox" id="switch" v-on:click="toggleTwoFA" />
        <div style="display=flex">
          Would you like to enable 2FA
          <label for="switch">Toggle</label>
        </div> -->
        <!--         <div class="login-container">
          <a class="intra-login" href="/api/auth/login">
            <div class="intra-login-wrapper">
              <p>Se deconnecter</p>
              <img
                alt="Invader Logo"
                class="logo-42"
                src="@/assets/logo-42-black.png"
              />
            </div>
          </a>
        </div> -->
        <div class="login-container">
          <a class="intra-login" href="http://localhost:3000/api/auth/logout">
            <div class="intra-login-wrapper">
              <p>Se deconnecter</p>
              <img
                alt="Invader Logo"
                class="logo-42"
                src="@/assets/logo-42-black.png"
              />
            </div>
          </a>
        </div>
      </form>
      <div class="login-container" v-if="!userStore.isLogged">
        <a class="intra-login" href="http://localhost:3000/api/auth/login">
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
  </main>
</template>

<style>
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
