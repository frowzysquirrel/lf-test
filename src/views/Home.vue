<template>
  <div class="text-center mt-5">
    <img src="../assets/logo.png" />
  </div>
  <div class="text-center mt-4">
    <h1>Support the streamers that support you.</h1>
  </div>
  <div class="text-center mt-1">
    <h3>LiveFollowr+ gives you the ability to see which of your followers are live on Twitch.</h3>
  </div>
  <div class="text-center mt-3">
    <RouterLink to="/feed">
      <Button label="Go to your feed" />
    </RouterLink>
  </div>
  <div class="text-center mt-5">
    <p>Made with ❤️ by these two nerds</p>
  </div>
  <div class="text-center mt-1">
    <a href="https://twitter.com/flashforceplays" target="_blank" title="FlashForce">
      <Avatar
        class="mr-1"
        image="https://pbs.twimg.com/profile_images/1596513605738020865/_KAQoFQr_400x400.jpg"
        shape="circle"
        size="xlarge"
      />
    </a>
    <a href="https://twitter.com/frowzysquirrel" target="_blank" title="Frowzy">
      <Avatar
        image="https://pbs.twimg.com/profile_images/1638979357870882821/jNI1kzP1_400x400.jpg"
        shape="circle"
        size="xlarge"
      />
    </a>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

import Avatar from 'primevue/avatar';
import Button from 'primevue/button';

const accessToken = new URLSearchParams(window.location.hash.replace('#', '?')).get('access_token');

const router = useRouter();

const login = (token: any, data: any) => {
  localStorage.setItem('lf_token', token);
  localStorage.setItem('lf_user', JSON.stringify(data));
  router.push('/feed');
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
        router.push('/login');
      });
  }
});
</script>

<style lang="scss" scoped>
img {
  max-width: 80%;
}
</style>
