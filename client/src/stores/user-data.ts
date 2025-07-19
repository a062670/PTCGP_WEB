// pinia
import { defineStore } from 'pinia';
// services
import AuthServices from 'services/AuthServices';
import MeServices from 'services/MeServices';
// lib
import { Cookies } from 'quasar';
import qs from 'qs';
// stores

export const useUserDataStore = defineStore('userData', {
  state: () => ({
    data: {
      id: 0,
      global_name: '',
    } as User,
  }),
  getters: {
    /** 是否已登入 */
    isLogin(state) {
      return !!state.data.id;
    },
  },
  actions: {
    getAccessToken() {
      return this.getCookies('accessToken');
    },
    getRefreshToken() {
      return this.getCookies('refreshToken');
    },
    getCookieUserId() {
      return Number(this.getCookies('userId') || '0');
    },
    setAccessToken(accessToken: string) {
      this.setCookie('accessToken', accessToken);
    },
    setRefreshToken(refreshToken: string) {
      this.setCookie('refreshToken', refreshToken);
    },
    setCookieUserId(userId: number) {
      this.setCookie('userId', `${userId}`);
    },
    setCookie(key: string, value: string) {
      if (process.env.SERVER) {
        return;
      }
      Cookies.set(`user-${key}`, value, {
        expires: '7d',
        path: '/',
      });
    },
    getCookies(key: string) {
      if (process.env.SERVER) {
        return '';
      }
      return Cookies.get(`user-${key}`);
    },

    /** 確認登入狀態，如果沒有登入，導向首頁 */
    checkLogin() {
      if (this.isLogin) {
        return true;
      }
      this.setAfterLoginPage();
      this.router.replace({ name: 'index' });
      return false;
    },

    /** Refresh Token */
    async doRefreshToken() {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          throw new Error();
        }
        const resp = await AuthServices.refreshToken({
          refreshToken: refreshToken,
        });
        this.setAccessToken(resp.data.accessToken);
        this.setRefreshToken(resp.data.refreshToken);
      } catch {
        this.router.replace({ name: 'index' });
      }
    },

    /** 更新使用者資訊 */
    async updateData() {
      if (!this.getAccessToken()) {
        return;
      }
      const resp = await MeServices.get();
      this.setCookieUserId(resp.data.id);
      if (!resp.data.permissions) {
        resp.data.permissions = {
          hl: 0,
          teamId: 0,
        };
      }
      this.data = resp.data;
    },

    /** 記錄登入前頁面 */
    setAfterLoginPage() {
      const currentRoute = this.router.currentRoute.value;
      const afterLoginPage = {
        name: currentRoute.name,
        params: currentRoute.params,
        query: currentRoute.query,
      };
      sessionStorage.setItem('afterLoginPage', qs.stringify(afterLoginPage));
    },

    /** 返回登入前頁面 */
    goToAfterLoginPage() {
      const afterLoginPage = sessionStorage.getItem('afterLoginPage');
      if (afterLoginPage) {
        const afterLoginPageObj = qs.parse(afterLoginPage);
        sessionStorage.removeItem('afterLoginPage');
        this.router.replace(afterLoginPageObj);
      } else {
        this.router.replace({ name: 'index' });
      }
    },

    /** 登入 */
    async login(data: { code: string; redirectUri: string }) {
      try {
        const resp = await AuthServices.login({
          ...data,
        });

        this.setAccessToken(resp.data.accessToken);
        this.setRefreshToken(resp.data.refreshToken);
        await this.updateData();

        this.goToAfterLoginPage();
      } catch {
        this.router.replace({ name: 'index' });
      }
    },

    /** 登出 */
    logout() {
      this.setAccessToken('');
      this.setRefreshToken('');
      this.setCookieUserId(0);
      this.$reset();
      this.router.push({ name: 'index' });
    },
  },
});
