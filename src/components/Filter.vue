<template>
  <Dropdown
    v-model="selectedGame"
    :options="[{ name: 'All', id: undefined }, ...games]"
    optionLabel="name"
    placeholder="Filter by game"
    class="w-full md:w-14rem mr-1"
  />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import Dropdown from 'primevue/dropdown';

defineProps<{
  games: { name: string; id: string }[];
}>();

// emits
const emit = defineEmits(['filter:select']);

const selectedGame = ref();

watch(selectedGame, () => {
  emit('filter:select', selectedGame.value.id);
});
</script>
