const axios = require("axios");
const qs = require("qs");
const config = require("../config.json");

const CLIENT_ID = config.discord.clientId;
const CLIENT_SECRET = config.discord.clientSecret;

const USER_TOKEN = config.discord.userToken;
const CARS_INFO = config.discord.carsInfo;

const getAccessToken = async (code, redirectUri) => {
  try {
    const resp = await axios.post(
      "https://discord.com/api/oauth2/token",
      qs.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      })
    );
    return resp.data.access_token;
  } catch (e) {
    // console.log(e.response.data);
    return null;
  }
};

const getUserInfo = async (accessToken) => {
  try {
    const resp = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return resp.data;
  } catch (e) {
    return null;
  }
};

const threadsCacheList = Array.from({ length: 10 }, () => ({
  time: 0,
  displayTime: "",
  threads: null,
}));

const getThreadsList = async (carId) => {
  const now = Date.now();
  const cache = threadsCacheList[carId];
  if (!cache) {
    return {
      threads: null,
    };
  }
  if (cache.time + 1000 * 60 * 1 > now) {
    return cache;
  }
  cache.time = now;

  try {
    const api = CARS_INFO[`car${carId}`].threadsApi;
    if (!api) {
      throw new Error("Invalid carId");
    }
    const resp = await axios.get(api, {
      headers: {
        Authorization: USER_TOKEN,
      },
    });
    cache.threads = resp.data.threads
      .map((thread) => {
        const threadData = {
          id: thread.id,
          link: `https://discord.com/channels/${thread.guild_id}/${thread.id}`,
          name: (thread.name.split(" ")[1] || "").replace(/\(/g, " ("),
          status: thread.name.split(" ")[0] || "",
          star: thread.name.split(" ")[2] || "",
          pack: thread.name.split(" ")[3] || "",
          friendId: thread.name.match(/\((\d+)\)/)?.[1] || "",
          createAt: thread.thread_metadata.create_timestamp,
          image: resp.data.first_messages.find(
            (message) => message.id === thread.id
          )?.embeds?.[0]?.thumbnail?.url,
        };

        if (threadData.pack === "小神") {
          const star = "[小神]";
          const pack = `[${threadData.star[0]}P]`;
          threadData.star = star;
          threadData.pack = pack;
        }

        return threadData;
      })
      .sort((a, b) => b.id - a.id);
  } catch (e) {
    console.log(e);
  }
  return cache;
};

module.exports = {
  getAccessToken,
  getUserInfo,
  getThreadsList,
};
