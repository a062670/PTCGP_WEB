import Api from 'lib/Api';

export const get = async () => {
  const resp = await Api.get(
    '/me',
    {},
    {
      checkAuth: false,
    },
  );
  return resp as ApiResponse & { data: User };
};

export default {
  get,
};
