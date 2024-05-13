<template>
  <Dropdown
    v-model="selectedGame"
    :options="games"
    optionLabel="name"
    placeholder="Filter by game"
    class="w-full md:w-14rem mr-1"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Dropdown from 'primevue/dropdown';

const selectedGame = ref();
const games = ref([
  { name: 'New York', code: 'NY' },
  { name: 'Rome', code: 'RM' },
  { name: 'London', code: 'LDN' },
  { name: 'Istanbul', code: 'IST' },
  { name: 'Paris', code: 'PRS' },
]);
</script>
