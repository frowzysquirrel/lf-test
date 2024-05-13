<template>
  <div class="header px-3 py-05 text-center">
    <div v-if="isLoading">
      <small>
        If it takes a bit to load, congratulations! That means you have a lot of followers ❤️
      </small>
      <ProgressBar class="mt-05" :value="percentage"></ProgressBar>
      <LoadingMessages class="mt-05" />
    </div>
    <div class="text-center p-1" v-if="!isLoading">
      <img src="../assets/logo.png" alt="LiveFollowr+" class="logo" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import LoadingMessages from './LoadingMessages.vue';
import ProgressBar from 'primevue/progressbar';

defineProps<{
  isLoading: boolean;
  percentage: number;
}>();
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
