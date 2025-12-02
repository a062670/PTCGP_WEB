import Api from 'lib/Api';

// /api/dashboard
export const getDashboard = async (carId: string) => {
  const resp = await Api.get('/dashboard', { carId });
  return resp as ApiResponse & { data: Dashboard };
};

// /api/info
export const patchInfo = async (data: { carId: string; idx: string; id: string; ign: string }) => {
  const resp = await Api.patch('/info', data);
  return resp;
};

// patchOnline
export const patchOnline = async (data: { carId: string; idx: string; status: string }) => {
  const resp = await Api.patch('/online', data);
  return resp;
};

// /api/threads/:carId
export const getThreads = async (carId: string) => {
  const resp = await Api.get(`/threads/${carId}`);
  return resp as ApiResponse & {
    data: {
      time: number;
      threads: Thread[];
    };
  };
};

// /api/hl/packs
export const getHlPacks = async (data: {
  minStar?: number;
  cardIds?: string[];
  minMatch?: number;
  name?: string;
  pack?: string;
  page?: number;
}) => {
  const resp = await Api.get('/hl/packs', data);
  return resp as ApiResponse & {
    data: {
      total: number;
      totalPages: number;
      data: Pack[];
      isFullTeam1: boolean;
      isFullTeam2: boolean;
    };
  };
};

// /api/hl/pack/:id
export const getHlPack = async (id: number) => {
  const resp = await Api.get(`/hl/pack/${id}`);
  return resp as ApiResponse & { data: Pack };
};

// /api/hl/pushPack
export const postHlPushPack = async (data: { id: number; teamId: number }) => {
  const resp = await Api.post('/hl/pushPack', data);
  return resp;
};

// /api/hl/selected
export const getHlSelected = async (teamId: number) => {
  const resp = await Api.get(`/hl/selected/${teamId}`);
  return resp as ApiResponse & { data: Pack[] };
};

// /api/hl/valid
export const getHlValid = async () => {
  const resp = await Api.get('/hl/valid');
  return resp as ApiResponse & { data: Pack[] };
};

// /api/hl/packStatus
export const patchHlPackStatus = async (id: number, data: { status: string }) => {
  const resp = await Api.patch(`/hl/pack/${id}/status`, data);
  return resp;
};

// /api/hl/packPartner
export const postHlPackPartner = async (data: { dcid: number; packId: number[] }) => {
  const resp = await Api.post('/hl/packPartner', {
    ...data,
    packId: data.packId.join(','),
  });
  return resp as ApiResponse & { data: { success: string[]; error: string[] } };
};

// get /api/hl/friendId
export const getHlFriendId = async () => {
  const resp = await Api.get('/hl/friendId');
  return resp as ApiResponse & { data: FriendId[] };
};

// patch /api/hl/friendId
export const patchHlFriendId = async (data: { id: number; friend_id: string }) => {
  const resp = await Api.patch('/hl/friendId', data);
  return resp;
};

// get /api/hl/wishlist
export const getHlWishlist = async () => {
  const resp = await Api.get('/hl/wishlist');
  return resp as ApiResponse & { data: string[] };
};

// put /api/hl/wishlist
export const putHlWishlist = async (data: { wishlist: string[] }) => {
  const resp = await Api.patch('/hl/wishlist', data);
  return resp;
};

// get /api/hl/accountListForChange
export const getHlAccountListForChange = async () => {
  const resp = await Api.get('/hl/accountListForChange');
  return resp as ApiResponse & { data: AccountForChange[] };
};

// post /api/hl/applyAccountForChange
export const postHlApplyAccountForChange = async (data: { packId: string; language: string }) => {
  const resp = await Api.post('/hl/applyAccountForChange', data);
  return resp;
};

// delete /api/hl/accountForChange/:id
export const deleteHlAccountForChange = async (id: number) => {
  const resp = await Api.delete(`/hl/accountForChange/${id}`);
  return resp;
};

export default {
  getDashboard,
  patchInfo,
  patchOnline,
  getThreads,
  getHlPacks,
  getHlPack,
  postHlPushPack,
  getHlSelected,
  getHlValid,
  patchHlPackStatus,
  postHlPackPartner,
  getHlFriendId,
  patchHlFriendId,
  getHlWishlist,
  putHlWishlist,
  getHlAccountListForChange,
  postHlApplyAccountForChange,
  deleteHlAccountForChange,
};
