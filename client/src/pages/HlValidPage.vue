<template>
  <q-page>
    <div class="q-pa-md" v-if="pageStore.isLoaded">
      <div class="row items-center q-gutter-sm q-mb-sm">
        <div class="text-h6">真寶殿堂</div>
        <q-icon name="info" class="text-info" size="sm">
          <q-tooltip> 展示著已解封的寶物，需要判定是否成功。 </q-tooltip>
        </q-icon>
        <div class="col"></div>
      </div>
      <div class="row items-center q-gutter-md">
        <q-input dense outlined color="white" class="col" :model-value="pageStore.forCopy" readonly>
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
      </div>
      <div class="row items-center q-gutter-md justify-end">
        <q-toggle color="positive" v-model="pageStore.isShowAll" label="顯示已注入" />
      </div>

      <div class="row justify-center q-mt-md" v-if="!pageStore.packList.length">
        <div class="text-h6">沒有任何結果</div>
      </div>
      <div class="row q-col-gutter-md q-mt-none" v-if="pageStore.packList.length">
        <div
          class="col-12 col-sm-6 col-md-4 col-lg-3"
          v-for="(pack, idx) in pageStore.packList"
          :key="`${idx}-${pack.id}-${pack.nick}`"
          v-show="pageStore.isShowAll || pack.status === 'valid'"
        >
          <PackCard :pack="pack" :wishlist="pageStore.wishlistCards">
            <template #actions>
              <div class="col">
                <div class="row q-gutter-sm justify-end">
                  <div>{{ pack.status === 'synced' ? '已注入' : '有效' }}</div>
                  <div>{{ pack.injectTime }}</div>
                  <div v-if="pack.teamId">(柱列 {{ pack.teamId }})</div>
                </div>
                <div
                  class="row q-gutter-sm items-center justify-end q-mt-none"
                  v-if="pack.status === 'synced' && userDataStore.data.permissions.hl >= 1"
                >
                  <q-btn
                    size="sm"
                    color="primary"
                    label="有效"
                    @click="pageStore.patchStatus(pack.id, 'valid')"
                  />
                  <!--
                  <q-btn
                    size="sm"
                    color="primary"
                    label="無效"
                    @click="pageStore.patchStatus(pack.id, 'invalid')"
                  />
                  -->
                </div>
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
import { useRouter } from 'vue-router';
import { useUserDataStore } from 'src/stores/user-data';
import { useHlValidStore } from 'stores/hl-valid';

const userDataStore = useUserDataStore();
const pageStore = useHlValidStore();
const router = useRouter();

if (!userDataStore.isLogin || !userDataStore.data.permissions.hl) {
  void router.push({
    name: 'index',
  });
}

onMounted(async () => {
  await pageStore.getWishlistCards();
  await pageStore.getPackList();
});
</script>

<style lang="scss" scoped></style>
