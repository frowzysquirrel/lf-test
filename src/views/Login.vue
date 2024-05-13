<template>
  <div class="flex-center card">
    <ProgressSpinner style="width: 150px; height: 150px" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import ProgressSpinner from 'primevue/progressspinner';

const router = useRouter();
const accessToken = new URLSearchParams(window.location.hash.replace('#', '?')).get('access_token');

const login = (token: any, data: any) => {
  localStorage.setItem('lf_token', token);
  localStorage.setItem('lf_user', JSON.stringify(data));
  router.push('/feed');
};

const twitchLogin = () => {
  const redirectUri =
    window.location.host === 'livefollowr.com'
      ? 'https://livefollowr.com/login'
      : 'http://localhost:5173/login';
  const url =
    `https://id.twitch.tv/oauth2/authorize` +
    `?client_id=${axios.defaults.headers.common['Client-ID']}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=moderator:read:followers` +
    `&response_type=token`;
  window.location.href = url;
};

onMounted(() => {
  if (accessToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    axios({
      url: 'https://api.twitch.tv/helix/users',
      method: 'GET',
    })
      .then((response) => {
        login(accessToken, response.data.data[0]);
      })
      .catch((errorResponse) => {
        console.log(errorResponse);
        alert('An error has occurred. Please contact Frowzy for help :)');
      });

    // not logged in nor trying to, so: login
  } else {
    twitchLogin();
  }
});
</script>

<style lang="scss" scoped>
.card {
  height: 100vh;
}
</style>
