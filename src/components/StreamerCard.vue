<template>
  <a :href="`https://twitch.tv/${stream.user_name}`" rel="noopener noreferrer" target="_blank">
    <Card>
      <template #content>
        <Badge value="Followed" severity="success" v-if="followed" />
        <img :src="stream.thumbnail_url.replace('{width}', '440').replace('{height}', '248')" />
        <Badge :value="getViewersBadge" severity="contrast"></Badge>
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
  </a>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import axios from 'axios';

import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import { onMounted } from 'vue';

import constants from '../constants';

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
  };
}>();

const followed = ref();

const getViewersBadge = computed(
  () => `${props.stream.viewer_count} viewer${props.stream.viewer_count > 1 ? 's' : ''}`,
);

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem(constants.lf_user) || '');
  const response = await axios({
    url: 'https://api.twitch.tv/helix/channels/followed',
    method: 'GET',
    params: {
      user_id: user.id,
      broadcaster_id: props.stream.user_id,
    },
  });

  if (response.data.data && response.data.data.length) {
    followed.value = true;
  }
});
</script>

<style lang="scss" scoped>
img {
  width: 100%;
}

.p-card {
  position: relative;
  &:hover {
    transform: scale(1.05);
    transition: all ease 0.3s;
  }
}

.text-content {
  overflow: hidden;
  white-space: nowrap;
}

p {
  overflow: hidden;
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
  right: -5px;
  top: -10px;
}
.p-badge-contrast {
  position: absolute;
  top: 145px;
  opacity: 0.8;
  left: 30px;
}
</style>
