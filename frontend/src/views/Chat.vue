
<script lang="ts">
import TheChat from "@/components/TheChatt.vue";
import { useUserStore } from "../stores/userStore";


export default {
  name : "Game",
  data () {
    return {
      variable: "tttest",
    }
  },
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },
  components : {
    TheChat
  }

};
</script>

<template>
  <main>
    <div v-if="userStore.isLoading">Loading...</div>

    <div v-if="!userStore.isLoading">
      <div v-if="userStore.isLogged" class="form-group">
        <TheChat :user="userStore.user"/>
      </div>
      <div v-if="!userStore.isLogged" class="form-group">
        <p>You have to be logged to see the chat</p>
      </div>
    </div>
  </main>
</template>

