import { defineStore } from 'pinia';
import { Loading } from 'quasar';
import moment from 'moment';
import 'moment/dist/locale/zh-tw';
import Notify from 'lib/Notify';
import Services from 'services/Services';
moment.locale('zh-tw');

export const useHlSettingStore = defineStore('hlSetting', {
  state: () => ({
    isLoaded: true,

    friendIdList: [] as FriendId[],

    isUseInput: true,
    selectedCards: [] as Card[],

    wishlist: [] as string[],
    wishlistString: '',

    cardsOptionsAll: [] as (Card & { label: string; value: string })[],
  }),
  getters: {},
  actions: {
    async getWishlist() {
      try {
        Loading.show();
        const resp = await Services.getHlWishlist();
        this.wishlist = resp.data;
        if (!this.wishlist.length) {
          try {
            const wishlistCardsStr = localStorage.getItem('hl_wishlist_cards');
            if (wishlistCardsStr) {
              const wishlistCards = JSON.parse(wishlistCardsStr);
              this.wishlist = wishlistCards;
            }
          } catch {
            //
          }
        }
        Loading.hide();
      } catch (error) {
        console.error(error);
        Loading.hide();
      }
    },
    async putWishlist() {
      try {
        Loading.show();
        await Services.putHlWishlist({ wishlist: this.selectedCards.map((v) => v.cardId) });
        localStorage.removeItem('hl_wishlist_cards');
        Notify.success('感應成功');
        Loading.hide();
      } catch (error) {
        console.error(error);
        Loading.hide();
      }
    },
    async getFriendIdList() {
      try {
        Loading.show();
        const resp = await Services.getHlFriendId();
        this.friendIdList = resp.data;
        this.isLoaded = true;
        Loading.hide();
      } catch (error) {
        console.error(error);
        Loading.hide();
      }
    },
    async patchFriendId(id: number, friend_id: string) {
      console.log(id, friend_id);
      try {
        Loading.show();
        await Services.patchHlFriendId({ id, friend_id });
        Loading.hide();
        Notify.success('更新成功');
      } catch (error) {
        console.error(error);
        Loading.hide();
        Notify.error('更新失敗');
      }
      this.getFriendIdList();
    },
    updateSelectedCards() {
      this.selectedCards = this.wishlist
        .map((v) => this.cardsOptionsAll.find((option) => option.value === v))
        .filter((v) => v !== null);
    },
    exportWishlist() {
      this.wishlistString = JSON.stringify(this.wishlist);
      Notify.success('導出成功');
    },
    importWishlist() {
      try {
        this.wishlist = JSON.parse(this.wishlistString);
        if (!Array.isArray(this.wishlist)) {
          throw new Error('格式錯誤');
        }
        this.updateSelectedCards();
        Notify.success('導入成功');
      } catch (error) {
        console.error(error);
        Notify.error('導入失敗');
      }
    },
  },
});
