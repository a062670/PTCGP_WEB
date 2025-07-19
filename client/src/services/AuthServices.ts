import Api from 'lib/Api';

/** 登入 */
export const login = async (data: { code: string; redirectUri: string }) => {
  const resp = await Api.post(
    '/auth/login',
    {
      ...data,
    },
    {
      checkAuth: false,
      refreshWhenUnauthorized: false,
      removeHeaders: ['Authorization'],
    },
  );

  return resp as ApiResponse & {
    data: {
      accessToken: string;
      refreshToken: string;
    };
  };
};

/** 1.1.3. REFRESH TOKEN */
export const refreshToken = async (data: { refreshToken: string }) => {
  const resp = await Api.post(
    '/auth/refresh',
    {
      ...data,
    },
    {
      checkAuth: false,
      notifyError: false,
      refreshWhenUnauthorized: false,
      removeHeaders: ['Authorization'],
    },
  );
  return resp as ApiResponse & {
    data: {
      accessToken: string;
      refreshToken: string;
    };
  };
};

export default {
  login,
  refreshToken,
};
