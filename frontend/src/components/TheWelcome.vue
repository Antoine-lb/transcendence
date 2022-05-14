<script setup lang="ts">
import WelcomeItem from "./WelcomeItem.vue";
import DocumentationIcon from "./icons/IconDocumentation.vue";
import EcosystemIcon from "./icons/IconEcosystem.vue";
import CommunityIcon from "./icons/IconCommunity.vue";
</script>

<template>
  <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Compte utilisateur</template>

    Log with 42 Intra

    <!-- <a target="_blank" href="https://intra.42.fr">42 Intra</a> -->
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <CommunityIcon />
    </template>
    <template #heading>Chat</template>

    Chat with friends.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <EcosystemIcon />
    </template>
    <template #heading>Jeux</template>

    Play online.
  </WelcomeItem>
</template>

<style>
main {
  max-width: 500px;
  padding-top: 50px; /* Original 100px */
  margin: auto;
}
</style>
