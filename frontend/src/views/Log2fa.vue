<script lang="ts">
import { useUserStore } from "../stores/userStore";
import TheWelcome from "@/components/TheWelcome.vue";
import Log from "@/components/Log.vue";
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
  components : {
    TheWelcome,
    Log
  },
  methods: {
    log2fa() {
      if (this.code)
      {
        const token = this.userStore.user.access_token
        axios.post("http://127.0.0.1:3000/api/2fa/authenticate", { twoFACode : this.code }, { withCredentials: true, headers: { 'access_token' : token }} )
        .then(async res => {
          this.$router.push('/');
        })
        .catch(err => {
          console.log("log2fa authenticate error : ", err)
        });
        return true;
      }
      this.errors = [];
      this.errors.push('Code required.');
    },
    isHalfLogged() {
      if (this.userStore.isHalfLogged)
        return true;
      else
        this.$router.push('/');
    }
  },
};

</script>

<template>
  <main>
    <div v-if="userStore.isLoading">Loading...</div>
    <div v-if="!userStore.isLoading">
      <div v-if="isHalfLogged()" class="form-group">
        <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
          <ul>
            <li v-for="error in errors"> {{ error }}</li>
          </ul>
        </p>
        <div v-if="userStore.user.isTwoFA">
            <p>
              Please enter 2fa code below :
              <input v-model="code" type="text" name="twoFACode" v-on:keyup.enter="log2fa" placeholder="_ _ _ _ _ _">
              <button type="submit" @click="log2fa()" >Submit</button>
            </p>
        </div>
      </div>
    </div>
  </main>
</template>

<style>

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
