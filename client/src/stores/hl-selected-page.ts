import { defineStore } from 'pinia';
import { Loading } from 'quasar';
import moment from 'moment';
import 'moment/dist/locale/zh-tw';
import Notify from 'lib/Notify';
import Services from 'services/Services';
import cardsData from 'src/data/cardsData';
moment.locale('zh-tw');

export const useHlSelectedPageStore = defineStore('hlSelectedPage', {
  state: () => ({
    isLoaded: true,

    teamId: 1,

    packList: [] as Pack[],

    wishlistCards: [] as string[],

    cardIds: '',
    errorCardIds: [] as string[],
  }),
  getters: {
    countOfSelectedPack: (state) => {
      return state.packList.filter((pack) => pack.status === 'selected').length;
    },
    countOfPartnerPack: (state) => {
      return state.packList.filter((pack) => pack.status === 'selected' && pack.isPartner).length;
    },
    selectedPack3: (state) => {
      return state.packList.filter(
        (pack) =>
          pack.status === 'selected' &&
          pack.cards.filter((card) => state.wishlistCards.includes(card.cardId)).length > 3,
      );
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
        const resp = await Services.getHlSelected(this.teamId);
        resp.data.forEach((pack) => {
          const createAt = moment(pack.created_at);
          // 小於一天轉相對時間
          if (moment(createAt).diff(moment(), 'days') > -1) {
            pack.displayTime = createAt.fromNow();
          } else {
            pack.displayTime = createAt.format('MM-DD HH:mm');
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
    async postPartner(dcid: number, packId: number[]) {
      try {
        Loading.show();
        const resp = await Services.postHlPackPartner({ dcid, packId });
        if (resp.data.error.length > 0) {
          Notify.error(`建立羈絆失敗: ${resp.data.error.join(', ')}`);
        }
        if (resp.data.success.length > 0) {
          Notify.success(`已成功建立羈絆: ${resp.data.success.join(', ')}`);
        }
        await this.getPackList();
      } catch (error) {
        console.error(error);
        Loading.hide();
        Notify.error('建立羈絆失敗');
      }
    },
    async postPartnerMulti(dcid: number, countOfWishlist: number) {
      const list = this.packList.filter(
        (pack) =>
          pack.status === 'selected' &&
          !pack.isPartner &&
          pack.countOfWishlist >= countOfWishlist &&
          pack.is_high_level,
      );
      if (list.length === 0) {
        Notify.error('沒有符合條件的寶物');
        return;
      }
      await this.postPartner(
        dcid,
        list.map((pack) => pack.id),
      );
    },
    async batchPushPack() {
      Loading.show();
      const ids = this.cardIds.split(' ');
      if (ids.length === 0) {
        Notify.error('請輸入有效的卡包 ID');
        return;
      }
      this.errorCardIds = [];
      for (const id of ids) {
        if (id) {
          await this.pushPack(id);
        }
      }
      await this.getPackList();
      this.cardIds = this.errorCardIds.join(' ');
      Loading.hide();
    },
    async pushPack(id: number) {
      try {
        await Services.postHlPushPack({ id, teamId: this.teamId });
        Notify.success(`已添加至解封佇列: ${id}`);
      } catch (error) {
        console.log(error);
        this.errorCardIds.push(id);
      }
    },
  },
});
