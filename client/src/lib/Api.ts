import { useRouter } from 'vue-router';
import axios from 'axios';
import type { Method } from 'axios';
import Notify from 'lib/Notify';
import { useUserDataStore } from 'stores/user-data';

const defaultConfig: ApiConfig = {
  checkAuth: true,
  lockPage: true,
  showLoading: false,
  notifyError: true,
  routeToError: true,
  cancelToken: undefined,
  refreshWhenUnauthorized: true,
  appendHeaders: {},
  removeHeaders: [],
};

const api = axios.create({ baseURL: process.env.API_URL });

const get = (url: string, data: ApiRequestData = {}, customConfig: ApiConfig = {}) => {
  // 把沒有值的參數過濾掉
  const _data = JSON.parse(JSON.stringify(data));
  for (const key in _data) {
    if (_data[key] === null || _data[key] === undefined || _data[key] === '') {
      delete _data[key];
    }
  }
  return myAxios('get', url, _data, customConfig);
};

const post = (url: string, data: ApiRequestData = {}, customConfig: ApiConfig = {}) => {
  return myAxios('post', url, data, customConfig);
};

const postForm = (url: string, data: ApiRequestData = {}, customConfig: ApiConfig = {}) => {
  const formData = new FormData();
  appendFormData(formData, data);
  return myAxios('post', url, formData, customConfig);
};

const patch = (url: string, data: ApiRequestData = {}, customConfig: ApiConfig = {}) => {
  return myAxios('patch', url, data, customConfig);
};

const del = (url: string, data: ApiRequestData = {}, customConfig: ApiConfig = {}) => {
  return myAxios('delete', url, data, customConfig);
};

const appendFormData = (formData: FormData, data: ApiFormData, name = '') => {
  name = name || '';
  if (data && typeof data === 'object' && !(data instanceof File)) {
    for (const index in data) {
      if (CheckFormDataKeyIsValid(index, data)) {
        const value: ApiFormData = data[index];
        if (name === '') {
          appendFormData(formData, value, index);
        } else {
          appendFormData(formData, value, `${name}[${String(index)}]`);
        }
      }
    }
  } else {
    if (data === null || data === undefined || data === 'undefined') {
      data = '';
    }
    formData.append(name, data as string | Blob);
  }
};

const CheckFormDataKeyIsValid = (
  key: string | number | symbol,
  object: object,
): key is keyof typeof object => {
  return key in object;
};

const myAxios = (
  method: Method,
  url: string,
  data: ApiRequestData | FormData = {},
  customConfig = {},
): Promise<ApiResponse> => {
  const config: ApiConfig = Object.assign({}, defaultConfig, customConfig);
  // const userData = useUserDataStore();

  return new Promise((resolve, reject) => {
    // 如果 store 的 userId 跟 cookie 的 userId 不同，就重整，可能有切換帳號的情況
    // if (config.checkAuth && process.env.CLIENT) {
    //   if (userData.data.id?.toString() !== userData.getCookieUserId().toString()) {
    //     window.location.reload();
    //     reject(new Error('用戶身份驗證失敗'));
    //   }
    // }

    const headers = getHeaders(config);
    void api({
      method: method,
      url: url,
      params: method === 'get' ? data : null,
      data: method === 'get' ? null : data,
      headers: headers,
      signal: config.cancelToken,
    })
      .finally(() => {})
      .then((response) => {
        const resp = response.data as ApiResponse;
        if (resp.code === 0) {
          resolve(resp);
        } else {
          void handleError(method, url, data, resp, config, resolve, reject);
        }
      })
      .catch((error) => {
        const resp: ApiResponse = error.response?.data || {};
        if (typeof resp.code === 'undefined') {
          resp.code = error.response?.status || 500;
        }
        if (typeof resp.message === 'undefined') {
          resp.message = error.response?.statusText || '系統發生未知錯誤';
        }
        void handleError(method, url, data, resp, config, resolve, reject);
      });
  });
};

const handleError = async (
  method: Method,
  url: string,
  req: ApiRequestData | FormData = {},
  resp: ApiResponse,
  config: ApiConfig,
  resolve: (value: ApiResponse | PromiseLike<ApiResponse>) => void,
  // eslint-disable-next-line
  reject: (reason?: any) => void,
) => {
  const userData = useUserDataStore();
  const refreshToken = userData.getRefreshToken();
  if (resp?.code) {
    switch (resp.code) {
      case 401:
        // 重新取得 token 後再送一次
        if (config.refreshWhenUnauthorized && refreshToken) {
          try {
            await userData.doRefreshToken();
            resolve(
              await myAxios(method, url, req, {
                ...config,
                refreshWhenUnauthorized: false,
              }),
            );
          } catch (e) {
            if (config.notifyError) {
              Notify.error('請重新登入');
            }
            userData.logout();
            reject(e);
          }
        } else {
          if (config.notifyError) {
            Notify.error('請先登入');
          }
          userData.logout();
          reject(resp.message);
        }
        break;
      case 418:
        // 三方登入未註冊
        resolve(resp);
        break;
      case 422:
        // 資料格式有誤
        if (config.notifyError) {
          let errorStr = '';
          if (
            resp.errors &&
            typeof resp.errors === 'object' &&
            Object.keys(resp.errors).length !== 0
          ) {
            for (const key in resp.errors) {
              const err = resp.errors[key];
              if (err.length) {
                errorStr = err[0];
                break;
              }
            }
          }
          Notify.error(errorStr || '輸入資料格式不符');
        }
        reject(resp.message);
        break;
      case 403:
      default:
        if (config.notifyError) {
          Notify.error(resp.message);
        }
        reject({
          code: 500,
          message: resp.message,
        });
    }
  } else {
    if (config.notifyError) {
      Notify.error(resp.message);
    }
    if (config.routeToError && process.env.CLIENT) {
      const router = useRouter();
      void router.replace({
        name: 'error',
        params: {
          message: resp.message,
        },
      });
    }
    reject({
      code: 500,
      message: resp.message,
    });
  }
};

/**
 * 取得打 API 時的 Header
 * @param  {ApiConfig} config
 */
const getHeaders = (config: ApiConfig) => {
  const userData = useUserDataStore();
  const headers: ApiHeaders = {};
  const accessToken = userData.getAccessToken();

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (config.appendHeaders) {
    Object.assign(headers, config.appendHeaders);
  }
  if (config.removeHeaders) {
    for (const key of config.removeHeaders) {
      delete headers[key];
    }
  }
  return headers;
};

export default { get, post, postForm, patch, delete: del };
