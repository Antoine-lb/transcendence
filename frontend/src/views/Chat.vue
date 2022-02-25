
<template>
  <main>
    <TheGame />
  </main>
</template>


<script lang="ts">
import TheChat from "@/components/TheChat.vue";

export default {
  name : "Game",
  data () {
    return {
      variable: "test",
    }
  },
  components : {
    TheGame
  }

};
</script>