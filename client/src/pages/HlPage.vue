<template>
  <q-page>
    <div class="q-pa-md" v-if="pageStore.isLoaded">
      <div class="row items-center q-gutter-sm q-mb-sm">
        <div class="text-h6">聚寶聖域</div>
        <q-icon name="info" class="text-info" size="sm">
          <q-tooltip> 這裡封印了許多的寶物，需要擁有特殊能力的人才能嘗試解封。 </q-tooltip>
        </q-icon>
        <div class="col"></div>
      </div>
      <div v-if="!pageStore.isShowFilterCards">
        <q-btn
          class="full-width"
          color="primary"
          :label="`篩選卡片 (已選: ${pageStore.selectedCards.length})`"
          @click="pageStore.isShowFilterCards = true"
        />
      </div>
      <div class="column" v-if="pageStore.isShowFilterCards">
        <div class="col">
          <q-select
            dense
            outlined
            clearable
            multiple
            v-model="pageStore.selectedCards"
            :use-input="pageStore.isUseInput"
            fill-input
            use-chips
            input-debounce="0"
            label="篩選卡片"
            :options="cardsOptions"
            @filter="filterCards"
            @clear="pageStore.selectedCards = []"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col row items-center q-gutter-sm">
          <q-btn
            class="col"
            color="primary"
            label="隱藏"
            @click="pageStore.isShowFilterCards = false"
          />
          <q-btn color="info" label="感應" @click="getWishlistCards" />
          <q-toggle
            color="positive"
            v-model="pageStore.isUseInput"
            label="隨打即找"
            @input="onUseInputChange"
          />
        </div>
      </div>
      <div class="row items-center q-col-gutter-md q-mt-none">
        <div class="col" style="min-width: 120px">
          <q-select
            dense
            outlined
            v-model="pageStore.selectedMinMatch"
            fill-input
            label="洞數"
            :options="minMatchOptions"
            map-options
            emit-value
            class="col"
            style="min-width: 120px"
          >
          </q-select>
        </div>
        <div class="col" style="min-width: 120px">
          <q-select
            dense
            outlined
            v-model="pageStore.selectedMinStar"
            fill-input
            label="星數"
            :options="minStarOptions"
            map-options
            emit-value
            class="col"
            style="min-width: 120px"
          >
          </q-select>
        </div>
        <div class="col" style="min-width: 120px">
          <q-select
            dense
            outlined
            clearable
            v-model="pageStore.selectedPack"
            fill-input
            label="擴充包"
            :options="packsOptions"
          >
          </q-select>
        </div>
        <div>
          <q-btn
            color="primary"
            label="篩選"
            @click="
              pageStore.page = 1;
              pageStore.getPackList();
            "
          />
        </div>
        <q-form class="col" style="min-width: 120px">
          <q-input dense outlined v-model.number="pageStore.searchId" label="ID 直搜">
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                icon="search"
                type="submit"
                @click="
                  pageStore.page = 1;
                  pageStore.getPack();
                "
              />
            </template>
          </q-input>
        </q-form>
      </div>

      <div class="column items-center justify-center q-mt-md q-px-sm">
        <div class="col-auto text-no-wrap">
          共 <span class="text-h6 text-positive">??</span> 筆 ({{ pageStore.time }})
        </div>
        <div class="row items-center justify-center q-gutter-sm">
          <q-btn
            color="primary"
            label="上一頁"
            @click="pageStore.changePage(pageStore.page - 1)"
            :disable="pageStore.page === 1"
          />
          <q-btn
            color="primary"
            label="下一頁"
            @click="pageStore.changePage(pageStore.page + 1)"
            :disable="pageStore.packList.length < 20"
          />
        </div>
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
          <PackCard :pack="pack" :wishlist="pageStore.selectedCardIds">
            <template #actions>
              <q-btn
                size="sm"
                color="primary"
                label="解封(1)"
                @click="pageStore.pushPack(pack.id, 1)"
                v-if="
                  !pack.status &&
                  pack.is_high_level &&
                  userDataStore.data.permissions.hl === 2 &&
                  [1].includes(userDataStore.data.permissions.teamId)
                "
              />
              <q-btn
                size="sm"
                color="primary"
                label="解封(2)"
                @click="pageStore.pushPack(pack.id, 2)"
                v-if="
                  !pack.status &&
                  pack.is_high_level &&
                  userDataStore.data.permissions.hl === 2 &&
                  [1, 2].includes(userDataStore.data.permissions.teamId)
                "
              />
              <q-btn
                size="sm"
                color="primary"
                label="解封(3)"
                @click="pageStore.pushPack(pack.id, 3)"
                v-if="
                  !pack.status &&
                  pack.is_high_level &&
                  userDataStore.data.permissions.hl === 2 &&
                  [1, 3].includes(userDataStore.data.permissions.teamId)
                "
              />
              <q-btn
                size="sm"
                color="primary"
                label="解封(4)"
                @click="pageStore.pushPack(pack.id, 4)"
                v-if="
                  !pack.status &&
                  pack.is_high_level &&
                  userDataStore.data.permissions.hl === 2 &&
                  [1, 2, 3].includes(userDataStore.data.permissions.teamId)
                "
              />
              <q-btn
                size="sm"
                color="primary"
                label="解封(5)"
                @click="pageStore.pushPack(pack.id, 5)"
                v-if="
                  !pack.status &&
                  pack.is_high_level &&
                  userDataStore.data.permissions.hl === 2 &&
                  [1, 2, 3].includes(userDataStore.data.permissions.teamId)
                "
              />
              <div v-if="pack.status">{{ pack.status }} (team {{ pack.teamId }})</div>
            </template>
          </PackCard>
        </div>
      </div>
      <div class="column items-center justify-center q-mt-md q-px-sm">
        <div class="row items-center justify-center q-gutter-sm">
          <q-btn
            color="primary"
            label="上一頁"
            @click="pageStore.changePage(pageStore.page - 1)"
            :disable="pageStore.page === 1"
          />
          <q-btn
            color="primary"
            label="下一頁"
            @click="pageStore.changePage(pageStore.page + 1)"
            :disable="pageStore.packList.length < 20"
          />
        </div>
        <div class="col-auto text-no-wrap">
          共 <span class="text-h6 text-positive">??</span> 筆 ({{ pageStore.time }})
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { QSelect } from 'quasar';
import Notify from 'lib/Notify';
import { useUserDataStore } from 'src/stores/user-data';
import { useHlPageStore } from 'stores/hl-page';
import cardsData from 'src/data/cardsData';
import cardRareName from 'src/data/cardRareName';

