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
      <br />
      <small>You are logged in as {{ user.display_name }}</small>
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
// vue
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

// libs
import { useCookies } from 'vue3-cookies';

// utils
import constants from '../constants';

// types
import { User } from '../types';

// vars
const { cookies } = useCookies();

// refs
const user = ref(<User>(<unknown>cookies.get(constants.lf_user)));

// functions
const logout = () => {
  cookies.remove(constants.lf_token);
  cookies.remove(constants.lf_user);
  window.location.href = '/';
};
</script>
