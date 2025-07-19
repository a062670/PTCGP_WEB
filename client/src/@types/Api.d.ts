declare type ApiConfig = {
  /** 確認 store 的 userId 是否與 cookie/storage 同(default: true) */
  checkAuth?: boolean;
  /** 鎖定頁面(default: true) */
  lockPage?: boolean;
  /** 顯示轉轉(default: false) */
  showLoading?: boolean;
  /** 顯示錯誤訊息(default: true) */
  notifyError?: boolean;
  /** 跳轉到錯誤頁面(default: false) */
  routeToError?: boolean;
  cancelToken?: AbortSignal;
  /** 當 401 時是否 refresh token 再試一次(default: true) */
  refreshWhenUnauthorized?: boolean;
  appendHeaders?: ApiHeaders;
  /** 要移除的 header */
  removeHeaders?: string[];
};

declare type ApiHeaders = {
  [header: string]: string;
};

declare type ApiRequestData = {
  [key: string]:
    | string
    | string[]
    | number
    | number[]
    | boolean
    | boolean[]
    | Blob
    | File
    | null
    | undefined
    | ApiRequestData;
};

declare type ApiResponse = {
  code: number;
  message: string;

  // data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

declare type ApiResponseListData = {
  total: number;
  last_page: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
};

declare type ApiFormData = ApiRequestData | string | number | boolean | Blob | File | null;
