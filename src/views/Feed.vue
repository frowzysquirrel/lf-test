<template>
  <Header :isLoading="isLoading" :percentage="percentage" />
  <div class="px-1 py-2">
    <div class="flex-between flex-align-center flex-gap-1 px-1">
      <Filter :games="games" @filter:select="handleFilterSelect" />
      <div>
        <label for="mutualsOnly" class="mr-05"> Mutuals only </label>
        <Checkbox v-model="mutualsOnly" :binary="true" name="mutualsOnly" />
      </div>
    </div>
    <div class="stream-grid px-1 py-2" v-if="streams.length">
      <StreamerCard
        v-for="stream in filteredStreams"
        :stream="stream"
        :key="stream.id"
        @update:stream="handleUpdateStream"
      />
    </div>
    <p class="text-center" v-if="streams.length && !filteredStreams.length">
      No streams match your filter criteria.
    </p>
    <Footer />
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { ref, watch } from 'vue';
import axios from 'axios';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';

import Footer from '../components/Footer.vue';
import LoadingMessages from '../components/LoadingMessages.vue';
import Header from '../components/Header.vue';
import Filter from '../components/Filter.vue';
import StreamerCard from '../components/StreamerCard.vue';

import constants from '../constants';

const router = useRouter();

const user = JSON.parse(localStorage.getItem(constants.lf_user));
const useCacheStreams = false;

// refs
const filteredStreams = ref([]);
const games = ref([]);
const isLoading = ref(true);
const mutualsOnly = ref(false);
const percentage = ref(0);
const runs = ref(0);
const selectedGameId = ref();
const streams = ref([]);
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
  localStorage.setItem(constants.lf_streams, JSON.stringify(response));
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

  if (mutualsOnly.value) {
    filteredStreams.value = filteredStreams.value.filter((stream) => stream.followed);
  }
};

const handleFilterSelect = (gameId) => {
  selectedGameId.value = gameId;
  filterStreams();
};

const handleUpdateStream = (stream) => {
  const index = streams.value.findIndex((s) => s.id === stream.id);
  streams.value[index] = stream;
};

watch(mutualsOnly, (value) => {
  filterStreams();
});

onMounted(async () => {
  if (!axios.defaults.headers.common['Authorization']) {
    router.push('/login');
    return;
  }

  const cachedStreams = localStorage.getItem(constants.lf_streams);
  if (cachedStreams && useCacheStreams) {
    streams.value = JSON.parse(cachedStreams);
    filteredStreams.value = JSON.parse(cachedStreams);
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
</style>