const userDataStore = useUserDataStore();
const pageStore = useHlPageStore();
const router = useRouter();
const route = useRoute();

if (!userDataStore.isLogin || !userDataStore.data.permissions.hl) {
  void router.push({
    name: 'index',
  });
}

const minStarOptions = Array.from({ length: 6 }, (_, i) => ({
  label: `${i + 5} 星以上`,
  value: i + 5,
}));

const minMatchOptions = Array.from({ length: 6 }, (_, i) => ({
  label: `${i} 洞以上`,
  value: i,
}));

const packsOptions = [
  'A1',
  'A1a',
  'A2',
  'A2a',
  'A2b',
  'A3',
  'A3a',
  'A3b',
  'A4',
  'A4a',
  'A4b',
  'B1',
];

const cardsOptionsAll = [];
const cardsOptions = ref([]);
for (const cardId in cardsData) {
  const card = cardsData[cardId];
  cardsOptionsAll.push({
    ...card,
    label: `${card.chineseName} (${cardRareName[card.rare]}) [${card.pack}]`,
    value: cardId,
  });
}

const filterCards = (
  val: string,
  update: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void,
) => {
  update(() => {
    const needle = val.toLowerCase();
    cardsOptions.value = cardsOptionsAll.filter((v) => v.label.toLowerCase().indexOf(needle) > -1);
  });
};

const onUseInputChange = () => {
  localStorage.setItem('hl-isUseInput', pageStore.isUseInput.toString());
};

const getWishlistCards = async () => {
  try {
    await pageStore.getWishlistCards();
    if (!pageStore.wishlistCards.length) {
      throw new Error();
    }
    pageStore.selectedCards = pageStore.wishlistCards
      .map((v) => cardsOptionsAll.find((option) => option.value === v))
      .filter((v) => v !== null);
  } catch {
    Notify.error('尚未建立感應清單');
  }
};

onMounted(async () => {
  if (localStorage.getItem('hl-isUseInput') === 'false') {
    pageStore.isUseInput = false;
  }

  if (route.query.cardIds) {
    let cardIds = route.query.cardIds;
    if (!Array.isArray(cardIds)) {
      cardIds = [cardIds];
    }
    pageStore.selectedCards = cardIds
      .map((v) => cardsOptionsAll.find((option) => option.value === v))
      .filter((v) => v !== null);
  }
  if (route.query.minStar) {
    pageStore.selectedMinStar = parseInt(route.query.minStar as string) || 10;
  }
  if (route.query.minMatch) {
    pageStore.selectedMinMatch = parseInt(route.query.minMatch as string) || 0;
  }
  if (route.query.pack) {
    pageStore.selectedPack = (route.query.pack as string) || null;
  }
  await pageStore.getPackList();
});
</script>

<style lang="scss" scoped></style>
