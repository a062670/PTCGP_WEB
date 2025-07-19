<template>
  <q-page>
    <div class="q-pa-md" v-if="pageStore.isLoaded">
      <div class="text-h6 row items-center q-gutter-md">
        <span>
          歡迎回歸，
          <span class="text-accent">{{ pageStore.name }}</span>
          艦長
        </span>
        <q-btn color="primary" icon="refresh" @click="pageStore.getDashboard()" />
      </div>
      <q-separator class="q-my-md" />
      <div class="text-h6">
        檢測到您的坐駕有
        {{ pageStore.dashboard?.info.length }}
        個駕駛艙
      </div>
      <div class="q-pa-md row items-center q-gutter-md">
        <q-card v-for="info in pageStore.dashboard?.info" :key="info.idx">
          <q-card-section>
            <div class="row items-center q-gutter-md">
              <div class="col-auto">艙位 {{ info.idx }}</div>
              <div class="col-auto">
                {{ info.ign }}
              </div>
              <div class="col-auto">
                {{ info.id }}
              </div>
            </div>
            <q-separator dark class="q-my-sm" />
            <div class="row items-center justify-end q-gutter-md">
              <div class="col-auto" :class="info.online === 'TRUE' ? 'text-green' : 'text-red'">
                {{ info.online === 'TRUE' ? '航行中' : '待命中' }}
              </div>
              <div class="col-auto">
                <q-btn
                  color="primary"
                  label="出發"
                  @click="pageStore.patchOnline({ idx: info.idx, status: 'TRUE' })"
                />
              </div>
              <div class="col-auto">
                <q-btn
                  color="negative"
                  label="返程"
                  @click="pageStore.patchOnline({ idx: info.idx, status: 'FALSE' })"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <q-separator class="q-my-md" />
      <div class="text-h6">
        檢測到您麾下有
        {{ pageStore.dashboard?.account.length }}
        位駕駛員
      </div>
      <div class="q-pa-md row items-center q-gutter-md">
        <q-card v-for="account in pageStore.dashboard?.account" :key="account.idx">
          <q-card-section>
            <div class="row items-center q-gutter-md">
              <div class="col-auto">駕駛 {{ account.idx }}</div>
              <div class="col-auto">
                {{ account.ign }}
              </div>
              <div class="col-auto">
                {{ account.id }}
              </div>
            </div>
            <q-separator dark class="q-my-sm" />
            <div class="row items-center justify-end q-gutter-md">
              <div v-for="info in pageStore.dashboard?.info" :key="info.idx" class="col-auto">
                <q-btn
                  color="secondary"
                  :label="`艙位 ${info.idx}`"
                  @click="
                    pageStore.patchInfo({
                      idx: info.idx,
                      id: account.id,
                      ign: account.ign,
                    })
                  "
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <q-separator class="q-my-md" />
      <div class="text-h6">
        檢測到您有
        {{ pageStore.dashboard?.heartbeat.length }}
        組探索隊
      </div>
      <div class="q-pa-md row items-start q-gutter-md">
        <q-card v-for="heartbeat in pageStore.dashboard?.heartbeat" :key="heartbeat.subName">
          <q-card-section>
            <div class="row items-center q-gutter-md" :class="heartbeat.warning ? 'text-red' : ''">
              <div class="col">
                {{ heartbeat.subName }}
              </div>
              <div class="col-auto">
                {{ heartbeat.status }}
              </div>
              <div class="col-auto">
                {{ heartbeat.time }}
              </div>
            </div>
            <q-separator dark class="q-my-xs" />
            <div class="text-caption text-grey" v-html="heartbeat.info"></div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';
import { useDashboardPageStore } from 'stores/dashboard-page';

const pageStore = useDashboardPageStore();
const route = useRoute();

onMounted(async () => {
  pageStore.carId = route.params.carId as string;
  await pageStore.getDashboard();
});
onBeforeRouteUpdate(async (to) => {
  pageStore.$reset();
  pageStore.carId = to.params.carId as string;
  await pageStore.getDashboard();
});
</script>
