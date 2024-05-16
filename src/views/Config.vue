<template>
  <div class="flex-center flex-column p-1 container">
    <ProgressSpinner class="mt-5" style="width: 150px; height: 150px" v-if="isLoading" />
    <div v-if="!isLoading">
      <FloatLabel class="mt-5">
        <InputText id="featured" type="text" v-model="featured" />
        <label for="featured">Featured streamer</label>
      </FloatLabel>
      <div class="flex-between mt-2">
        <Button label="Save" @click="save" :loading="isSaving" />
        <RouterLink to="/">
          <Button severity="secondary" label="Go back" />
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// vue
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';

// db
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { featuredCollection, db } from '../store';

// primevue
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';

// utils
import { useUser } from '../user';

// vars
const toast = useToast();
const router = useRouter();
const { isAdmin } = useUser();

// refs
const featured = ref('');
const docId = ref('');
const isLoading = ref(true);
const isSaving = ref(false);

// functions
const save = async () => {
  isSaving.value = true;
  const docRef = doc(db, 'featured', docId.value);
  await updateDoc(docRef, { featured: featured.value });
  isSaving.value = false;
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Featured streamer saved.',
    life: 3000,
  });
};

// lifecycle
onMounted(() => {
  if (!isAdmin()) {
    router.push('/');
    return;
  }
  onSnapshot(featuredCollection, (snapshot) => {
    const featuredData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // @ts-ignore
    featured.value = featuredData[0]?.featured;
    // @ts-ignore
    docId.value = featuredData[0]?.id;

    isLoading.value = false;
  });
});
</script>

<style lang="scss" scoped></style>
