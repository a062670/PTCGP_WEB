import { defineStore } from 'pinia';
import { saveAs } from 'file-saver';
import { Loading } from 'quasar';
import Notify from 'lib/Notify';
import Services from 'services/Services';

export const useHlAccountForChangeStore = defineStore('hlAccountForChange', {
  state: () => ({
    isLoaded: true,

    accountList: [] as AccountForChange[],

    packId: null as string | null,
  }),
  getters: {},
  actions: {
    async getAccountList() {
      try {
        Loading.show();
        const resp = await Services.getHlAccountListForChange();
        this.accountList = resp.data;
        Loading.hide();
      } catch (error) {
        console.error(error);
        Loading.hide();
      }
    },
    async applyAccountForChange() {
      try {
        if (!this.packId) {
          Notify.error('請選擇包');
          return;
        }
        Loading.show();
        await Services.postHlApplyAccountForChange({ packId: this.packId! });
        await this.getAccountList();
        Notify.success('申請成功');
        Loading.hide();
      } catch (error) {
        console.error(error);
        Loading.hide();
      }
    },
    async deleteAccountForChange(id: number) {
      try {
        Loading.show();
        await Services.deleteHlAccountForChange(id);
        await this.getAccountList();
        Notify.success('已抹殺');
        Loading.hide();
      } catch (error) {
        console.error(error);
        Loading.hide();
      }
    },
    downloadXml(account: AccountForChange) {
      try {
        const deviceAccount = JSON.parse(account.deviceAccount);

        const xml = [
          "<?xml version='1.0' encoding='utf-8' standalone='yes' ?>",
          '<map>',
          `    <string name="deviceAccount">${deviceAccount.id}</string>`,
          `    <string name="devicePassword">${deviceAccount.password}</string>`,
          '</map>',
        ].join('\n');
        saveAs(new Blob([xml], { type: 'application/xml' }), `${account.nick}.xml`);
      } catch (error) {
        console.error(error);
      }
    },
  },
});
