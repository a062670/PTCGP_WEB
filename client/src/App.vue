<template>
  <suspense>
    <router-view />
  </suspense>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useUserDataStore } from 'stores/user-data';

const userData = useUserDataStore();

const isLoaded = ref(false);

userData.$reset();

onBeforeMount(async () => {
  // 有登入的話撈資訊
  try {
    await userData.updateData();
  } catch {
    console.error('更新使用者資訊失敗');
  }

  isLoaded.value = true;
});
</script>
