<script lang="ts">
import { useUserStore } from "../stores/userStore";
import TheWelcome from "@/components/TheWelcome.vue";
import axios from "axios";
// import PopperVue from '@soldeplata/popper-vue';


export default {
  setup() {
    const userStore = useUserStore();
    userStore.requestLogState();
    return { userStore };
  },
  data () {
    return {
      name: null,
      file: '',
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
        // console.log("FAILURE : ", err)
        // console.log("statusCode : ", statusCode)
        // console.log("err.message : ", err.message)
      });
    },
    enable2FA() {
      console.log("enable2FA()")
      const token = this.userStore.user.access_token
      axios.post("http://127.0.0.1:3000/api/2fa/generate", { username : this.name }, { withCredentials: true, headers: { 'access_token' : token }} )
      .then(async res => {
        // this.goToAccount();
          this.qrcode = res.data;
          console.log("generate success : ", res)
          // console.log("res.data : ", res.data)
      })
      .catch(err => {
        console.log("generate error : ", err)
      });
      return true;      
    },
    // hexToBase64(str : string) {
    //   return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
    // },
    // getImg() {
    //   console.log("getImg")
    //   var img = document.createElement('img');
    //   // img.src = 'data:image/jpeg;base64,' + btoa('your-binary-data');
    //   img.src = 'data:image/jpeg;base64,' + hexToBase64(this.qrcode);
    //   document.body.appendChild(img);
    //   // var img : string = 'data:image/png;base64,' + btoa(binary)
    //   // console.log("img : ", img)
    //   return img
    // }
  },
};

</script>

<template>
  <main>
    <div v-if="userStore.isLoading">Loading...</div>
    <div v-if="!userStore.isLoading">
      <div v-if="userStore.isLogged" class="form-group">
        <h1>Bonjour {{ userStore.user.username }}</h1>
        <!-- <p>Avatar:</p> -->
        <img :src=userStore.avatarUrl style="max-height: 400px; max-width: 400px;" />
        <!-- <p>2FA: {{ userStore.user.isTwoFA }}</p> -->
        <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
          <ul>
            <li v-for="error in errors"> {{ error }}</li>
          </ul>
        </p>
        <div v-if="!userStore.user.isTwoFA">
            <button type="submit" @click="enable2FA()">Enable 2-factor authentication</button>
            {{ this.qrcode }}
           <div v-if="this.qrcode">
            <p>{{ this.qrcode.substring(0, 100) }}</p>
            QRCODE
            <!-- <img src=data:image/png;base64,${this.qrcode} /> -->
            <!-- <img src=getImg /> -->
            <!-- <img src="data:image/png;base64,{{hexToBase64(this.qrcode)}}"> -->
            <!-- <img [src]="getImg(this.qrcode)"> -->
            <!-- <img src=getImg(this.qrcode) /> -->
            <!-- <img src="data:image/png;base64,{{hexToBase64(this.qrcode)}}"> -->
            <!-- <img src=getImg(this.qrcode) /> -->
            <!-- <img id="preview" src=""> -->
            <!-- <img :src=this.qrcode /> -->
          </div>

            <!-- Enable 2-factor authentication -->
        </div>
        <div v-else>
          2FA ON
        </div>
          <p>
            Update your username :
            <input v-model="name" type="text" name="username" :placeholder=userStore.user.username>
            <button type="submit" @click="checkForm()" >Submit</button>
          </p>
          <p>
            Update your avatar :
            <input type="file" @change="handleFileUpload( $event )"/>
            <button v-on:click="submitFile()">Submit</button>
          </p>
        {{ this.name }}

        <!-- <input type="checkbox" id="switch" v-on:click="toggleTwoFA" />
        <div style="display=flex">
          Would you like to enable 2FA
          <label for="switch">Toggle</label>
        </div> -->
        <!--         <div class="login-container">
          <a class="intra-login" href="/api/auth/login">
            <div class="intra-login-wrapper">
              <p>Se deconnecter</p>
              <img
                alt="Invader Logo"
                class="logo-42"
                src="@/assets/logo-42-black.png"
              />
            </div>
          </a>
        </div> -->
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
