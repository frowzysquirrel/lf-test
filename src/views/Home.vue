<template>
  <div class="px-1">
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
    <div class="flex-column text-center mt-5" v-if="isAdmin()">
      <small>Admin only</small>
      <br />
      <RouterLink to="/config">
        <Button severity="secondary" label="Set featured streamer" />
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// vue
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// libs
import axios from 'axios';
import { useCookies } from 'vue3-cookies';
import mixpanel from 'mixpanel-browser';

// primevue
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';

// utils
import constants from '../constants';
import { useUser } from '../user';

// vars
const { cookies } = useCookies();
const { isAdmin } = useUser();
const accessToken = new URLSearchParams(window.location.hash.replace('#', '?')).get('access_token');
const route = useRoute();
const router = useRouter();

// functions
const login = (token: any, data: any) => {
  cookies.set(constants.lf_token, token);
  cookies.set(constants.lf_user, JSON.stringify(data));

  mixpanel.identify(data.display_name);
  mixpanel.people.set({
    $avatar: data.profile_image_url,
    $name: data.display_name,
  });

  router.push('/feed');
};

// lifecycle
onMounted(() => {
  const lfToken = cookies.get(constants.lf_token);
  if (lfToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${lfToken}`;
  }

  if (route.hash === '#feed') {
    router.push('/feed');
  }

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
