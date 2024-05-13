<template>
  <div class="flex">
    <small>{{ currentText() }}</small>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const loadingMessages = [
  'Calculating Streamers Likeability',
  'Compressing Games Quantum Engines',
  'Starting Viewers Simulation Layer',
  'Depixelating Stream Thumbnails',
  'Checking Mic Volumes',
  'Resolving Stream Qubits',
  'Initializing Recalibration Routines',
  "Obfuscating Twitch's Neural Database",
  'Reconfiguring Digital Emotions',
  "Syncing Subscribers' Feedback Loops",
  'Loading Streamer Empathy Algorithms',
  'Decrypting Viewer Engagement Data',
  'Optimizing Stream Latency Buffers',
  'Analyzing Chatroom Sentiment Trends',
  'Generating Stream Overlay Designs',
  'Allocating Bandwidth to Subscribers',
  'Enhancing Chat Interaction Dynamics',
  'Synchronizing Viewer Recommendations',
  'Defragmenting Viewer Interaction Grid',
  'Calculating Channel Subscription Gravity',
  'Polishing Streamer Presentation Styles',
  'Harmonizing Chatroom Emojis Harmony',
  'Diagnosing Streamer Content Pacing',
  'Tweaking Channel Audio Resonance',
  'Verifying Viewer Identity Tokens',
  'Simulating Streamers Energy Levels',
  'Amplifying Channel Community Vibes',
  'Balancing Viewer Engagement Scales',
  'Fine-tuning Streamer Reaction Times',
  'Modulating Stream Overlay Opacity',
  'Visualizing Viewer Engagement Matrix',
  'Calibrating Streamers Webcam Focus',
  'Validating Chatroom Participation Quotient',
  'Optimizing Stream Quality Bitrates',
  'Crafting Memorable Viewer Experiences',
  'Measuring Channel Content Resonance',
  'Synthesizing Virtual Streamer Elements',
  'Orchestrating Viewer Interaction Scores',
  'Personalizing Streamer Avatar Animations',
  'Debugging Viewer Subscription Threads',
  'Encoding Streamers Personality Traits',
  'Rendering Channel Community Insights',
  'Stimulating Viewer Engagement Levels',
  'Debugging Streamers Aura',
  'Sculpting Streamers Voice Resonance',
  'Refining Chatbot Response Algorithms',
  'Analyzing Viewer Behavior Patterns',
  'Boosting Streamers Charisma Levels',
  'Filtering Chatroom Noise Frequencies',
  'Upgrading Viewer Engagement Metrics',
  'Engineering Streamers Brand Presence',
  "Tracking Viewer's Content Preferences",
  'Polishing Streamers Channel Artwork',
  'Managing Viewer Attention Dynamics',
  'Navigating Streamers Content Journey',
  'Emulating Streamers Content Delivery',
  'Designing Streamers Channel Logo',
  'Debugging Streamers Stream of Consciousness',
];

const currentIndex = ref(-1); // Start with -1 to trigger random selection on mount
let timer = <number | null>null;

const currentText = () =>
  currentIndex.value !== -1
    ? loadingMessages[currentIndex.value]
    : 'Analyzing Followers Hidden Matrix';

const startTimer = () => {
  timer = setInterval(() => {
    currentIndex.value = getRandomIndex();
  }, getRandomInterval());
};

const getRandomIndex = () => Math.floor(Math.random() * loadingMessages.length);

const getRandomInterval = (): number => Math.floor(Math.random() * (3000 - 1500 + 1) + 1500); // Random interval between 2 to 4 seconds

onMounted(() => {
  startTimer();
});

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
/* Add your component styles here */
</style>
