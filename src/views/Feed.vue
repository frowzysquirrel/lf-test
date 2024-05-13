<template>
  <Header :isLoading="isLoading" :percentage="percentage" />
  <div class="px-1 py-2">
    <Filter :games="games" @filter:select="handleFilterSelect" class="ml-1" />
    <div class="stream-grid px-1 py-2" v-if="streams.length">
      <a
        :href="`https://twitch.tv/${stream.user_name}`"
        :key="stream.id"
        rel="noopener noreferrer"
        target="_blank"
        v-for="stream in filteredStreams"
      >
        <Card>
          <template #content>
            <img :src="stream.thumbnail_url.replace('{width}', '440').replace('{height}', '248')" />
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
    </div>
    <Footer />
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { ref } from 'vue';
import axios from 'axios';
import Card from 'primevue/card';
import Tag from 'primevue/tag';

import Footer from '../components/Footer.vue';
import LoadingMessages from '../components/LoadingMessages.vue';
import Header from '../components/Header.vue';
import Filter from '../components/Filter.vue';

const router = useRouter();

const user = JSON.parse(localStorage.getItem('lf2_user'));

// refs
const games = ref([]);
const isLoading = ref(true);
const percentage = ref(0);
const runs = ref(0);
const selectedGameId = ref();
const streams = ref([]);
const filteredStreams = ref([]);
const totalFollowers = ref(0);

const getFollowers = async (cursor = '') => {
  try {
    const response = await axios({
      url: 'https://api.twitch.tv/helix/channels/followers',
      method: 'GET',
      params: {
        broadcaster_id: user.id,
        first: 100,
        after: cursor, // Pass the cursor for pagination
      },
    });

    const { data, pagination, total } = response.data;
    totalFollowers.value = total;
    const followers = data.map((follower) => follower.user_login);
    const nextCursor = pagination && pagination.cursor ? pagination.cursor : '';
    return { followers, nextCursor };
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error; // Handle the error appropriately in your application
  }
};

const getLiveFollowers = async () => {
  try {
    let liveFollowers = [];
    let cursor = '';
    do {
      const { followers, nextCursor } = await getFollowers(cursor);
      cursor = nextCursor;
      const response = await axios({
        url: `https://api.twitch.tv/helix/streams?first=100&user_login=${followers.join(
          '&user_login=',
        )}`,
        method: 'GET',
      });

      const liveUsers = response.data.data.map((stream) => stream);
      liveFollowers = [...liveFollowers, ...liveUsers];

      streams.value = [...liveFollowers];
      filteredStreams.value = [...liveFollowers];

      if (selectedGameId.value) {
        filteredStreams.value = streams.value.filter(
          (stream) => stream.game_id === selectedGameId.value,
        );
      }

      games.value = Array.from(new Set(liveFollowers.map((stream) => stream.game_id))).map(
        (id) => ({
          id,
          name: liveFollowers.find((stream) => stream.game_id === id).game_name,
        }),
      );

      runs.value += 100;
      percentage.value = Math.round((runs.value / totalFollowers.value) * 100);
    } while (cursor);

    return liveFollowers;
  } catch (error) {
    console.error('Error fetching live followers:', error);
    throw error; // Handle the error appropriately in your application
  }
};

const fetchData = async () => {
  isLoading.value = true;

  const response = await getLiveFollowers();
  localStorage.setItem('lf2_streams', JSON.stringify(response));
  isLoading.value = false;
};

const handleFilterSelect = (gameId) => {
  if (!gameId) {
    filteredStreams.value = streams.value;
    return;
  }

  selectedGameId.value = gameId;
  filteredStreams.value = streams.value.filter((stream) => stream.game_id === gameId);
};

onMounted(async () => {
  if (!axios.defaults.headers.common['Authorization']) {
    router.push('/login');
    return;
  }

  // uncomment this block to cache streams
  const useCacheStreams = false;
  const cachedStreams = localStorage.getItem('lf2_streams');
  if (cachedStreams && useCacheStreams) {
    streams.value = JSON.parse(cachedStreams);
    console.log('Cached streams:', streams.value);
    streams.value = [...streams.value, ...streams.value];
    isLoading.value = false;
    return;
  }

  fetchData();
});
</script>

<style lang="scss" scoped>
.stream-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
img {
  width: 100%;
}

.p-card:hover {
  transform: scale(1.05);
  transition: all ease 0.3s;
}

.text-content {
  overflow: hidden;
  white-space: nowrap;
}

p {
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;

  strong {
    display: inline-flex;
    height: 26px;
    align-items: center;
  }
}
</style>
