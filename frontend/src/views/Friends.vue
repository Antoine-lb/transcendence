<script lang="ts">
import TheWelcome from "@/components/TheWelcome.vue";
import { useUserStore } from "../stores/userStore";
import { ref, computed } from "vue";



export default {
  name: "Friends",
  data() {
    return { count: 0, friends: [] };
  },
  setup() {
    const data = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const userStore = useUserStore();
    userStore.requestLogState();


    function fetchData() {
      loading.value = true;
      // I prefer to use fetch
      // you can use use axios as an alternative
      return fetch('http://jsonplaceholder.typicode.com/posts', {
        method: 'get',
        headers: {
          'content-type': 'application/json'
        }
      })
        .then(res => {
          // a non-200 response code
          if (!res.ok) {
            // create error instance with HTTP status text
            const error = new Error(res.statusText);
            error.json = res.json();
            throw error;
          }

          return res.json();
        })
        .then(json => {
          // set the response data
          data.value = json.data;
        })
        .catch(err => {
          error.value = err;
          // In case a custom JSON error response was provided
          if (err.json) {
            return err.json.then(json => {
              // set the JSON response message
              error.value.message = json.message;
            });
          }
        })
        .then(() => {
          loading.value = false;
        });
    }

    return { userStore };
  },
  methods: {
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    },
    fetchFriends() {
      console.log('fetch friends')
    }
  },
};

</script>

<template>

  <main>
    <div v-if="userStore.isLoading">Loading...</div>

    <div v-if="!userStore.isLoading">
      <div v-if="userStore.isLogged">
        <h1>Amis</h1>
        <h1>Demandes d'amis en attente</h1>
        <h1>Ajouter un ami</h1>
      </div>
      <div v-if="!userStore.isLogged">
        <p>Vous devez être connecté pour voir vos amis</p>
      </div>
    </div>
  </main>
</template>

<style>

</style>
