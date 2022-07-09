const express = require("express");
const axios = require("axios").default;
const app = express();

const authToken = "6797774faac5a564d0aed5cab3dbe9d4";

let apiResponse;

const getData = async () => {
  let data = await axios
    .get("https://api.mozambiquehe.re/maprotation?auth=" + authToken)
    .then(function (response) {
      console.log("data received");
      return {
        ...response.data,
        modifiedDate: new Date(),
      };
    })
    .catch(function (error) {
      console.log(error);
      return null;
    });
  apiResponse = data;
};

const getGap = (apiResponse) => {
  let timeNow = new Date();
  let dataTime = apiResponse.modifiedDate;
  return parseInt(
    (Math.abs(timeNow.getTime() - dataTime.getTime()) / (1000 * 60)) % 60
  );
};

const refresh = async () => {
  if (isExpired()) {
    await getData();
  }
};
const isExpired = () => {
  if (apiResponse) {
    let gap = getGap(apiResponse);
    if (gap > 0) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};

app.get("/map", async function (req, res) {
  await refresh();
  res.send(apiResponse.current.map);
});

app.get("/time", async function (req, res) {
  await refresh();
  res.send(
    JSON.stringify(apiResponse.current.remainingMins - getGap(apiResponse) - 1)
  );
});

app.get("/image", async function (req, res) {
  await refresh();
  res.send(apiResponse.current.code.split("_rotation")[0]);
});

app.get("/payload", async function (req, res) {
  if (apiResponse) {
    res.json(apiResponse);
  } else {
    res.send("no payload");
  }
});

app.get("/gap", async function (req, res) {
  await refresh();
  res.json({
    gap: getGap(apiResponse),
    mod_time: apiResponse.modifiedDate,
    now_time: new Date(),
  });
});

getData();
app.listen(3000);
