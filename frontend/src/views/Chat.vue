
<template>
  <main>
    <TheChat />
  </main>
</template>


<script lang="ts">
import TheChat from "@/components/TheChat.vue";

export default {
  name : "Game",
  data () {
    return {
      variable: "tttest",
    }
  },
  components : {
    TheChat
  }

};
</script>