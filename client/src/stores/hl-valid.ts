import { defineStore } from 'pinia';
import { Loading } from 'quasar';
import moment from 'moment';
import 'moment/dist/locale/zh-tw';
import Notify from 'lib/Notify';
import Services from 'services/Services';
import Copy from 'lib/Copy';
import cardsData from 'src/data/cardsData';
moment.locale('zh-tw');

export const useHlValidStore = defineStore('hlValid', {
  state: () => ({
    isLoaded: true,

    isShowAll: false,

    packList: [] as Pack[],

    wishlistCards: [] as string[],
  }),
  getters: {
    forCopy: (state) => {
      return state.packList
        .filter((pack) => pack.status === 'valid')
        .map((pack) => pack.friend_id || pack.nick)
        .join('+');
    },
  },
  actions: {
    async getWishlistCards() {
      try {
        Loading.show();
        const resp = await Services.getHlWishlist();
        this.wishlistCards = resp.data;
        Loading.hide();
      } catch (error) {
        console.error(error);
        Loading.hide();
      }
    },
    async getPackList() {
      try {
        Loading.show();
        const resp = await Services.getHlValid();
        resp.data.forEach((pack) => {
          const createAt = moment(pack.created_at);
          // 小於一天轉相對時間
          if (moment(createAt).diff(moment(), 'days') > -1) {
            pack.displayTime = createAt.fromNow();
          } else {
            pack.displayTime = createAt.format('MM-DD HH:mm');
          }

          if (pack.injectTime) {
            const injectTime = moment(pack.injectTime);
            // 小於一天轉相對時間
            if (moment(injectTime).diff(moment(), 'days') > -1) {
              pack.injectTime = injectTime.fromNow();
            } else {
              pack.injectTime = injectTime.format('MM-DD');
            }
          } else {
            pack.injectTime = '';
          }

          const cardIds = pack.cardIds.split(',');
          pack.cards = cardIds.map((id) => cardsData[id] || null);
          pack.countOfWishlist = cardIds.filter((id) => this.wishlistCards.includes(id)).length;
        });
        this.packList = resp.data;
        this.isLoaded = true;
        Loading.hide();
      } catch (error) {
        console.error(error);
        Loading.hide();
      }
    },
    copyToClipboard() {
      Copy.copyText(this.forCopy);
    },
    async patchStatus(id: number, status: string) {
      try {
        Loading.show();
        await Services.patchHlPackStatus(id, { status });
        await this.getPackList();
        Notify.success('已成功更新狀態');
      } catch (error) {
        console.error(error);
        Loading.hide();
        Notify.error('更新狀態失敗');
      }
    },
  },
});
