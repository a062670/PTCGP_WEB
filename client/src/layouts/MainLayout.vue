<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="appDataStore.toggleLeftDrawer"
        />

        <q-toolbar-title class="row items-center q-gutter-sm">
          <router-link :to="{ name: 'index' }" class="text-white text-h6 no-underline">
            神包大聯盟
          </router-link>
          <q-badge outline color="accent" v-if="appDataStore.selectedCar">
            {{ appDataStore.selectedCar }}車
          </q-badge>
        </q-toolbar-title>

        <div v-if="userDataStore.isLogin">
          <q-btn-dropdown outline color="white" no-caps :label="userDataStore.data.global_name">
            <q-item>
              <q-item-section>
                {{ userDataStore.data.id }}
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="userDataStore.logout">
              <q-item-section>
                <q-item-label class="text-center">登出</q-item-label>
              </q-item-section>
            </q-item>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <!-- 下拉選單(N車) -->
    <q-drawer v-model="appDataStore.leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item>
          <q-item-section>
            <q-select
              dense
              outlined
              color="white"
              v-model="appDataStore.selectedCar"
              :options="appDataStore.carOptions"
              label="車隊"
              map-options
              emit-value
              @update:model-value="onCarChange"
            />
          </q-item-section>
        </q-item>
        <q-item
          :to="{
            name: 'dashboard',
            params: { carId: appDataStore.selectedCar },
          }"
          active-class="bg-secondary text-white"
          v-if="appDataStore.selectedCar && userDataStore.isLogin"
        >
          <q-item-section>
            <q-item-label>儀錶板</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          :to="{
            name: 'threads',
            params: { carId: appDataStore.selectedCar },
          }"
          active-class="bg-secondary text-white"
          v-if="appDataStore.selectedCar && userDataStore.isLogin"
        >
          <q-item-section>
            <q-item-label>未知遺物</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          :to="{
            name: 'hl',
          }"
          active-class="bg-secondary text-white"
          v-if="userDataStore.isLogin && userDataStore.data.permissions.hl"
        >
          <q-item-section>
            <q-item-label>聚寶聖域</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          :to="{
            name: 'hl/selected',
            params: { teamId: 1 },
          }"
          active-class="bg-secondary text-white"
          v-if="
            userDataStore.isLogin &&
            userDataStore.data.permissions.hl &&
            [1, 2, 3].includes(userDataStore.data.permissions.teamId)
          "
        >
          <q-item-section>
            <q-item-label>解封佇列(1)</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          :to="{
            name: 'hl/selected',
            params: { teamId: 2 },
          }"
          active-class="bg-secondary text-white"
          v-if="
            userDataStore.isLogin &&
            userDataStore.data.permissions.hl &&
            [1, 2, 3].includes(userDataStore.data.permissions.teamId)
          "
        >
          <q-item-section>
            <q-item-label>解封佇列(2)</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          :to="{
            name: 'hl/selected',
            params: { teamId: 3 },
          }"
          active-class="bg-secondary text-white"
          v-if="
            userDataStore.isLogin &&
            userDataStore.data.permissions.hl &&
            [1, 2, 3].includes(userDataStore.data.permissions.teamId)
          "
        >
          <q-item-section>
            <q-item-label>解封佇列(3)</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          :to="{
            name: 'hl/selected',
            params: { teamId: 4 },
          }"
          active-class="bg-secondary text-white"
          v-if="
            userDataStore.isLogin &&
            userDataStore.data.permissions.hl &&
            [1, 2, 3].includes(userDataStore.data.permissions.teamId)
          "
        >
          <q-item-section>
            <q-item-label>解封佇列(4)</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          :to="{
            name: 'hl/selected',
            params: { teamId: 5 },
          }"
          active-class="bg-secondary text-white"
          v-if="
            userDataStore.isLogin &&
            userDataStore.data.permissions.hl &&
            [1, 2, 3].includes(userDataStore.data.permissions.teamId)
          "
        >
          <q-item-section>
            <q-item-label>解封佇列(5)</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          :to="{
            name: 'hl/valid',
          }"
          active-class="bg-secondary text-white"
          v-if="userDataStore.isLogin && userDataStore.data.permissions.hl"
        >
          <q-item-section>
            <q-item-label>真寶殿堂</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          :to="{
            name: 'hl/setting',
          }"
          active-class="bg-secondary text-white"
          v-if="userDataStore.isLogin && userDataStore.data.permissions.hl"
        >
          <q-item-section>
            <q-item-label>羈絆設定</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          :to="{
            name: 'hl/account-for-change',
          }"
          active-class="bg-secondary text-white"
          v-if="userDataStore.isLogin && userDataStore.data.permissions.hl"
        >
          <q-item-section>
            <q-item-label>奴隸市場</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import { useAppDataStore } from 'src/stores/app-data';
import { useUserDataStore } from 'src/stores/user-data';

const appDataStore = useAppDataStore();
const userDataStore = useUserDataStore();
const route = useRoute();
const router = useRouter();

const onCarChange = (value: string) => {
  appDataStore.selectedCar = value;
  void router.push({
    params: { carId: value },
  });
};

onMounted(() => {
  if (route.params.carId) {
    appDataStore.selectedCar = route.params.carId;
  }
});
onBeforeRouteUpdate((to) => {
  if (to.params.carId && to.params.carId !== appDataStore.selectedCar) {
    appDataStore.selectedCar = to.params.carId;
  }
});
</script>
