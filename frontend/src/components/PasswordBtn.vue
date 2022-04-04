<script lang="ts">
import { useUserStore } from "../stores/userStore";

export default {
  name: "PasswordBtn",
  data() {
    return {
      userStore: useUserStore(),
      inputPassword: null,
      passwordFieldType: "password",
    };
  },
  props: {
    onSubmit: Function,
    roomId: Number,
    msg: String,
  },
  async created() {
  
  },
  methods: {
    switchVisibility() {
      if (this.passwordFieldType == 'password')
        this.passwordFieldType = 'text'
      else
        this.passwordFieldType = 'password'
    },
    submitPwd(roomId, inputPassword) {
      // console.log(">>>>>> submit in component");
      // console.log(">>> roomId : ", roomId);
      // console.log(">>> inputPassword : ", inputPassword);
      this.$emit("onSubmit", roomId, inputPassword);
    }
  },
};
</script>

<template>
  <div>
    <input :type="passwordFieldType" v-model="inputPassword" placeholder="Password" />
    <button class="add-user" @click="switchVisibility">{{passwordFieldType == "password" ? 'SHOW' : 'HIDE'}}</button>
    <button class="add-user on-colors" @click="submitPwd(this.roomId, inputPassword)">{{ msg }}</button> 
  </div>
</template>

<style scoped>
.error-paragraf {
  color: red;
}

input[type="submit"]:hover {
  background-color: white;
  color: #703ab8;
}

.add-user {
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
  /* display: block; */
  margin: 10px;
  border: 2px solid #703ab8;
}

.on-colors {
  background-color: #703ab8;
  color: white;
}
</style>
