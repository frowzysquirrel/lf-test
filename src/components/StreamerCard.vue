<template>
  <Card>
    <template #content>
      <div class="overlay">
        <a
          class="stream-link"
          :href="`https://twitch.tv/${stream.user_name}`"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Button label="View" />
        </a>

        <Button
          severity="success"
          label="Copy raid command"
          :loading="isRaiding"
          @click="handleRaidClick"
        />
      </div>
      <Badge value="Followed" severity="success" v-if="stream.followed" />
      <img :src="stream.thumbnail_url.replace('{width}', '440').replace('{height}', '248')" />
      <Tag :value="getViewersTag" severity="contrast"></Tag>
      <div class="text-content">
        <p :title="stream.title">
          <strong>{{ stream.title }}</strong>
        </p>
        <p class="mt-05">{{ stream.user_name }}</p>
        <p>{{ stream.game_name }}</p>
        <p class="mt-05" :title="stream.tags.join(', ')">
          <Tag class="mr-05" v-for="tag in stream.tags" :key="tag" :value="tag" />
        </p>
      </div>
    </template>
  </Card>

  <Dialog v-model:visible="displayDialog" modal header="Raid failed" :style="{ width: '25rem' }">
    <p>{{ raidErrorMessage }}</p>
    <Button class="mt-1" type="button" label="Okay " @click="displayDialog = false"></Button>
  </Dialog>
</template>

<script lang="ts" setup>
// vue
import { computed, ref } from 'vue';

// primevue
import { useToast } from 'primevue/usetoast';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';

// vars
const toast = useToast();

// props
const props = defineProps<{
  stream: {
    game_name: string;
    id: string;
    tags: string[];
    thumbnail_url: string;
    title: string;
    user_id: string;
    user_name: string;
    viewer_count: number;
    followed: boolean;
  };
}>();

// refs
const isRaiding = ref(false);
const displayDialog = ref(false);
const raidErrorMessage = ref('');

const getViewersTag = computed(
  () => `${props.stream.viewer_count} viewer${props.stream.viewer_count > 1 ? 's' : ''}`,
);

// functions
const handleRaidClick = async () => {
  navigator.clipboard.writeText(`/raid ${props.stream.user_name}`);
  toast.add({ severity: 'success', summary: 'Copied to clipboard!', life: 5000 });
};
</script>

<style lang="scss" scoped>
img {
  width: 100%;
}

.p-card {
  position: relative;
  &:hover {
    transform: scale(1.05);
    transition: all ease 0.2s;
    .overlay {
      opacity: 1;
      user-select: initial;
    }
  }
}

.text-content {
  overflow: hidden;
  white-space: nowrap;
}

p {
  text-overflow: ellipsis;
  width: 100%;

  strong {
    align-items: center;
    display: inline-flex;
    height: 26px;
  }
}
.p-badge-success {
  position: absolute;
  right: -2px;
  top: -5px;
  z-index: 1;
}
.p-tag-contrast {
  position: absolute;
  top: 30px;
  opacity: 0.8;
  left: 30px;
}

.overlay {
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  color: white;
  display: flex;
  font-size: 1.5rem;
  gap: 1rem;
  height: 100%;
  justify-content: center;
  left: 0;
  opacity: 0;
  position: absolute;
  top: 0;
  user-select: none;
  width: 100%;
  z-index: 1;
  transition: all ease 0.2s;
}
</style>
