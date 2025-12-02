const axios = require("axios");
const config = require("../config.json");
const { createClient } = require("@supabase/supabase-js");
const { language } = require("googleapis/build/src/apis/language");

const supabase = createClient(config.supabase.url, config.supabase.key, {
  global: {
    headers: {
      Authorization: `Bearer ${config.supabase.devJwt}`,
    },
  },
});

/** 取得未解封的包列表 */
const getPacks = async (filter) => {
  const { cardIds, minMatch, minStar, pack, limit = 20, page = 1 } = filter;

  const inputCardIds =
    typeof cardIds === "string"
      ? JSON.parse(cardIds)
      : Array.isArray(cardIds)
      ? cardIds
      : null;

  const rpcParams = {
    inputCardIds: inputCardIds?.length ? inputCardIds : null,
    minMatch: parseInt(minMatch) || 0,
    minStar: parseInt(minStar) || 10,
    packFilter: pack || null,
    limitRows: parseInt(limit) || 12,
  };

  rpcParams.offsetRows = ((parseInt(page) || 1) - 1) * rpcParams.limitRows;

  const { data: items, error } = await supabase.rpc("matchGodpacks", rpcParams);
  if (error) {
    console.error(error.message);
    throw error.message;
  }

  // const { data: totalData, error: countError } = await supabase.rpc(
  //   "countGodpacks",
  //   {
  //     inputCardIds: rpcParams.inputCardIds,
  //     minMatch: rpcParams.minMatch,
  //     minStar: rpcParams.minStar,
  //     packFilter: rpcParams.packFilter,
  //   }
  // );

  // if (countError) {
  //   throw countError.message;
  // }

  return {
    // total: totalData,
    // totalPages: Math.ceil(totalData / rpcParams.limitRows),
    data: items.map((item) => ({
      id: item.id,
      created_at: item.created_at,
      nick: item.nick,
      cardIds: item.cardIds,
      pack: item.pack,
      totalStar: item.totalStar,
      status: item.status,
      teamId: item.teamId,
      pack_id: item.pack_id,
      language: item.language,
      inject_times: item.inject_times,
      is_high_level: item.is_high_level,
    })),
    // limit: rpcParams.limitRows,
    // offset: rpcParams.offsetRows,
    // page: rpcParams.page,
  };
};

/** 取得指定包資訊 */
const getPack = async (id) => {
  const { data, error } = await supabase
    .from("godpack")
    .select("*")
    .eq("id", id);

  if (error) {
    throw error.message;
  }

  if (data.length === 0) {
    throw "pack not found";
  }

  return data[0];
};

/** 取得團隊解封的包 */
const getPackByStatus = async (userId, status, teamId = null) => {
  // 先照 injectTime 倒序排，再照 ID 倒序
  // query
  //   .order("injectTime", { ascending: false })
  //   .order("id", { ascending: false });

  // 最多 100 筆
  // query.limit(100);

  let godpackData = [];
  for (const statusItem of status) {
    const query = supabase.from("godpack").select("*").eq("status", statusItem);
    if (teamId) {
      query.eq("teamId", teamId);
    }
    const { data: _godpackData, error } = await query;
    if (error) {
      throw error.message;
    }
    godpackData = godpackData.concat(_godpackData);
  }
  godpackData = godpackData.sort((a, b) => {
    return new Date(b.injectTime) - new Date(a.injectTime);
  });

  const selectedPackIds = godpackData
    .filter((item) => item.status === "selected")
    .map((item) => item.id);
  let partnerData = [];
  if (selectedPackIds.length > 0) {
    const { data: _partnerData, error: partnerError } = await supabase
      .from("pack_partner")
      .select("*")
      .in("pack_id", selectedPackIds)
      .eq("user_id", userId);

    if (partnerError) {
      throw partnerError.message;
    }
    partnerData = _partnerData;
  }

  godpackData.forEach((item) => {
    item.isPartner = partnerData.some((partner) => partner.pack_id === item.id);
  });

  return godpackData.map((item) => ({
    id: item.id,
    created_at: item.created_at,
    nick: item.nick,
    cardIds: item.cardIds,
    pack: item.pack,
    totalStar: item.totalStar,
    status: item.status,
    teamId: item.teamId,
    injectTime: item.injectTime,
    isPartner: item.isPartner,
    pack_id: item.pack_id,
    language: item.language,
    friend_id: item.friend_id,
    inject_times: item.inject_times,
    is_high_level: item.is_high_level,
  }));
};

/** 更新包狀態 */
const patchPackStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("godpack")
    .update({ status })
    .eq("id", id)
    .eq("status", "synced");

  if (error) {
    throw error.message;
  }

  return data;
};

/** 將包推送到團隊解封佇列 */
const pushPack = async (userId, packId, teamId) => {
  const { data, error } = await supabase.rpc("select_pack", {
    input: { user_id: userId, pack_id: packId, team_id: teamId },
  });

  if (error) {
    throw error.message;
  }

  await axios.post(config.hl.pushUrl, {
    content: JSON.stringify({
      id: data.id,
      teamId: teamId,
      nickname: data.nick,
      deviceAccount: {
        id: "",
        password: "",
      },
      transactionId: "",
      cardIds: data.cardIds.split(","),
      names: data.names,
      totalStar: data.totalStar,
      pack: data.pack,
    }),
  });
};

