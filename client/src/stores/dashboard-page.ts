import { defineStore } from 'pinia';
import { Loading } from 'quasar';
import moment from 'moment';
import Notify from 'lib/Notify';
import Services from 'services/Services';

export const useDashboardPageStore = defineStore('dashboardPage', {
  state: () => ({
    carId: '',
    isLoaded: false,
    name: '',
    dashboard: null as Dashboard | null,
  }),
  getters: {},
  actions: {
    async getDashboard() {
      try {
        Loading.show();
        const resp = await Services.getDashboard(this.carId);
        resp.data.heartbeat.forEach((heartbeat) => {
          const time = moment(heartbeat.time);
          heartbeat.time = time.format('MM-DD HH:mm');
          heartbeat.info = heartbeat.info.replace(/\n/g, '<br />');
          heartbeat.warning = false;
          if (moment().diff(time, 'minutes') > 60) {
            heartbeat.warning = true;
          }
          if (!heartbeat.status.endsWith(':0')) {
            heartbeat.warning = true;
          }
        });
        this.dashboard = resp.data;
        Loading.hide();
        if (!resp.data.info.length) {
          Notify.error('尚未有任何資料，請聯繫剪票員');
          return;
        }
        this.name = resp.data.info[0].dcName;
        this.isLoaded = true;
      } catch {
        Loading.hide();
        Notify.error('取得資料失敗，請稍後再試');
      }
    },
    async patchInfo(data: { idx: string; id: string; ign: string }) {
      Loading.show();
      try {
        await Services.patchInfo({
          ...data,
          carId: this.carId,
        });
        await this.getDashboard();
        Notify.success('任命成功');
      } catch {
        Loading.hide();
        Notify.error('更新資料失敗，請稍後再試');
      }
    },
    async patchOnline(data: { idx: string; status: string }) {
      Loading.show();
      try {
        await Services.patchOnline({ ...data, carId: this.carId });
        await this.getDashboard();
        Notify.success('更新成功');
      } catch {
        Loading.hide();
        Notify.error('更新資料失敗，請稍後再試');
      }
    },
  },
});
