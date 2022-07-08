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

const refresh = async (apiResponse) => {
  if (isExpired(apiResponse)) {
    await getData();
  }
};
const isExpired = (apiResponse) => {
  if (apiResponse) {
    let gap = getGap(apiResponse);
    if (gap > 1) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
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

getData();
app.listen(3000);
