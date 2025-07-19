<template>
  <div></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserDataStore } from 'src/stores/user-data';

const route = useRoute();
const userDataStore = useUserDataStore();

onMounted(async () => {
  const code = route.query.code;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  await userDataStore.login({ code: code as string, redirectUri: redirectUri });
});
</script>
