<template>
  <Header :isLoading="isLoading" :percentage="percentage" />
  <div class="px-1 py-2">
    <!-- <Filter class="ml-1" /> -->
    <div class="stream-grid px-1 py-2" v-if="streams.length">
      <a
        :href="`https://twitch.tv/${stream.user_name}`"
        :key="stream.id"
        rel="noopener noreferrer"
        target="_blank"
        v-for="stream in streams"
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
const isLoading = ref(true);
const streams = ref([]);
const percentage = ref(0);
const runs = ref(0);
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
      // if (liveFollowers.length) {
      //   break;
      // }
      runs.value += 100;
      percentage.value = Math.round((runs.value / totalFollowers.value) * 100);
    } while (cursor);

    return liveFollowers;
  } catch (error) {
    console.error('Error fetching live followers:', error);
    throw error; // Handle the error appropriately in your application
  }
};

const getGames = async () => {
  try {
    const response = await axios({
      url: 'https://api.twitch.tv/helix/games/top',
      method: 'GET',
      params: {
        first: 100,
      },
    });

    return response.data.data.map((game) => ({
      name: game.name,
      code: game.id,
    }));
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error; // Handle the error appropriately in your application
  }
};

onMounted(async () => {
  if (!axios.defaults.headers.common['Authorization']) {
    router.push('/login');
    return;
  }

  // uncomment this block to cache streams
  // const cachedStreams = localStorage.getItem('lf2_streamsstreams');
  // if (cachedStreams) {
  //   streams.value = JSON.parse(cachedStreams);
  //   streams.value = [
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //     ...streams.value,
  //   ];
  //   isLoading.value = false;
  //   return;
  // }

  getLiveFollowers()
    .then((response) => {
      // streams.value = response;
      localStorage.setItem('lf2_streamsstreams', JSON.stringify(response));
      isLoading.value = false;
    })
    .catch((error) => {
      console.error('Error:', error);
    });
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
