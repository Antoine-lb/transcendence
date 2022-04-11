<script lang="ts">
import { useUserStore } from "../stores/userStore";
import axios from "axios";

export default {
  name: "PrivateAccount",
  // setup() {
  //   const userStore = useUserStore();
  //   userStore.requestLogState();
  //   return { userStore };
  // },
  data() {
    return {
      userStore: useUserStore(),
      name: null,
      code: null,
      file: '',
      img: '',
      errors: [],
    };
  },
  props: {

  },
  async created() {

  },
  methods: {
    goToAccount() {
      this.$router.go('/account');
    },
    pushToLog2fa() {
      this.$router.push('/log2fa');
    },
    checkForm: function (e) {
      if (this.name)
      {
        const token = this.userStore.user.access_token
        axios.post("http://127.0.0.1:3000/api/users/me/update-username", { username : this.name }, { withCredentials: true, headers: { 'access_token' : token }} )
        .then(async res => {
          this.goToAccount();
          console.log("res : ", res)
        })
        .catch(err => {
          console.log("err : ", err)
        });
        return true;
      }
      this.errors = [];
      if (!this.name) {
        this.errors.push('Name required.');
      }
      // e.preventDefault();
    },
    handleFileUpload(event){
      this.file = event.target.files[0];
    },
    submitFile(){
      console.log("submitFile : ", this.file);
      let formData = new FormData();
      formData.append('file', this.file);
      axios.post( "http://127.0.0.1:3000/api/users/me/upload-avatar", formData, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' }} )
      .then(async res => {
          this.goToAccount();
          console.log("res : ", res)
      })
      .catch(err => {
        var statusCode = err.message.split(' ').slice(-1);
        if (isNaN(Number(statusCode)) == false)
          statusCode = parseInt(statusCode);
        else
          statusCode = 500;
        this.errors = [];
        if (statusCode == 415)
          this.errors.push('Unsupported mime type.');
        else if (statusCode == 413)
        {
          this.errors.push('Payload too large.');
        }
      });
    },
    hexToBase64(str : string) {
      return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
    },
    generateQrCode() {
      if (this.img)
      {
        this.img = null;
        return;
      }
      console.log("generateQrCode()")
      const token = this.userStore.user.access_token
      axios.post("http://127.0.0.1:3000/api/2fa/generate", { username : this.name }, { withCredentials: true, headers: { 'access_token' : token }} )
      .then(async res => {
          this.img = res.data.img_src;
      })
      .catch(err => {
        console.log("generate error : ", err)
      });
      return true;      
    },
    turnOn2fa() {
     if (this.code)
      {
        const token = this.userStore.user.access_token
        console.log(token)
        console.log(this.userStore.user)
        axios.post("http://127.0.0.1:3000/api/2fa/turn-on", { twoFACode : this.code }, { withCredentials: true, headers: { 'access_token' : token, 'access_token_2fa' : token } } )
        .then(async res => {
          console.log("turn-on success : ", res)
          this.pushToLog2fa();
        })
        .catch(err => {
          console.log("turn-on error : ", err)
        });
        return true;
      }
      this.errors = [];
      if (!this.code) {
        this.errors.push('Code required.');
      }
    },
    turnOff2fa() {
        const token = this.userStore.user.access_token
        console.log(this.userStore.user)
        axios.post("http://127.0.0.1:3000/api/2fa/turn-off", { user : this.userStore.user }, { withCredentials: true, headers: { 'access_token' : token }} )
        .then(async res => {
          console.log("turn-off success : ", res)
          this.goToAccount();
        })
        .catch(err => {
          console.log("turn-off error : ", err)
        });
        return true;
    },
  },
};
</script>

<template>
  <div>
    <div class="box">
      <!-- If errors at submit -->
      <p class="error" v-if="errors.length">
        Please correct the following error(s):
        <ul> <li v-for="error in errors"> {{ error }}</li> </ul>
      </p>
      <!-- Update username -->
      <div class="text space">
        <p> Update your username :
          <input v-model="name" type="text" name="username" :placeholder=userStore.user.username>
        </p>
        <p><button class="pwd-btn" type="submit" @click="checkForm()" >Submit</button></p>
      </div>
      <!-- Update avatar -->
      <div class="text space">
        <p> Update your avatar :
          <input type="file" @change="handleFileUpload( $event )"/>
        </p>
        <p><button class="pwd-btn" v-on:click="submitFile()">Submit</button></p>
      </div>
      <!-- Enable/Disable 2FA -->
      <div class="text space">
        <!-- Enable 2FA -->
        <p> Update your security settings : </p>
        <div v-if="!userStore.user.isTwoFA">
          <p><button class="pwd-btn" type="submit" @click="generateQrCode()">Enable 2-factor authentication</button></p>
          <div v-if="this.img">
            <img :src="img" />
            <p>
              Please enter 2fa code below :
              <input v-model="code" type="text" name="twoFACode" placeholder="_ _ _ _ _ _">
              <p><button class="pwd-btn" type="submit" @click="turnOn2fa()" >Submit</button></p>
            </p>
          </div>
        </div>
        <!-- Disable 2FA -->
        <div v-else>
          <p><button class="pwd-btn" type="submit" @click="turnOff2fa()">Disable 2-factor authentication</button></p>
        </div>
      </div>
    </div>
    <!-- Logout -->
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
  margin-top: 4px;
  border: 2px solid #703ab8;
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

.text {
  font-size: 15px;
  color: rgba(0, 0, 0, 0.822);
}

.space {
  margin: 15px;
}

.on-colors {
  background-color: #703ab8;
  color: white;
}

.error {
  color: darkred;
  font-weight: bold;
}

</style>
