const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dc = require("./libs/dc");
const gd = require("./libs/gd");
const hl = require("./libs/hl");
const permissions = require("./libs/permissions");
const config = require("./config.json");

const JWT_SECRET = config.jwt.secret;

const app = express();

// CORS 設定
app.use(
  cors({
    origin: "*", // 允許所有來源
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // 允許的 HTTP 方法
    allowedHeaders: ["Content-Type", "Authorization"], // 允許的標頭
    credentials: true, // 允許攜帶認證資訊
  })
);

// static
app.use(express.static("public"));

app.use(express.json());

// ejs
app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/threads/:carId", async (req, res) => {
  try {
    const carId = parseInt(req.params.carId);
    const threads = await dc.getThreadsList(carId);
    if (!threads.threads) {
      res.status(403).send("目前不支援此車");
    } else {
      res.render("threads", { carId, threads });
    }
  } catch (error) {
    res.status(403).send("未知問題");
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const code = req.body.code;
    const redirectUri = req.body.redirectUri;
    if (!code || !redirectUri) {
      jsonResponse(res, null, 403, "code 取得失敗", 401);
      return;
    }
    const token = await dc.getAccessToken(code, redirectUri);
    if (!token) {
      jsonResponse(res, null, 403, "access token 取得失敗", 401);
      return;
    }
    const userInfo = await dc.getUserInfo(token);
    if (!userInfo) {
      jsonResponse(res, null, 403, "user info 取得失敗", 401);
      return;
    }

    // 權限
    userInfo.permissions = await permissions.getPermissions(userInfo.id);

    const accessToken = jwt.sign(
      { ...userInfo, tokenType: "access" },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    const refreshToken = jwt.sign(
      { ...userInfo, tokenType: "refresh" },
      JWT_SECRET,
      {
        expiresIn: "2d",
      }
    );

    jsonResponse(res, { accessToken, refreshToken });
  } catch (error) {
    jsonResponse(res, null, 401, "access token 取得失敗", 401);
  }
});

app.post("/api/auth/refresh", async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.tokenType !== "refresh") {
      jsonResponse(res, null, 401, "refresh token 驗證失敗", 401);
      return;
    }
    delete decoded.exp;
    delete decoded.iat;
    // 權限
    decoded.permissions = await permissions.getPermissions(decoded.id);
    const newAccessToken = jwt.sign(
      { ...decoded, tokenType: "access" },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    const newRefreshToken = jwt.sign(
      { ...decoded, tokenType: "refresh" },
      JWT_SECRET,
      {
        expiresIn: "2d",
      }
    );
    jsonResponse(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (e) {
    jsonResponse(res, null, 401, "refresh token 驗證失敗", 401);
  }
});

app.get("/api/me", async (req, res) => {
  try {
    const decoded = auth(req, res);
    jsonResponse(res, decoded);
  } catch {
    jsonResponse(res, null, 401, "access token 驗證失敗", 401);
  }
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const decoded = auth(req, res);
    const carId = parseInt(req.query.carId);
    if (!carId) {
      throw new Error("車號不全");
    }
    const id = decoded.id;
    const dashboard = {};
    dashboard.info = await gd.getInfo(carId, id);
    dashboard.account = await gd.getAccountInfo(carId, id);
    dashboard.sub = await gd.getSubInfo(carId, id);
    dashboard.heartbeat = await gd.getHeartbeat(carId, dashboard.sub);

    jsonResponse(res, dashboard);
  } catch (error) {
    jsonResponse(res, null, 403, error.message, 403);
  }
});

app.patch("/api/info", async (req, res) => {
  try {
    const decoded = auth(req, res);
    const carId = req.body.carId;
    const idx = req.body.idx;
    const id = req.body.id;
    const ign = req.body.ign;
    if (!carId || !idx || !id || !ign) {
      jsonResponse(res, null, 403, "資料不全", 403);
      return;
    }
    try {
      await gd.patchInfo(carId, decoded.id, idx, id, ign);
      jsonResponse(res, null);
    } catch (error) {
      jsonResponse(res, null, 403, error.message, 403);
    }
  } catch {
    jsonResponse(res, null, 401, "access token 驗證失敗", 401);
  }
});

app.patch("/api/online", async (req, res) => {
  try {
    const decoded = auth(req, res);
    const carId = req.body.carId;
    const idx = req.body.idx;
    const status = req.body.status;
    if (!carId || !idx || !status) {
      jsonResponse(res, null, 403, "資料不全", 403);
      return;
    }
    try {
      await gd.patchOnline(carId, decoded.id, idx, status);
      jsonResponse(res, null);
    } catch (error) {
      jsonResponse(res, null, 403, error.message, 403);
    }
  } catch {
    jsonResponse(res, null, 401, "access token 驗證失敗", 401);
  }
});

