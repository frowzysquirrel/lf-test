<template>
  <main>
    <router-view />
  </main>
  <Toast />
  <ConfirmDialog />
</template>

<script lang="ts" setup>
// primevue
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
</script>
