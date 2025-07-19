import { defineStore } from 'pinia';
import { Loading } from 'quasar';
import moment from 'moment';
import 'moment/dist/locale/zh-tw';
import Notify from 'lib/Notify';
import Services from 'services/Services';
import cardsData from 'src/data/cardsData';
moment.locale('zh-tw');

export const useHlPageStore = defineStore('hlPage', {
  state: () => ({
    isLoaded: true,

    isShowFilterCards: false,
    isUseInput: true,

    searchId: '',

    selectedCards: [] as Card[],
    selectedCardIds: [] as string[],
    selectedMinMatch: 0,
    selectedMinStar: 10,
    selectedPack: null as string | null,

    wishlistCards: [] as string[],

    packList: [] as Pack[],
    page: 1,
    time: '',
  }),
  getters: {},
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
        const filter = {
          minStar: this.selectedMinStar,
          cardIds: this.selectedCards?.map((v) => v.cardId) || [],
          minMatch: this.selectedMinMatch,
          pack: this.selectedPack,
          page: this.page,
        };
        this.router.replace({ query: filter });
        const resp = await Services.getHlPacks(filter);
        resp.data.data.forEach((pack) => {
          const createAt = moment(pack.created_at);
          // 小於一天轉相對時間
          if (moment(createAt).diff(moment(), 'days') > -1) {
            pack.displayTime = createAt.fromNow();
          } else {
            pack.displayTime = createAt.format('MM-DD');
          }
          pack.cards = pack.cardIds.split(',').map((id) => cardsData[id] || null);
        });
        this.packList = resp.data.data;
        this.time = moment().format('YYYY-MM-DD HH:mm');
        this.selectedCardIds = this.selectedCards?.map((v) => v.cardId) || [];
        this.isLoaded = true;
        Loading.hide();
      } catch (error) {
        console.log(error);
        Loading.hide();
        Notify.error('獲取聚寶聖域失敗，請稍後再試');
      }
    },
    changePage(page: number) {
      this.page = page;
      this.getPackList();
    },
    async getPack() {
      try {
        Loading.show();
        const resp = await Services.getHlPack(this.searchId);
        const createAt = moment(resp.data.created_at);
        // 小於一天轉相對時間
        if (moment(createAt).diff(moment(), 'days') > -1) {
          resp.data.displayTime = createAt.fromNow();
        } else {
          resp.data.displayTime = createAt.format('MM-DD HH:mm');
        }
        resp.data.cards = resp.data.cardIds.split(',').map((id) => cardsData[id] || null);
        this.packList = [resp.data];
        this.total = 1;
        this.totalPages = 1;
        this.time = moment().format('YYYY-MM-DD HH:mm');
        this.isLoaded = true;
        Loading.hide();
      } catch (error) {
        console.log(error);
        Loading.hide();
        Notify.error('獲取聚寶聖域失敗，請稍後再試');
      }
    },
    async pushPack(id: number, teamId: number) {
      try {
        Loading.show();
        const resp = await Services.postHlPushPack({ id, teamId });
        console.log(resp);
        Loading.hide();
        Notify.success('已添加至解封佇列');
        this.getPackList();
      } catch (error) {
        console.log(error);
        Loading.hide();
        Notify.error('解封失敗，請稍後再試');
      }
    },
  },
});
