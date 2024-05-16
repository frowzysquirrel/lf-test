<template>
  <div v-if="didUserAcceptCookies">
    <Header :isLoading="isLoading && !rateLimitHit" :percentage="percentage" />
    <p class="flex-between flex-align-center px-2 stats">
      <small>
        Successfully parsed
        {{ runs > totalFollowers ? formatNumber(totalFollowers) : formatNumber(runs) }} out of
        {{ formatNumber(totalFollowers) }} followers. Discovered
        {{ formatNumber(streams.length) }} live streams.
      </small>
      <div v-if="rateLimitHit">
        <small>⚠️ Twitch API is taking a nap! Retrying in {{ retryCountdown }} seconds...</small>
      </div>
    </p>
    <div class="px-1 pt-1 pb-2">
      <div class="flex-start flex-align-center flex-gap-2 px-1 filters" v-if="streams.length">
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
      <div class="stream-grid px-1 py-2">
        <StreamerCard featured  v-if="featuredStreamer" :stream="featuredStreamer as any" />
        <StreamerCard v-for="stream in filteredStreams" :stream="stream" :key="stream.id" v-if="streams.length" />
      </div>
      <p class="text-center" v-if="streams.length && !filteredStreams.length">
        No streams match your filter criteria.
      </p>
      <Footer />
    </div>
  </div>
</template>

<script lang="ts" setup>
// vue
import { useRouter } from 'vue-router';
import { computed, onMounted, ref, watch } from 'vue';

// libs
import axios from 'axios';
import { useCookies } from 'vue3-cookies';

// db
import { onSnapshot } from 'firebase/firestore';
import { featuredCollection } from '../store';

// primevue
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

import { useConfirm } from 'primevue/useconfirm';

// components
import Footer from '../components/Footer.vue';
import Header from '../components/Header.vue';
import Filter from '../components/Filter.vue';
import StreamerCard from '../components/StreamerCard.vue';

// utils
import constants from '../constants';

// types
import { User } from '../types';

// constants
const USE_TEST_USER = false;
const USE_CACHE_STREAMS = false;

// vars
const { cookies } = useCookies();
const confirm = useConfirm();
const router = useRouter();
const user = <User>(<unknown>cookies.get(constants.lf_user));
const token = cookies.get(constants.lf_token);

if (user && USE_TEST_USER) {
  axios.defaults.headers.common['Authorization'] = `Bearer 77z2l0i0amdialdxhvh6ey0rzhxtp4`;
  user.id = '102762045';
}

// refs
const cursor = ref('');
const didUserAcceptCookies = ref(<boolean>false);
const featured = ref('');
const featuredStreamer = ref(null);
const filteredStreams = ref(<any[]>[]);
const games = ref(<any[]>[]);
const isLoading = ref(true);
const mutualsOnly = ref(false);
const percentage = ref(0);
const rateLimitHit = ref(false);
const retryCountdown = ref(10);
const runs = ref(0);
const selectedGameId = ref();
const sortByViewerCountAsc = ref(true);
const streams = ref(<any[]>[]);
const totalFollowers = ref(0);
const twitchError = ref(false);

// watchers
watch(mutualsOnly, () => {
  filterStreams();
});

// computed
const getSortIcon = computed(() =>
  sortByViewerCountAsc.value ? 'pi pi-sort-numeric-down' : 'pi pi-sort-numeric-up',
);

// functions
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

  // filter out featured if present
  if (featuredStreamer.value) {
    // @ts-ignore
    filteredStreams.value = filteredStreams.value.filter((stream) => stream.user_id !== featuredStreamer.value?.user_id);
  }
};

const formatNumber = (number: number) => {
  return new Intl.NumberFormat().format(number);
};

const getFollowers = async () => {
  try {
    const response = await axios({
      url: 'https://api.twitch.tv/helix/channels/followers',
      method: 'GET',
      params: {
        broadcaster_id: user.id,
        first: 100,
        after: cursor.value, // Pass the cursor for pagination
      },
    });

    const { data, pagination, total } = response.data;
    totalFollowers.value = total;
    const followers = data.map((follower: any) => follower.user_login);
    const nextCursor = pagination && pagination.cursor ? pagination.cursor : '';
    return { followers, nextCursor };
  } catch (error) {
    handleTwitchError(error);
  }
};

