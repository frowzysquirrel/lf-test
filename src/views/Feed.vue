<template>
  <Header :isLoading="isLoading" :percentage="percentage" />
  <div class="px-1 py-2">
    <div class="flex-start flex-align-center flex-gap-3 px-1 filters" v-if="streams.length">
      <Filter :games="games" @filter:select="handleFilterSelect" />
      <div class="flex-start flex-align-center flex-gap-1">
        <span>Sort by viewer count</span>
        <Button :icon="getSortIcon" @click="handleSort" aria-label="Sort" severity="help" />
      </div>
      <div>
        <label for="mutualsOnly" class="mr-05"> Mutuals only </label>
        <Checkbox v-model="mutualsOnly" :binary="true" name="mutualsOnly" />
      </div>
    </div>
    <div class="stream-grid px-1 py-2" v-if="streams.length">
      <StreamerCard v-for="stream in filteredStreams" :stream="stream" :key="stream.id" />
    </div>
    <p class="text-center" v-if="streams.length && !filteredStreams.length">
      No streams match your filter criteria.
    </p>
    <Footer />
  </div>
</template>

<script lang="ts" setup>
// vue
import { useRouter } from 'vue-router';
import { computed, onMounted, ref, watch } from 'vue';

// libs
import axios from 'axios';
import { useCookies } from 'vue3-cookies';

// primevue
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

// components
import Footer from '../components/Footer.vue';
import Header from '../components/Header.vue';
import Filter from '../components/Filter.vue';
import StreamerCard from '../components/StreamerCard.vue';

// utils
import constants from '../constants';

// types
import { User } from '../types';

// vars
const router = useRouter();
const useCacheStreams = false;
const { cookies } = useCookies();
const user = <User>(<unknown>cookies.get(constants.lf_user));

// refs
const filteredStreams = ref(<any[]>[]);
const games = ref(<any[]>[]);
const isLoading = ref(true);
const mutualsOnly = ref(false);
const percentage = ref(0);
const runs = ref(0);
const selectedGameId = ref();
const streams = ref(<any[]>[]);
const totalFollowers = ref(0);
const sortByViewerCountAsc = ref(true);

// watchers
watch(mutualsOnly, () => {
  filterStreams();
});

// computed
const getSortIcon = computed(() =>
  sortByViewerCountAsc.value ? 'pi pi-sort-numeric-down' : 'pi pi-sort-numeric-up',
);

// functions
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
    const followers = data.map((follower: any) => follower.user_login);
    const nextCursor = pagination && pagination.cursor ? pagination.cursor : '';
    return { followers, nextCursor };
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error; // Handle the error appropriately in your application
  }
};

const getLiveFollowers = async () => {
  try {
    let liveFollowers = <any[]>[];
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

      const liveUsers = response.data.data.map((stream: any) => stream);
      liveFollowers = [...liveFollowers, ...liveUsers];

      liveFollowers = await Promise.all(
        liveFollowers.map(async (stream) => {
          const response = await axios({
            url: 'https://api.twitch.tv/helix/channels/followed',
            method: 'GET',
            params: {
              user_id: user.id,
              broadcaster_id: stream.user_id,
            },
          });

          return {
            ...stream,
            followed: response.data.data && response.data.data.length,
          };
        }),
      );

      streams.value = [...liveFollowers];
      filteredStreams.value = [...liveFollowers];

      filterStreams();

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
  cookies.set(constants.lf_streams, JSON.stringify(response));
  isLoading.value = false;
};

const filterStreams = () => {
  if (selectedGameId.value) {
    filteredStreams.value = streams.value.filter(
      (stream) => stream.game_id === selectedGameId.value,
    );
  } else {
    filteredStreams.value = streams.value;
  }

  filteredStreams.value = filteredStreams.value.sort((a, b) => {
    if (sortByViewerCountAsc.value) {
      return a.viewer_count - b.viewer_count;
    } else {
      return b.viewer_count - a.viewer_count;
    }
  });

  if (mutualsOnly.value) {
    filteredStreams.value = filteredStreams.value.filter((stream) => stream.followed);
  }
};

const handleFilterSelect = (gameId: string) => {
  selectedGameId.value = gameId;
  filterStreams();
};

const handleSort = () => {
  sortByViewerCountAsc.value = !sortByViewerCountAsc.value;
  filterStreams();
};

// lifecycle
onMounted(async () => {
  if (!axios.defaults.headers.common['Authorization']) {
    router.push('/login');
    return;
  }

  const cachedStreams = JSON.parse(cookies.get(constants.lf_streams) as string);
  if (cachedStreams && useCacheStreams) {
    streams.value = cachedStreams as any;
    filteredStreams.value = cachedStreams as any;
    filteredStreams.value = [...filteredStreams.value, ...filteredStreams.value];
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

.filters {
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
    > div {
      width: 100%;
    }
  }
}
</style>
