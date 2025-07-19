<template>
  <q-page>
    <div class="q-pa-md" v-if="pageStore.isLoaded">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">未知遺物</div>
        <q-icon name="info" class="text-info" size="sm">
          <q-tooltip> 探險隊發現了一些未知遺物，需要您協助鑑定。 </q-tooltip>
        </q-icon>
        <q-btn color="primary" icon="refresh" @click="pageStore.getThreads()" />
        <div class="col"></div>
        <div>{{ pageStore.displayTime }}</div>
      </div>
      <q-tabs v-model="pageStore.tab" class="bg-secondary text-white q-my-md" align="justify">
        <q-tab name="all" label="全部" />
        <q-tab name="gp" label="神包" />
        <q-tab name="quick" label="速覽" />
        <q-tab name="deleted" label="廢棄" />
      </q-tabs>
      <div class="row items-center q-gutter-md" v-if="pageStore.tab !== 'quick'">
        <q-input dense outlined color="white" class="col" v-model="pageStore.forCopy" readonly>
          <template v-slot:append>
            <q-btn
              round
              flat
              dense
              outline
              icon="content_copy"
              color="white"
              @click="pageStore.copyToClipboard()"
            />
          </template>
        </q-input>
        <q-toggle color="positive" v-model="pageStore.isShowImage" label="顯示圖片" />
      </div>
      <div class="row q-col-gutter-md q-mt-none" v-if="pageStore.tab !== 'quick'">
        <div
          class="col-12 col-sm-6 col-lg-4"
          v-for="thread in pageStore.displayThreads"
          :key="thread.id"
        >
          <q-card>
            <q-card-section>
              <div class="row q-gutter-md">
                <div class="col">
                  <div>{{ thread.status }} {{ thread.star }} {{ thread.pack }}</div>
                  <div class="text-subtitle1">
                    <a class="text-positive link" :href="thread.link" target="_blank">
                      {{ thread.name }}
                    </a>
                  </div>
                </div>
                <div class="col-auto text-grey-6">{{ thread.createAt }}</div>
              </div>
              <q-separator class="q-my-sm" />
              <div class="q-mx-auto" style="width: 240px" v-if="pageStore.isShowImage">
                <img class="block full-width" :src="thread.image" alt="" v-if="thread.image" />
              </div>
              <q-separator class="q-my-sm" v-if="pageStore.isShowImage" />
              <div class="row items-center justify-end q-gutter-md">
                <q-btn
                  color="primary"
                  label="復原"
                  v-if="pageStore.tab === 'deleted'"
                  @click="pageStore.restore(thread.id)"
                />
                <q-btn
                  color="negative"
                  label="銷毀"
                  v-if="pageStore.tab !== 'deleted'"
                  @click="pageStore.delete(thread.id)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div class="row q-col-gutter-xs q-mt-none" v-if="pageStore.tab === 'quick'">
        <div
          class="col-12 row items-center q-col-gutter-xs"
          v-for="thread in pageStore.queryThreads"
          :key="thread.id"
        >
          <div class="text-center" style="width: 45px">{{ thread.star }}</div>
          <div :class="{ 'text-accent': thread.status === '有效' }">{{ thread.status }}</div>
          <div>{{ thread.name }}</div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';
import { useThreadsPageStore } from 'stores/threads-page';

const pageStore = useThreadsPageStore();
const route = useRoute();

onMounted(async () => {
  pageStore.carId = route.params.carId as string;
  await pageStore.getThreads();
  pageStore.getDeletedThread();
});
onBeforeRouteUpdate(async (to) => {
  pageStore.$reset();
  pageStore.carId = to.params.carId as string;
  await pageStore.getThreads();
  pageStore.getDeletedThread();
});
</script>

<style lang="scss" scoped></style>
