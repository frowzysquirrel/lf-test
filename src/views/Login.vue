<template>
  <div class="flex-center card">
    <ProgressSpinner style="width: 150px; height: 150px" />
  </div>
</template>

<script setup lang="ts">
// vue
import { onMounted } from 'vue';

// libs
import axios from 'axios';

// primevue
import ProgressSpinner from 'primevue/progressspinner';

// functions
const twitchLogin = () => {
  let redirectUri = `${window.location.protocol}//${window.location.host}`;

  if (window.location.host === 'localhost') {
    redirectUri += ':5173';
  }

  const url =
    `https://id.twitch.tv/oauth2/authorize` +
    `?client_id=${axios.defaults.headers.common['Client-ID']}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=moderator:read:followers user:read:follows channel:manage:raids` +
    `&response_type=token`;
  window.location.href = url;
};

// lifecycle
onMounted(() => {
  twitchLogin();
});
</script>

<style lang="scss" scoped>
.card {
  height: 100vh;
}
</style>
