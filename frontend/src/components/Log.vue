<script lang="ts">
import { useUserStore } from "../stores/userStore";

export default {
  name: "Log",
  data() {
    return {
      userStore: useUserStore(),
    };
  },
  props: {
  },
  async created() {
  
  },
  methods: {

  },
};
</script>

<template>
  <div v-if="!this.userStore.isFullyLogged && !this.userStore.isHalfLogged">
    <!-- <div class="login-container"> -->
      <a class="intra-login" href="http://127.0.0.1:3000/api/auth/login">
        <div class="intra-login-wrapper">
          <p>Se connecter</p>
          <img
            alt="Invader Logo"
            class="logo-42"
            src="@/assets/logo-42-black.png"
          />
        </div>
      </a>
    <!-- </div> -->
  </div>
  <div v-else>
    <!-- <div class="login-container"> -->
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
    <!-- </div> -->
  </div>
</template>

<style scoped>

.intra-login {
  /* margin: auto; */
  color: rgba(0, 0, 0, 0.822);
  display: flex;
  flex-direction: row;
  border-radius: 23px;
    /* margin-left: 20px; */

}

.intra-login:hover {
  background-color: rgba(0, 0, 0, 0.096);
}

.intra-login-wrapper {
  /* margin-left: 20px; */
  border: 3.5px solid rgba(0, 0, 0, 0.822);
  border-radius: 23px;
  padding: 10px;
  align-items: stretch;
  justify-content: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.intra-login-wrapper:hover {
  /* padding: 10px 25px; */
  align-items: stretch;
  justify-content: center;
}

.intra-login-wrapper p {
  display: inline-block;
  font-size: 20px;
  vertical-align: middle;
}

.logo-42 {
  display: inline-block;
  /* max-width: 100%; */
  /* align: center; */
  vertical-align: middle;
  width: 50px;
}



</style>
