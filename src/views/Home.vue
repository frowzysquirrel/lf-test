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
    <RouterLink to="/login">
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
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';

const loginWithTwitch = () => {
  // Logic to redirect user to Twitch login page
  // You'll handle this in the router or with a library like OAuth2
};
</script>

<style lang="scss" scoped>
img {
  max-width: 80%;
}
</style>
