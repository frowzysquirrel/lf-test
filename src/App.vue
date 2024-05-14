<template>
  <main>
    <router-view />
  </main>
  <Toast />
  <ConfirmDialog />
</template>

<script lang="ts" setup>
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
</script>
