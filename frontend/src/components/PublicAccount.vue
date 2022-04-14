<script lang="ts">
import { useUserStore } from "../stores/userStore";

export interface UserInterface {
    id: number;
    username: string;
    avatar: string;
    isTwoFA: boolean;
    secret?: string;
    isOnline: boolean;
    played: number;
    victory: number;
    defeats: number;
}

export default {
  name: "PublicAccount",
  data() {
    return {
      userStore: useUserStore(),
      avatarUrl: String,
    };
  },
  props: {
    user: {
      type: Object as () => UserInterface
    },
    avatar: String,
  },
  async created() {

  },
  methods: {

  },
};
</script>

<template>
  <div>
    <div class="box"> 
      <p><img :src=this.avatar class="avatar" style="max-height: 400px; max-width: 400px;" /></p>
      <p class="text"> Username : {{ user.username }} </p>
      <p class="text"> Played : {{ user.played }} </p>
      <p class="text"> Victories : {{ user.victory }} </p>
      <p class="text"> Defeats : {{ user.defeats }} </p>
    </div>
  </div>
</template>

<style scoped>

input[type="submit"]:hover {
  background-color: white;
  color: #703ab8;
}

.box {
  background-color: white;
  border: none;
  color: #703ab8;
  font-weight: bold;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 3px;
  padding: 15px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-top: 10px;
  margin: 10px;
  border: 2px solid #703ab8;
}

.avatar {
  background-color: white;
  border: none;
  color: #703ab8;
  font-weight: bold;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  border-radius: 3px;
  padding: 15px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-top: 10px;
  margin: 10px;
}

.text {
  font-size: 15px;
  color: rgba(0, 0, 0, 0.822);
}

.on-colors {
  background-color: #703ab8;
  color: white;
}

</style>
