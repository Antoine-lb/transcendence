<template>
  <div class="about">
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
</style>