const getLiveFollowers = async () => {
  try {
    let liveFollowers = <any[]>[];
    do {
      const followers = await getFollowers();
      cursor.value = followers?.nextCursor;

      const liveStreams = await getStreams(followers?.followers);
      const mutuals = await getMutuals(liveStreams);

      liveFollowers = [...liveFollowers, ...mutuals];
      
      streams.value = [...liveFollowers];
      filteredStreams.value = [...liveFollowers];

      filterStreams();

      if (liveFollowers.length) {
        games.value = Array.from(new Set(liveFollowers.map((stream) => stream.game_id))).map(
          (id) => ({
            id,
            name: liveFollowers.find((stream) => stream.game_id === id).game_name,
          }),
        );
      }

      runs.value += 100;
      percentage.value = Math.round((runs.value / totalFollowers.value) * 100);
    } while (cursor.value && !twitchError.value && !rateLimitHit.value);

    return liveFollowers;
  } catch (error) {
    console.error('Error fetching live followers:', error);
    throw error; // Handle the error appropriately in your application
  }
};

const getMutuals = async (liveUsers: any) => {
  return await Promise.all(
    liveUsers.map(async (stream: any) => {
      try {
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
      } catch (error) {
        handleTwitchError(error);
      }
    }),
  );
};

const getStreams = async (followers: any) => {
  try {
    const response = await axios({
      url: `https://api.twitch.tv/helix/streams?first=100&user_login=${followers.join(
        '&user_login=',
      )}&type=live`,
      method: 'GET',
    });

    return response.data.data;
  } catch (error) {
    handleTwitchError(error);
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

const onAcceptCookies = () => {
  if (!axios.defaults.headers.common['Authorization'] || !user) {
    router.push('/login');
    return;
  }

  const cachedStreams = JSON.parse(cookies.get(constants.lf_streams) as string);
  if (cachedStreams && USE_CACHE_STREAMS) {
    streams.value = cachedStreams as any;
    filteredStreams.value = cachedStreams as any;
    filteredStreams.value = [...filteredStreams.value, ...filteredStreams.value];
    isLoading.value = false;
    return;
  }

  const testUsers = ['flashforce', 'frowzysquirrel'];

  if (testUsers.includes(user.display_name.toLowerCase())) {
    console.log('Logged in as:', user.display_name, user.id, token);
  }

  fetchData();

  onSnapshot(featuredCollection, async (snapshot) => {
    const featuredData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // @ts-ignore
    featured.value = featuredData[0]?.featured;
    const featuredStream = await axios({
      url: `https://api.twitch.tv/helix/streams?user_login=${featured.value}&type=live`,
      method: 'GET',
    });

    if (featuredStream.data.data) {
      const getMutual = await getMutuals(featuredStream.data.data);
      featuredStreamer.value = getMutual[0];
    }
  });
};

const handleTwitchError = (error: any) => {
  twitchError.value = true;

  if (error.response && error.response.status === 429) {
    if (!rateLimitHit.value) {
    rateLimitHit.value = true;
    const retryInterval = setInterval(() => {
      retryCountdown.value -= 1;
      if (retryCountdown.value === 0) {
        rateLimitHit.value = false;
        retryCountdown.value = 10;
        twitchError.value = false;
        fetchData();
        clearInterval(retryInterval);
      }
    }, 1000);
    }

  }
};

// lifecycle
onMounted(async () => {
  didUserAcceptCookies.value = !!localStorage.getItem('lf_cookiesAccepted');

  if (!didUserAcceptCookies.value) {
    confirm.require({
      message: 'This website uses cookies to ensure you get the best experience',
      header: 'Coookies Consent Required',
      icon: 'pi pi-exclamation-triangle',
      rejectClass: 'p-button-secondary p-button-outlined',
      rejectLabel: 'Reject',
      acceptLabel: 'Accept',
      onHide: () => {
        window.location.href = '/';
      },
      accept: () => {
        localStorage.setItem('lf_cookiesAccepted', 'true');
        didUserAcceptCookies.value = !!localStorage.getItem('lf_cookiesAccepted');
        onAcceptCookies();
      },
      reject: () => {
        window.location.href = '/';
      },
    });
  } else {
    onAcceptCookies();
  }
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

.stats {
  @media screen and (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
