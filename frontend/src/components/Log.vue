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
  <div v-else>
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
  </div>
</template>

<style scoped>

input[type="submit"]:hover {
  background-color: white;
  color: #703ab8;
}

.pwd-btn {
  background-color: white;
  border: none;
  color: #703ab8;
  font-weight: bold;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 3px;
  padding: 6px 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-top: 10px;
  margin: 10px;
  border: 2px solid #703ab8;
}

.on-colors {
  background-color: #703ab8;
  color: white;
}
</style>
