const { google } = require("googleapis");

const config = require("../config.json");

const keyFile = "./key.json";

const auth = new google.auth.GoogleAuth({
  keyFilename: keyFile,
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/spreadsheets.readonly",
  ],
});
let sheets;
(async () => {
  const authClient = await auth.getClient();
  sheets = google.sheets({ version: "v4", auth: authClient });
})();

async function getInfo(carId, id) {
  const sheetID = config.googleDrive.carsInfo[`car${carId}`].infoSheetId;
  const sheetName = config.googleDrive.carsInfo[`car${carId}`].infoSheetInfo;
  const sheetData = await getSheetData(sheetID, sheetName);
  // 從第二行找出各欄位在哪一欄
  const uidColumn = sheetData[1].findIndex((item) => item === "UID (DCID)");
  const onlineColumn = sheetData[1].findIndex((item) => item === "上線中");
  const dcNameColumn = sheetData[1].findIndex((item) => item === "✅DC名稱");
  const ignColumn = sheetData[1].findIndex(
    (item) => item === "✅IGN(本尊名字)"
  );
  const idColumn = sheetData[1].findIndex((item) => item === "✅ID");
  const idxColumn = sheetData[1].findIndex((item) => item === "主號 數量");
  // 從第三行開始，找出 uid 的資料
  const idData = sheetData.filter((item) => item[uidColumn]?.toString() === id);

  return idData.map((item) => {
    return {
      online: item[onlineColumn],
      dcName: item[dcNameColumn],
      ign: item[ignColumn],
      id: item[idColumn],
      idx: item[idxColumn],
    };
  });
}

async function getAccountInfo(carId, id) {
  const sheetID = config.googleDrive.carsInfo[`car${carId}`].infoSheetId;
  const sheetName = config.googleDrive.carsInfo[`car${carId}`].infoSheetAccount;
  const sheetData = await getSheetData(sheetID, sheetName);
  // 從第一行找出各欄位在哪一欄
  // UID 遊戲id IGN
  const uidColumn = sheetData[0].findIndex((item) => item === "UID");
  const idColumn = sheetData[0].findIndex((item) => item === "遊戲id");
  const ignColumn = sheetData[0].findIndex((item) => item === "IGN");
  const idxColumn = sheetData[0].findIndex((item) => item === "編號");
  // 從第二行開始，找出 id 的資料
  const idData = sheetData.filter((item) => item[uidColumn]?.toString() === id);
  return idData.map((item) => {
    return {
      id: item[idColumn],
      ign: item[ignColumn],
      idx: item[idxColumn],
    };
  });
}

async function getSubInfo(carId, id) {
  const sheetID = config.googleDrive.carsInfo[`car${carId}`].reportSheetId;
  const sheetName = config.googleDrive.carsInfo[`car${carId}`].reportSheetInfo;
  const sheetData = await getSheetData(sheetID, sheetName);
  // 從第一行找出各欄位在哪一欄
  const uidColumn = sheetData[0].findIndex((item) => item === "UID (DCID)");
  const subNameColumn = sheetData[0].findIndex((item) => item === "心跳關鍵字");
  // 從第二行開始，找出 id 的資料
  const idData = sheetData.filter((item) => item[uidColumn]?.toString() === id);
  // 去除重複跟空值
  return [
    ...new Set(idData.map((item) => item[subNameColumn]).filter(Boolean)),
  ];
}

async function getHeartbeat(carId, subNameList) {
  const sheetID = config.googleDrive.carsInfo[`car${carId}`].reportSheetId;
  const sheetName =
    config.googleDrive.carsInfo[`car${carId}`].reportSheetHeartbeat;
  const sheetData = await getSheetData(sheetID, sheetName);
  // 從第一行找出各欄位在哪一欄
  const subNameColumn = sheetData[0].findIndex((item) => item === "心跳關鍵字");
  const infoColumn = sheetData[0].findIndex((item) => item === "原始心跳");
  const timeColumn = sheetData[0].findIndex((item) => item === "GMT");
  const statusColumn = sheetData[0].findIndex(
    (item) => item === "online:offline"
  );
  // 從第二行開始，找出 subName 的資料
  const data = sheetData.filter((item) =>
    subNameList.includes(item[subNameColumn])
  );
  return data.map((item) => {
    return {
      subName: item[subNameColumn],
      info: item[infoColumn],
      time: item[timeColumn],
      status: item[statusColumn],
    };
  });
}