app.get("/api/threads/:carId", async (req, res) => {
  try {
    const carId = parseInt(req.params.carId);
    const threads = await dc.getThreadsList(carId);
    if (!threads.threads) {
      jsonResponse(res, null, 403, "目前不支援此車", 403);
      return;
    }
    jsonResponse(res, threads);
  } catch {
    jsonResponse(res, null, 403, "目前不支援此車", 403);
  }
});

app.get("/api/hl/packs", async (req, res) => {
  try {
    const decoded = auth(req, res);
    if (decoded.permissions.hl < 1) {
      jsonResponse(res, null, 403, "無此權限", 403);
      return;
    }
    const filter = req.query;
    const packs = await hl.getPacks(filter);
    jsonResponse(res, packs);
  } catch (error) {
    jsonResponse(res, null, 403, error || "取得失敗", 403);
  }
});

app.get("/api/hl/pack/:id", async (req, res) => {
  try {
    const decoded = auth(req, res);
    if (decoded.permissions.hl < 1) {
      jsonResponse(res, null, 403, "無此權限", 403);
      return;
    }
    const id = req.params.id;
    const pack = await hl.getPack(id);
    jsonResponse(res, {
      id: pack.id,
      created_at: pack.created_at,
      nick: pack.nick,
      cardIds: pack.cardIds,
      pack: pack.pack,
      totalStar: pack.totalStar,
      status: pack.status,
      teamId: pack.teamId,
      pack_id: pack.pack_id,
      language: pack.language,
      inject_times: pack.inject_times,
      is_high_level: pack.is_high_level,
    });
  } catch (error) {
    jsonResponse(res, null, 403, error || "取得失敗", 403);
  }
});

app.post("/api/hl/pushPack", async (req, res) => {
  try {
    const decoded = auth(req, res);
    if (decoded.permissions.hl < 2) {
      jsonResponse(res, null, 403, "無此權限", 403);
      return;
    }
    await hl.pushPack(decoded.permissions.id, req.body.id, req.body.teamId);
    jsonResponse(res, null);
  } catch (error) {
    console.log(error);
    jsonResponse(res, null, 403, error || "解封失敗", 403);
  }
});
app.get("/api/hl/selected/:teamId", async (req, res) => {
  try {
    const decoded = auth(req, res);
    if (!decoded.permissions.hl) {
      jsonResponse(res, null, 403, "無此權限", 403);
      return;
    }
    // if (decoded.permissions.teamId > parseInt(req.params.teamId)) {
    //   jsonResponse(res, null, 403, "無此權限", 403);
    //   return;
    // }

    const result = await hl.getPackByStatus(
      decoded.permissions.id,
      ["selected", "sent_to_friend"],
      req.params.teamId
    );
    jsonResponse(res, result);
  } catch (error) {
    jsonResponse(res, null, 403, error || "失敗", 403);
  }
});
app.get("/api/hl/valid", async (req, res) => {
  try {
    const decoded = auth(req, res);
    if (!decoded.permissions.hl) {
      jsonResponse(res, null, 403, "無此權限", 403);
      return;
    }

    const result = await hl.getPackByStatus(decoded.permissions.id, [
      "valid",
      "synced",
    ]);
    jsonResponse(res, result);
  } catch (error) {
    jsonResponse(res, null, 403, error || "失敗", 403);
  }
});
// patchStatus
app.patch("/api/hl/pack/:id/status", async (req, res) => {
  try {
    const decoded = auth(req, res);
    if (decoded.permissions.hl < 1) {
      jsonResponse(res, null, 403, "無此權限", 403);
      return;
    }

    const id = req.params.id;
    const status = req.body.status;
    if (!["invalid", "valid"].includes(status)) {
      jsonResponse(res, null, 403, "狀態錯誤", 403);
      return;
    }

    await hl.patchPackStatus(id, status);
    jsonResponse(res, null);
  } catch (error) {
    jsonResponse(res, null, 403, error || "失敗", 403);
  }
});

// DC 用的
app.get("/api/hl/selected2", async (req, res) => {
  try {
    const dcid = req.query.dcid;
    const user = await permissions.getUserByDcid(dcid);
    const result = await hl.getPackByStatus(
      user.id,
      ["selected"],
      req.query.teamId
    );
    jsonResponse(res, result);
  } catch (error) {
    jsonResponse(res, null, 403, error || "失敗", 403);
  }
});

