
<template>
  <main>
    <TheGame />
  </main>
</template>


<script lang="ts">
import TheGame from "@/components/TheGame.vue";

export default {
  name : "Game",
  data () {
    return {
        // canvas: document.getElementById('game')
      variable: "test",
    }
  },
  components : {
    TheGame
  }

};
</script>