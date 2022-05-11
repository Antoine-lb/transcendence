<script lang="ts">
import { useUserStore } from "../stores/userStore";
import Log from "@/components/Log.vue";
import axios from "axios";

export default {
  name: "PrivateProfile",
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
    socket: Object,
  },
  async created() {
    // console.log(`onCreated`);
    this.socket.on("invit", this.invitationRecu);
    this.socket.on("acceptInvit", this.acceptInvit);
  },
    unmounted() {
    this.socket.removeAllListeners();
  },
  components : {
    Log
  },
  methods: {
    notifyError(err) {
      if (err?.response?.data?.message)
        this.$notify({
          title: "An error has occured : " + err.response.data.message + ".",
          type: "error"
        })
      else
        this.$notify({
          title: "An error has occured. Please try again later.",
          type: "error"
        })
    },
    goToAccount() {
      this.$router.go('/account');
    },
    pushToLog2fa() {
      this.$router.push('/log2fa');
    },
    checkUsernameChars(str) {
      var allowed = /^[a-zA-Z0-9-_]*$/; // letters, numbers, hyphen and underscore
      if (str.match(allowed))
        return true
      return false
    },
    checkFormUsername: function (e) {
      if (this.name)
      {
        if (!this.checkUsernameChars(this.name))
        {
          this.$notify({
              title: 'Allowed characters : alphanumerical, hyphen ( - ) and underscore ( _ ).',
              type: "error"
          });
          return
        }
        const token = this.userStore.user.access_token
        axios.post("http://127.0.0.1:3000/api/users/me/update-username", { username : this.name }, { withCredentials: true, headers: { 'access_token' : token }} )
        .then(async res => {
          this.goToAccount();
        })
        .catch(err => {
          this.errors = [];
          var statusCode = err.message.split(' ').slice(-1);
          if (statusCode == 400)
            this.errors.push('Allowed characters : alphanumerical, hyphen and underscore.');
          else
            this.notifyError(err);
        });
        return true;
      }
      this.errors = [];
      if (!this.name) {
        this.$notify({
          title: "Please submit a new username.",
          type: "warn",
        })
      }
      // e.preventDefault();
    },
    handleFileUpload(event){
      this.file = event.target.files[0];
    },
    submitFile(){
      console.log("this.file : ", this.file);
      if (!this.file)
      {
        this.$notify({
          title: "Please submit a file",
          type: "warn"
        })
        return;
      }
      let formData = new FormData();
      formData.append('file', this.file);
      axios.post( "http://127.0.0.1:3000/api/users/me/upload-avatar", formData, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' }} )
      .then(async res => {
          this.$notify({
            title: "Avatar uploaded !",
            type: "success"
          })
          this.$refs.fileInput.type = 'text'
          this.$refs.fileInput.type = 'file'
          this.errors = [];
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
          this.errors.push('Payload too large.');
        else
          this.notifyError(err);
      });
    },
    resetAvatar(){
      const token = this.userStore.user.access_token
      axios.get( "http://127.0.0.1:3000/api/users/me/delete-avatar", { withCredentials: true, headers: { 'access_token' : token }} )
      .then(async res => {
          this.$notify({
            title: "Avatar reset !",
            type: "success"
          })
          this.$refs.fileInput.type = 'text'
          this.$refs.fileInput.type = 'file'
          this.errors = [];
      })
      .catch(err => {
        this.notifyError(err);
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
        axios.post("http://127.0.0.1:3000/api/2fa/turn-on", { twoFACode : this.code }, { withCredentials: true, headers: { 'access_token' : token, 'access_token_2fa' : token } } )
        .then(async res => {
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
        axios.post("http://127.0.0.1:3000/api/2fa/turn-off", { user : this.userStore.user }, { withCredentials: true, headers: { 'access_token' : token }} )
        .then(async res => {
          this.goToAccount();
        })
        .catch(err => {
          console.log("turn-off error : ", err)
        });
        return true;
    },
        invitationRecu(adversaire, code) {
      if (confirm(adversaire.username + ", vous défie au pong : lancer la partie ?")){
        this.socket.emit('newGame', code);
        this.socket.emit('acceptInvit', adversaire, code);
        this.$router.push("Chat");
      }
      else
        this.socket.emit('declineGameInvit', adversaire);
    },
    acceptInvit (roomCode) {
        console.log(">>>>>> acceptInvitGame (pb profile) roomCode : ", roomCode);
        // await this.startGameAnimation()
        this.socket.emit('joinGame', roomCode);
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
          <input v-model="name" type="text" name="username" v-on:keyup.enter="checkFormUsername" :placeholder=userStore.user.username>
        </p>
        <p><button class="pwd-btn" type="submit" @click="checkFormUsername()" >Submit</button></p>
      </div>
      <!-- Update avatar -->
      <div class="text space">
        <p> Update your avatar :
          <input type="file" ref="fileInput" @change="handleFileUpload( $event )"/>
        </p>
        <button class="pwd-btn" style="margin-right: 5px" v-on:click="submitFile()">Submit</button>
        <!-- Reset avatar -->
        <button class="pwd-btn" style="margin-right: 5px" v-on:click="resetAvatar()">Reset your avatar to default</button>
      </div>
      <!-- Enable/Disable 2FA -->
      <div class="text space">
        <!-- Enable 2FA -->
        <p> Update your security settings : </p>
        <div v-if="!userStore.user.isTwoFA">
          <p><button class="pwd-btn" type="submit" @click="generateQrCode()">Enable 2-factor authentication</button></p>
          <div v-if="this.img">
            <p style="margin-top: 10px;"> Download Google Authenticator and scan this QR code :</p>
            <img :src="img" />
            <p>
              Please enter 2fa code below to enable 2FA :
              <input v-model="code" type="text" name="twoFACode" v-on:keyup.enter="turnOn2fa" placeholder="_ _ _ _ _ _">
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
