<template>
  <q-page class="row items-center justify-evenly">
    <div v-if="!userDataStore.isLogin">
      <q-btn
        label="Discord 登入"
        :href="discordLoginUrl"
        color="primary"
        size="lg"
        @click="userDataStore.logout()"
      />
    </div>
    <div v-else>
      <q-btn
        label="4 車"
        color="primary"
        size="lg"
        :to="{ name: 'dashboard', params: { carId: '4' } }"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserDataStore } from 'src/stores/user-data';

const userDataStore = useUserDataStore();

const discordLoginUrl = computed(() => {
  return `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${process.env.DISCORD_REDIRECT_URI}&response_type=code&scope=identify`;
});
</script>
