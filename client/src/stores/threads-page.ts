import { defineStore } from 'pinia';
import { Loading } from 'quasar';
import moment from 'moment';
import 'moment/dist/locale/zh-tw';
import Notify from 'lib/Notify';
import Copy from 'lib/Copy';
import Services from 'services/Services';
moment.locale('zh-tw');

export const useThreadsPageStore = defineStore('threadsPage', {
  state: () => ({
    isLoaded: false,
    carId: '',
    displayTime: '',
    threads: [] as Thread[],
    deletedThreads: [] as string[],
    tab: 'all',
    isShowImage: false,
  }),
  getters: {
    forCopy() {
      return this.displayThreads.map((thread) => thread.friendId).join('+');
    },
    displayThreads(state) {
      if (state.tab === 'all') {
        // 不在 deletedThreads 的所有 threads
        return state.threads.filter((thread) => !state.deletedThreads.includes(thread.id));
      }
      if (state.tab === 'gp') {
        // 不在 deletedThreads 且 status 是 "有效" 的 threads
        return state.threads.filter(
          (thread) => !state.deletedThreads.includes(thread.id) && thread.status === '有效',
        );
      }
      if (state.tab === 'deleted') {
        // 在 deletedThreads 的所有 threads
        return state.threads.filter((thread) => state.deletedThreads.includes(thread.id));
      }
    },
    queryThreads(state) {
      return [
        ...state.threads.filter(
          (thread) => !state.deletedThreads.includes(thread.id) && thread.status === '測試',
        ),
        ...state.threads.filter(
          (thread) => !state.deletedThreads.includes(thread.id) && thread.status === '有效',
        ),
      ];
    },
  },
  actions: {
    async getThreads() {
      try {
        Loading.show();
        const resp = await Services.getThreads(this.carId);
        resp.data.threads.forEach((thread) => {
          const createAt = moment(thread.createAt);
          // 小於一天轉相對時間
          if (moment(createAt).diff(moment(), 'days') > -1) {
            thread.createAt = createAt.fromNow();
          } else {
            thread.createAt = createAt.format('MM-DD HH:mm');
          }
        });
        this.threads = resp.data.threads;
        this.displayTime = moment(resp.data.time).format('MM-DD HH:mm');
        this.isLoaded = true;
        Loading.hide();
      } catch {
        Loading.hide();
        Notify.error('獲取未知遺物失敗，請稍後再試');
      }
    },
    getDeletedThread() {
      try {
        const deletedThreads = localStorage.getItem('deletedThreads');
        if (deletedThreads) {
          // 只留200個
          this.deletedThreads = JSON.parse(deletedThreads).slice(0, 200);
        }
      } catch {
        this.deletedThreads = [];
      }
    },
    setDeletedThread() {
      localStorage.setItem('deletedThreads', JSON.stringify(this.deletedThreads));
    },
    delete(id: string) {
      this.deletedThreads.unshift(id);
      this.setDeletedThread();
    },
    restore(id: string) {
      this.deletedThreads = this.deletedThreads.filter((thread) => thread !== id);
      this.setDeletedThread();
    },
    copyToClipboard() {
      Copy.copyText(this.forCopy);
    },
  },
});