async function patchInfo(carId, uid, idx, id, ign) {
  const sheetID = config.googleDrive.carsInfo[`car${carId}`].infoSheetId;
  const sheetName = config.googleDrive.carsInfo[`car${carId}`].infoSheetInfo;
  const sheetData = await getSheetData(sheetID, sheetName);
  // 從第二行找出各欄位在哪一欄
  const uidColumn = sheetData[1].findIndex((item) => item === "UID (DCID)");
  const ignColumn = sheetData[1].findIndex(
    (item) => item === "✅IGN(本尊名字)"
  );
  const idColumn = sheetData[1].findIndex((item) => item === "✅ID");
  const idxColumn = sheetData[1].findIndex((item) => item === "主號 數量");
  // 從第三行開始，找出 uid 的資料
  const findIndex = sheetData.findIndex(
    (item) =>
      item[uidColumn]?.toString() === uid && item[idxColumn]?.toString() === idx
  );

  if (findIndex === -1) {
    throw new Error("找不到資料");
  }

  sheetData[findIndex][idColumn] = id;
  sheetData[findIndex][ignColumn] = ign;

  const requests = [
    {
      range: `${sheetName}!${String.fromCharCode(65 + idColumn)}${
        findIndex + 1
      }`,
      values: [[sheetData[findIndex][idColumn]]],
    },
    {
      range: `${sheetName}!${String.fromCharCode(65 + ignColumn)}${
        findIndex + 1
      }`,
      values: [[sheetData[findIndex][ignColumn]]],
    },
  ];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sheetID,
    requestBody: {
      data: requests,
      valueInputOption: "RAW",
    },
  });
}

async function patchOnline(carId, uid, idx, status) {
  const sheetID = config.googleDrive.carsInfo[`car${carId}`].infoSheetId;
  const sheetName = config.googleDrive.carsInfo[`car${carId}`].infoSheetInfo;
  const sheetData = await getSheetData(sheetID, sheetName);
  // 從第二行找出各欄位在哪一欄
  const uidColumn = sheetData[1].findIndex((item) => item === "UID (DCID)");
  const idxColumn = sheetData[1].findIndex((item) => item === "主號 數量");
  const onlineColumn = sheetData[1].findIndex((item) => item === "上線中");
  // 從第三行開始，找出 uid 的資料
  const findIndex = sheetData.findIndex(
    (item) =>
      item[uidColumn]?.toString() === uid && item[idxColumn]?.toString() === idx
  );

  if (findIndex === -1) {
    throw new Error("找不到資料");
  }

  sheetData[findIndex][onlineColumn] = status;

  const requests = [
    {
      range: `${sheetName}!${String.fromCharCode(65 + onlineColumn)}${
        findIndex + 1
      }`,
      values: [[sheetData[findIndex][onlineColumn] === "TRUE" ? true : false]],
    },
  ];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sheetID,
    requestBody: {
      data: requests,
      valueInputOption: "RAW",
    },
  });
}

// 取得 sheet 資料
async function getSheetData(sheetID, sheetName) {
  // const now = Date.now();
  // 1 分鐘內取過資料就直接回傳
  // if (now - lastGetTime < 1000 * 60 * 1) {
  //   return sheetData;
  // }
  // lastGetTime = now;

  const sheetData = (
    await sheets.spreadsheets.values.get({
      spreadsheetId: sheetID,
      range: `${sheetName}`,
    })
  ).data.values;
  return sheetData;
}

module.exports = {
  getInfo,
  getAccountInfo,
  getSubInfo,
  getHeartbeat,
  patchInfo,
  patchOnline,
};
