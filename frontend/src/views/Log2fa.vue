<script lang="ts">
import { useUserStore } from "../stores/userStore";
import TheWelcome from "@/components/TheWelcome.vue";
import axios from "axios";


export default {
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },
  data () {
    return {
      code: null,
      errors: [],
    }
  },
  watch: {

  },
  computed: {

  },
  components : {
    TheWelcome
  },
  methods: {
    goToAccount() {
      this.$router.go('/account');
    },
    log2fa() {
      if (this.code)
      {
        const token = this.userStore.user.access_token
        console.log(token)
        console.log(this.userStore.user)
        axios.post("http://127.0.0.1:3000/api/2fa/authenticate", { twoFACode : this.code }, { withCredentials: true, headers: { 'access_token' : token }} )
        .then(async res => {
          console.log("log2fa authenticate success : ", res)
          this.goToAccount();
        })
        .catch(err => {
          console.log("log2fa authenticate error : ", err)
        });
        return true;
      }
      this.errors = [];
      this.errors.push('Code required.');
    },
  },
};

</script>

<template>
  <main>
    <div v-if="userStore.isLoading">Loading...</div>
    <div v-if="!userStore.isLoading">
      <div v-if="userStore.isLogged" class="form-group">
        <h1>Bonjour {{ userStore.user.username }}</h1>
        <img :src=userStore.avatarUrl style="max-height: 400px; max-width: 400px;" />
        <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
          <ul>
            <li v-for="error in errors"> {{ error }}</li>
          </ul>
        </p>
        <div v-if="userStore.user.isTwoFA">
            <p>
              Please enter 2fa code below :
              <input v-model="code" type="text" name="twoFACode" placeholder="_ _ _ _ _ _">
              <button type="submit" @click="log2fa()" >Submit</button>
            </p>
        </div>

        <div class="login-container">
          <a class="intra-login" href="http://127.0.0.1:3000/api/auth/logout">
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
      </div>
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
