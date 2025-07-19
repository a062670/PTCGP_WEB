<template>
  <q-page>
    <div class="q-pa-md" v-if="pageStore.isLoaded">
      <div class="row items-center q-gutter-sm q-mb-sm">
        <div class="text-h6">羈絆代碼</div>
        <q-icon name="info" class="text-info" size="sm">
          <q-tooltip> 請設定好您的羈絆代碼，以便與寶物建立羈絆。 </q-tooltip>
        </q-icon>
        <div class="col"></div>
      </div>
      <div class="row justify-center q-mt-md" v-if="!pageStore.friendIdList.length">
        <div class="text-h6">沒有任何結果</div>
      </div>
      <div class="row q-col-gutter-md q-mt-none" v-if="pageStore.friendIdList.length">
        <div class="col-auto" v-for="friendId in pageStore.friendIdList" :key="friendId.id">
          <q-card>
            <q-card-section>
              <div class="row items-center cursor-pointer">
                {{ friendId.friend_id }}
                <q-icon name="edit" class="text-info q-ml-sm" size="sm" />
                <q-popup-edit
                  v-model="friendId.friend_id"
                  class="bg-dark text-white"
                  v-slot="scope"
                  @save="(val) => pageStore.patchFriendId(friendId.id, val)"
                >
                  <q-input
                    dark
                    color="white"
                    v-model="scope.value"
                    maxlength="16"
                    dense
                    autofocus
                    counter
                    @keyup.enter="scope.set"
                  >
                    <template v-slot:append>
                      <q-btn
                        round
                        icon="send"
                        flat
                        dense
                        v-close-popup
                        @click="scope.set"
                        size="sm"
                      />
                    </template>
                  </q-input>
                </q-popup-edit>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <q-separator class="q-my-lg" />
      <div class="row items-center q-gutter-sm q-mb-sm">
        <div class="text-h6">感應祭壇</div>
        <q-icon name="info" class="text-info" size="sm">
          <q-tooltip> 請標記您想獲得的寶物，寶物出現時會您會感應到。 </q-tooltip>
        </q-icon>
        <div class="col"></div>
      </div>

      <div class="column">
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
        <div class="col row items-center q-gutter-md q-mt-none">
          <q-btn color="info" label="↓" @click="pageStore.exportWishlist()" />
          <q-btn color="positive" label="↑" @click="pageStore.importWishlist()" />
          <div class="col q-ml-none"></div>
          <q-toggle
            color="positive"
            v-model="pageStore.isUseInput"
            label="隨打即找"
            @input="onUseInputChange"
          />
          <q-btn color="primary" label="感應" @click="pageStore.putWishlist()" />
        </div>
        <div class="col q-mt-md">
          <!-- focus->全選 -->
          <q-input
            ref="wishlistInput"
            dense
            outlined
            v-model="pageStore.wishlistString"
            type="textarea"
            autogrow
            label="感應數據"
            @focus="wishlistInput.select()"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { QSelect } from 'quasar';
import { useUserDataStore } from 'src/stores/user-data';
import { useHlSettingStore } from 'stores/hl-setting';
import cardsData from 'src/data/cardsData';
import cardRareName from 'src/data/cardRareName';

const userDataStore = useUserDataStore();
const pageStore = useHlSettingStore();
const router = useRouter();

const wishlistInput = ref<HTMLInputElement>();

if (!userDataStore.isLogin || !userDataStore.data.permissions.hl) {
  void router.push({
    name: 'index',
  });
}

const cardsOptions = ref([]);
pageStore.cardsOptionsAll = [];
for (const cardId in cardsData) {
  const card = cardsData[cardId];
  pageStore.cardsOptionsAll.push({
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
    cardsOptions.value = pageStore.cardsOptionsAll.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    );
  });
};

const onUseInputChange = () => {
  localStorage.setItem('hl-isUseInput', pageStore.isUseInput.toString());
};

onMounted(async () => {
  await pageStore.getFriendIdList();
  await pageStore.getWishlist();
  pageStore.updateSelectedCards();
});
</script>

<style lang="scss" scoped></style>