/** 加入解封包的團隊成員 */
const postPackPartner = async (packIds, dcid) => {
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("dcid", dcid);

  if (userData.length === 0) {
    throw "非解封隊成員";
  }

  // 成功
  const successList = [];
  const errorList = [];

  for (const packId of packIds) {
    const pack = await getPack(packId);
    if (pack.status !== "selected") {
      // throw "未於解封佇列中";
      errorList.push(packId);
      continue;
    }

    // if (userData[0].team_id > pack.teamId) {
    //   // throw `非${pack.teamId}隊成員`;
    //   errorList.push(packId);
    //   continue;
    // }

    // 要避免重複
    const { data: partnerData, error: partnerError } = await supabase
      .from("pack_partner")
      .upsert(
        { pack_id: packId, user_id: userData[0].id },
        {
          onConflict: ["pack_id", "user_id"],
          ignoreDuplicates: true,
        }
      );

    if (partnerError) {
      // throw partnerError.message;
      errorList.push(packId);
      continue;
    }

    successList.push(packId);
  }

  return {
    success: successList,
    error: errorList,
  };
};

/** 取得解封包的團隊成員 */
const getPackPartner = async (packId) => {
  const pack = await getPack(packId);
  if (pack.status === null) {
    throw "未進行解封程序";
  }

  const { data: partnerData, error: partnerError } = await supabase
    .from("pack_partner")
    .select(
      `
        id,
        user_id,
        pack_id,
        users:user_id (
          id,
          dcid
        )
      `
    )
    .eq("pack_id", packId);

  if (partnerError) {
    console.error(partnerError.message);
    throw partnerError.message;
  }

  const users = partnerData.map((partner) => partner.users.dcid);

  const { data: friendData, count: friendCount } = await supabase
    .from("user_friend_ids")
    .select("*", { count: "exact", head: true })
    .in(
      "user_id",
      partnerData.map((partner) => partner.user_id)
    );

  return {
    id: pack.id,
    teamId: pack.teamId,
    cardIds: pack.cardIdsArray,
    nickname: pack.nick,
    names: pack.names,
    totalStar: pack.totalStar,
    pack: pack.pack,
    status: pack.status,
    users,
    friends: friendCount,
  };
};

/** 取得好友 ID */
const getHlFriendIds = async (userId) => {
  const { data, error } = await supabase
    .from("user_friend_ids")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: true });

  if (error) {
    throw error.message;
  }

  return data;
};

/** 更新好友 ID */
const updateHlFriendIds = async (id, userId, friendId) => {
  // friendId 必須為 16 位數字
  if (!/^\d{16}$/.test(friendId)) {
    throw "好友 ID 格式錯誤";
  }

  const { data, error } = await supabase
    .from("user_friend_ids")
    .update({ friend_id: friendId })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw error.message;
  }

  // 新增 log 到 user_friend_ids_log
  const { data: logData, error: logError } = await supabase
    .from("user_friend_ids_log")
    .insert({ user_id: userId, friend_id: friendId });

  return data;
};

/** 取得願望清單 */
const getWishlist = async (userId) => {
  const { data, error } = await supabase
    .from("wishlist")
    .select("wishlist")
    .eq("user_id", userId);

  if (error) {
    throw error.message;
  }

  if (data.length === 0) {
    return [];
  }

  return data[0].wishlist;
};

/** 更新願望清單 */
const putWishlist = async (userId, wishlist) => {
  const { data, error } = await supabase
    .from("wishlist")
    .upsert({ user_id: userId, wishlist }, { onConflict: "user_id" });

  if (error) {
    throw error.message;
  }

  return;
};

/** 取得交換用帳號列表 */
const getAccountListForChange = async (userId) => {
  const { data, error } = await supabase
    .from("account_for_change")
    .select("*")
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .order("apply_at", { ascending: false });

  if (error) {
    throw error.message;
  }

  return data;
};

/** 申請交換用帳號 */
const applyAccountForChange = async (userId, packId, language) => {
  // 先查詢第一個可用的帳號
  const { data: availableAccounts, error: selectError } = await supabase
    .from("account_for_change")
    .select("id")
    .is("user_id", null)
    .eq("pack_id", packId)
    .eq("language", language)
    .limit(1);

  if (selectError) {
    throw selectError.message;
  }

  if (!availableAccounts || availableAccounts.length === 0) {
    throw "沒有合適的奴隸";
  }

  // 只更新第一筆找到的記錄
  const { data, error } = await supabase
    .from("account_for_change")
    .update({
      user_id: userId,
      apply_at: new Date().toISOString(),
    })
    .eq("id", availableAccounts[0].id);

  if (error) {
    throw error.message;
  }

  return availableAccounts[0];
};

/** 刪除交換用帳號 */
const deleteAccountForChange = async (userId, id) => {
  const { data, error } = await supabase
    .from("account_for_change")
    .update({ is_deleted: true })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw error.message;
  }

  return data;
};

const test = async () => {
  const { data, error } = await supabase.from("test").select("*");

  return data;
};

test();

module.exports = {
  getPacks,
  getPack,
  getPackByStatus,
  patchPackStatus,
  pushPack,
  postPackPartner,
  getPackPartner,
  getHlFriendIds,
  updateHlFriendIds,
  getWishlist,
  putWishlist,
  getAccountListForChange,
  applyAccountForChange,
  deleteAccountForChange,
  test,
};
