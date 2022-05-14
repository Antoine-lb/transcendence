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
    }
  },
  components : {
    TheWelcome,
  },
  methods: {
    notifyError(msg) {
      this.$notify({
        title: msg,
        type: "error"
      })
    },
    notifyWarn(msg) {
      this.$notify({
        title: msg,
        type: "warn"
      })
    },
    notifySuccess(msg) {
      this.$notify({
        title: msg,
        type: "success"
      })
    },
    log2fa() {
      if (this.code)
      {
        if (this.code.length != 6)
        {
          this.notifyError("Wrong code.")
          this.code = null
          return
        }
        const token = this.userStore.user.access_token
        axios.post("http://127.0.0.1:3000/api/2fa/authenticate", { twoFACode : this.code }, { withCredentials: true, headers: { 'access_token' : token }} )
        .then(async res => {
          this.$router.push('/');
        })
        .catch(err => {
          this.notifyError("Wrong code.")
          this.code = null
        });
        return true;
      }
      this.notifyWarn("Code required.")
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
        <div v-if="userStore.user.isTwoFA">
            <p style="margin-top: 10px;"> Your account has enabled 2FA. Please enter code below to login : </p>
            <p>
              Please enter 2fa code below :
              <input v-model="code" type="text" maxlength="6" name="twoFACode" v-on:keyup.enter="log2fa" placeholder="_ _ _ _ _ _">
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
