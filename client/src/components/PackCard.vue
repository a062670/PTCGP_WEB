<template>
  <q-card>
    <q-card-section>
      <div class="">
        <div class="row q-gutter-sm q-mb-xs items-center">
          <q-badge outline rounded color="info"> {{ pack.pack }} </q-badge>
          <q-badge outline rounded color="info"> {{ packName[pack.pack_id] }} </q-badge>
          <q-badge outline rounded color="info" v-if="pack.language">
            {{ languageInfo[pack.language] }}
          </q-badge>
          <q-icon
            name="recycling"
            size="xs"
            color="info"
            v-if="pack.inject_times > 0 && pack.status !== 'valid'"
          />
          <q-icon name="child_care" size="xs" color="orange" v-if="!pack.is_high_level" />
          <div class="col"></div>
          <div class="col-auto text-yellow">
            {{ pack.totalStar }}
            <q-icon name="star" size="xs" color="yellow" />
          </div>
        </div>
        <div class="row q-gutter-sm">
          <div class="col-auto">
            {{ pack.id || 0 }}
          </div>
          <div class="col-auto">
            {{ pack.nick }}
          </div>
          <div class="col"></div>
          <div class="col-auto text-positive" v-if="pack.countOfWishlist">
            {{ pack.countOfWishlist || 0 }}
            <q-icon name="my_location" size="xs" color="positive" />
          </div>
        </div>
        <div class="row q-gutter-sm" v-if="pack.friend_id">
          <div class="col-auto text-info">
            {{ pack.friend_id }}
          </div>
        </div>
      </div>
      <q-separator class="q-my-sm" />
      <div class="row items-center justify-center">
        <template v-for="(card, idx) in pack.cards">
          <div class="col-4 q-pa-xs" :key="`${idx}-${card.cardId}`" v-if="card">
            <img
              class="block full-width"
              :class="{ outline: wishlist.includes(card.cardId) }"
              :src="`https://car-fs.gagu.dev/PackViewer/images/${card.image}.png`"
              :alt="`${card.chineseName}(${card.rareName})[${card.pack}]`"
              :title="`${card.chineseName}(${card.rareName})[${card.pack}]`"
            />
          </div>
        </template>
      </div>

      <q-separator class="q-my-sm" />
      <div class="row items-center q-gutter-sm">
        <div class="col-auto text-grey-6">{{ pack.displayTime }}</div>
        <div class="col text-grey-6">
          <div class="row items-center q-gutter-sm justify-end">
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
// Vue 相關
import type { PropType } from 'vue';
// 元件相關
// lib 相關
// store 相關
// data 相關
import packName from 'data/packName';
import languageInfo from 'data/languageInfo';

defineProps({
  pack: {
    type: Object as PropType<Pack>,
    default: () => ({}),
  },
  wishlist: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});
</script>

<style lang="scss" scoped>
.outline {
  outline: 5px solid $accent;
  border-radius: 10px;
  animation: pulse 1s infinite;
}
// 呼吸燈
@keyframes pulse {
  0% {
    outline-color: rgba($accent, 0);
  }
  50% {
    outline-color: rgba($accent, 1);
  }
  100% {
    outline-color: rgba($accent, 0);
  }
}
</style>
