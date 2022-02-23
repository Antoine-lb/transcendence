<template>
<main>
  <div class="about">
    <form class="form-group">

    <input 
      type="checkbox"
      id="switch" v-on:click="toggleTwoFA" /> 
    <!-- <div style="display=flex">         -->
      Would you like to enable 2FA
      <label for="switch">Toggle</label>
    <!-- </div> -->
    </form>

    <form class="form-group">
      <h2>LogIn</h2>
      <input
        v-model="emailLogin"
        type="email"
        class="form-control"
        placeholder="Email"
        required
      />
      <input
        v-model="passwordLogin"
        type="password"
        class="form-control"
        placeholder="Password"
        required
      />
      <input type="submit" class="submit" @click="doLogin" />
    </form>
    <form class="form-group">
      <h2>Créer un compte</h2>
      <input
        v-model="emailLogin"
        type="name"
        class="form-control"
        placeholder="Name"
        required
      />
      <input
        v-model="emailLogin"
        type="email"
        class="form-control"
        placeholder="Email"
        required
      />
      <input
        v-model="passwordLogin"
        type="password"
        class="form-control"
        placeholder="Password"
        required
      />
      <input type="submit" class="submit" @click="doLogin" />
    </form>
  </div>
</main>
</template>

<style>
.form-group {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin: auto;
  margin-bottom: 50px;
}

.submit {
  margin-top: 30px;
}

/* POUR LA TICK BOX */
input[type=checkbox]{
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
	content: '';
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
body {
	display: flex;
	justify-content: center;
	align-items: center;
	/* height: 100vh; origin*/
	height: 5%;
}
</style>

<script lang="ts">

export default {
  // name : "Game",
  data () {
    return {
      twoFA: false,
    }
  },
  methods: {
    toggleTwoFA () {
      this.twoFA = !this.twoFA;
      // if (this.twoFA)
        // ASK BACKEND QRcode
      console.log(this.twoFA);
    }
  }
  // components : {
  //   TheGame
  // }

};

</script>