app.post("/api/hl/packPartner", async (req, res) => {
  try {
    if (!req.body.packId || !req.body.dcid) {
      jsonResponse(res, null, 403, "資料不全", 403);
      return;
    }
    const packIds = req.body.packId.toString().split(",");
    const result = await hl.postPackPartner(packIds, req.body.dcid);
    jsonResponse(res, result);
  } catch (error) {
    jsonResponse(res, null, 403, error || "失敗", 403);
  }
});
app.get("/api/hl/packPartner", async (req, res) => {
  try {
    const result = await hl.getPackPartner(req.query.packId);
    jsonResponse(res, result);
  } catch (error) {
    jsonResponse(res, null, 403, error || "失敗", 403);
  }
});

app.get("/api/hl/friendId", async (req, res) => {
  try {
    const decoded = auth(req, res);
    const result = await hl.getHlFriendIds(decoded.permissions.id);
    jsonResponse(res, result);
  } catch (error) {
    jsonResponse(res, null, 403, error || "失敗", 403);
  }
});
app.patch("/api/hl/friendId", async (req, res) => {
  try {
    const decoded = auth(req, res);
    if (!decoded.permissions.hl) {
      jsonResponse(res, null, 403, "無此權限", 403);
      return;
    }
    const result = await hl.updateHlFriendIds(
      req.body.id,
      decoded.permissions.id,
      req.body.friend_id
    );
    jsonResponse(res, result);
  } catch (error) {
    jsonResponse(res, null, 403, error || "失敗", 403);
  }
});

app.get("/api/hl/wishlist", async (req, res) => {
  try {
    const decoded = auth(req, res);
    if (!decoded.permissions.hl) {
      jsonResponse(res, null, 403, "無此權限", 403);
      return;
    }
    const result = await hl.getWishlist(decoded.permissions.id);
    jsonResponse(res, result);
  } catch (error) {
    jsonResponse(res, null, 403, error || "失敗", 403);
  }
});

app.patch("/api/hl/wishlist", async (req, res) => {
  try {
    const decoded = auth(req, res);
    if (!decoded.permissions.hl) {
      jsonResponse(res, null, 403, "無此權限", 403);
      return;
    }
    await hl.putWishlist(decoded.permissions.id, req.body.wishlist);
    jsonResponse(res, null);
  } catch (error) {
    jsonResponse(res, null, 403, error || "失敗", 403);
  }
});

app.get("/api/hl/accountListForChange", async (req, res) => {
  try {
    const decoded = auth(req, res);
    if (!decoded.permissions.hl) {
      jsonResponse(res, null, 403, "無此權限", 403);
      return;
    }
    const result = await hl.getAccountListForChange(decoded.permissions.id);
    jsonResponse(res, result);
  } catch (error) {
    jsonResponse(res, null, 403, error || "失敗", 403);
  }
});

app.post("/api/hl/applyAccountForChange", async (req, res) => {
  try {
    const decoded = auth(req, res);
    if (!decoded.permissions.hl) {
      jsonResponse(res, null, 403, "無此權限", 403);
      return;
    }
    await hl.applyAccountForChange(decoded.permissions.id, req.body.packId);
    jsonResponse(res, null);
  } catch (error) {
    jsonResponse(res, null, 403, error || "失敗", 403);
  }
});

app.delete("/api/hl/accountForChange/:id", async (req, res) => {
  try {
    const decoded = auth(req, res);
    if (!decoded.permissions.hl) {
      jsonResponse(res, null, 403, "無此權限", 403);
      return;
    }
    await hl.deleteAccountForChange(decoded.permissions.id, req.params.id);
    jsonResponse(res, null);
  } catch (error) {
    jsonResponse(res, null, 403, error || "失敗", 403);
  }
});

app.get("/api/test", async (req, res) => {
  const result = await hl.test();
  jsonResponse(res, result);
});

app.get("*", async (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(80, () => {
  console.log("Server is running on http://localhost:80");
});

// 驗證 auth
function auth(req, res) {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    if (!accessToken) {
      throw new Error("access token 取得失敗");
    }
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    if (decoded.tokenType !== "access") {
      throw new Error("access token 驗證失敗");
    }
    return decoded;
  } catch (error) {
    jsonResponse(res, null, 401, error.message, 401);
    throw new Error("access token 驗證失敗");
  }
}

// 統一JSON格式
function jsonResponse(res, data, code = 0, message = "success", status = 200) {
  if (res.headersSent) {
    return;
  }
  res.status(status).json({
    code,
    message,
    data,
  });
}
