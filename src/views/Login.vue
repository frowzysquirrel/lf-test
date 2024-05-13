<template>
  <div class="flex-center card">
    <ProgressSpinner style="width: 150px; height: 150px" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import axios from 'axios';
import ProgressSpinner from 'primevue/progressspinner';

const accessToken = new URLSearchParams(window.location.hash.replace('#', '?')).get('access_token');

const twitchLogin = () => {
  const redirectUri =
    window.location.host === 'livefollowr.com'
      ? 'https://livefollowr.com'
      : 'http://localhost:5173';
  const url =
    `https://id.twitch.tv/oauth2/authorize` +
    `?client_id=${axios.defaults.headers.common['Client-ID']}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=moderator:read:followers user:read:follows` +
    `&response_type=token`;
  window.location.href = url;
};

onMounted(() => {
  twitchLogin();
});
</script>

<style lang="scss" scoped>
.card {
  height: 100vh;
}
</style>
