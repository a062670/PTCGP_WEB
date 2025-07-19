import { defineStore } from 'pinia';

export const useAppDataStore = defineStore('appData', {
  state: () => ({
    leftDrawerOpen: false,
    carOptions: [
      {
        label: '1 車',
        value: '1',
      },
      {
        label: '2 車',
        value: '2',
      },
      {
        label: '4 車',
        value: '4',
      },
      {
        label: '7 車',
        value: '7',
      },
    ],
    selectedCar: null,
  }),
  getters: {},
  actions: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
  },
});
