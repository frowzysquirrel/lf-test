<template>
  <div class="header px-3 py-05 text-center">
    <div v-if="isLoading">
      <small>
        Welcome, {{ user?.display_name }}! <br /><br />
        If it takes a bit to load, congratulations! That means you have a lot of followers ❤️
      </small>
      <ProgressBar class="mt-05" :value="percentage"></ProgressBar>
      <LoadingMessages class="mt-05" />
    </div>
    <div class="text-center p-1" v-if="!isLoading">
      <RouterLink to="/">
        <img src="../assets/logo.png" alt="LiveFollowr+" class="logo" />
      </RouterLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
// vue
import { ref } from 'vue';

// libs
import { useCookies } from 'vue3-cookies';

// primevue
import ProgressBar from 'primevue/progressbar';

// components
import LoadingMessages from './LoadingMessages.vue';
// libs
import constants from '../constants';

// vars
const { cookies } = useCookies();

// types
import { User } from '../types';

// props
defineProps<{
  isLoading: boolean;
  percentage: number;
}>();

// refs
const user = ref(<User>(<unknown>cookies.get(constants.lf_user)));
</script>

<style lang="scss" scoped>
.header {
  background-color: #333;
  border-bottom: 1px solid #555;
  position: sticky;
  top: 0;
  z-index: 999;
}
.logo {
  max-width: 200px;
}
</style>
