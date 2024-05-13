<template>
  <footer>
    <div class="text-center mt-3">
      <p>
        <span>LiveFollowr+</span> is a free tool for Twitch streamers created by
        <a href="https://twitter.com/flashforceplays" target="_blank">
          <strong>FlashForce</strong>
        </a>
        &
        <a href="https://twitter.com/FrowzySquirrel" target="_blank">
          <strong>FrowzySquirrel</strong> </a
        >. <br />
        If you have any questions or suggestions, drop us a message on Twitter ❤️
      </p>
      <br /><br />
      <p>
        <RouterLink to="/faq">
          <small>Read our FAQ</small>
        </RouterLink>
        <br />
        <a href="#" @click="logout()">
          <small>Logout</small>
        </a>
      </p>
      <br /><br />
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router';

const logout = () => {
  localStorage.removeItem('lf2_token');
  localStorage.removeItem('lf2_user');
  window.location.href = '/';
};
</script>
