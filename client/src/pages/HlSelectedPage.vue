<template>
  <q-page>
    <div class="q-pa-md" v-if="pageStore.isLoaded">
      <div class="row items-center q-gutter-sm q-mb-sm">
        <div class="text-h6">解封佇列({{ pageStore.teamId }})</div>
        <q-icon name="info" class="text-info" size="sm">
          <q-tooltip> 塵封的寶物即將甦醒，請與之建立羈絆。 </q-tooltip>
        </q-icon>
        <div class="col"></div>
        <q-badge outline rounded color="accent">
          解封：{{ pageStore.countOfSelectedPack }}
        </q-badge>
        <q-badge outline rounded color="accent"> 羈絆：{{ pageStore.countOfPartnerPack }} </q-badge>
      </div>

      <q-form
        class="q-mb-sm"
        v-if="
          userDataStore.data.permissions.hl === 2 &&
          (userDataStore.data.permissions.teamId === 1 || ![1, 3].includes(pageStore.teamId))
        "
        @submit="pageStore.batchPushPack"
      >
        <q-input dense outlined v-model="pageStore.cardIds" placeholder="12345 67890">
          <template v-slot:after>
            <q-btn
              color="primary"
              label="批次解封"
              type="submit"
              @click="pageStore.batchPushPack"
            />
          </template>
        </q-input>
      </q-form>
      <div class="row items-center justify-center q-gutter-sm q-mb-sm">
        <q-btn color="primary" @click="pageStore.postPartnerMulti(userDataStore.data.id, 2)">
          羈絆 2
          <q-icon name="my_location" size="xs" class="q-ml-xs q-mt-xs" />
        </q-btn>
        <q-btn color="primary" @click="pageStore.postPartnerMulti(userDataStore.data.id, 3)">
          羈絆 3
          <q-icon name="my_location" size="xs" class="q-ml-xs q-mt-xs" />
        </q-btn>
        <q-btn color="primary" @click="pageStore.postPartnerMulti(userDataStore.data.id, 4)">
          羈絆 4
          <q-icon name="my_location" size="xs" class="q-ml-xs q-mt-xs" />
        </q-btn>
        <q-btn color="primary" @click="pageStore.postPartnerMulti(userDataStore.data.id, 5)">
          羈絆 5
          <q-icon name="my_location" size="xs" class="q-ml-xs q-mt-xs" />
        </q-btn>
      </div>

      <div class="row justify-center q-mt-md" v-if="!pageStore.packList.length">
        <div class="text-h6">沒有任何結果</div>
      </div>
      <div class="row q-col-gutter-md q-mt-none" v-if="pageStore.packList.length">
        <div
          class="col-12 col-sm-6 col-md-4 col-lg-3"
          v-for="(pack, idx) in pageStore.packList"
          :key="`${idx}-${pack.id}-${pack.nick}`"
        >
          <PackCard :pack="pack" :wishlist="pageStore.wishlistCards">
            <template #actions>
              <div class="col-auto" v-if="pack.status === 'selected' && pack.is_high_level">
                <q-btn
                  size="sm"
                  color="primary"
                  label="建立羈絆"
                  @click="pageStore.postPartner(userDataStore.data.id, [pack.id])"
                  v-if="!pack.isPartner"
                />
                <q-btn
                  outline
                  size="sm"
                  color="white"
                  label="已建立羈絆"
                  disable
                  v-if="pack.isPartner"
                />
              </div>
              <div class="col-auto" v-if="pack.status === 'sent_to_friend'">
                <q-btn
                  outline
                  size="sm"
                  color="white"
                  label="注入準備中"
                  disable
                  v-if="pack.isPartner"
                />
              </div>
            </template>
          </PackCard>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
import { useUserDataStore } from 'src/stores/user-data';
import { useHlSelectedPageStore } from 'stores/hl-selected-page';

const userDataStore = useUserDataStore();
const pageStore = useHlSelectedPageStore();
const router = useRouter();
const route = useRoute();

if (!userDataStore.isLogin || !userDataStore.data.permissions.hl) {
  void router.push({
    name: 'index',
  });
}

onMounted(async () => {
  pageStore.teamId = Number(route.params.teamId);
  await pageStore.getWishlistCards();
  await pageStore.getPackList();
});

onBeforeRouteUpdate(async (to) => {
  pageStore.teamId = Number(to.params.teamId);
  await pageStore.getPackList();
});
</script>

<style lang="scss" scoped></style>
