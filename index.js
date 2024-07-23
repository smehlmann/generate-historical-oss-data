import got from "got";
import open from "open";
import { stringify } from "csv-stringify/sync";
import fs from "fs";
import { existsSync } from "fs";
import { exit } from "process";
import * as reportGetters from "./reports/reportGetters.js";
import * as reportUtils from "./reports/reportUtils.js";
import * as saReportByAsset from "./reports/saReportByAsset.js";
import promptSync from "prompt-sync";

const oidcBase = "https://stigman.nren.navy.mil/auth/realms/np-stigman";
const apiBase = "https://stigman.nren.navy.mil/np/api";
const client_id = "np-stig-manager";
const scope =
  "openid stig-manager:collection stig-manager:user stig-manager:stig stig-manager:op";

try {
  var newFile = false;
  const prompt = promptSync();
  console.log("Do you want to start a new file?");
  const resp = prompt("(y/n) ");
  if (resp === "y" || resp === "Y") {
    newFile = true;
  }

  const emassNums = "";
  //const tokens = null;

  process.argv.forEach((val, index) => {
    console.log("command line arg" + index + ": " + val);
  });

  (async () => {
    const fetchTokens = async () => {
      const response = await await getTokens(oidcBase, client_id, scope);
      //const data = await response.json();
      //return data;
      return response;
    };

    const fetchCollections = async (tokens) => {
      var data = {};
      const response = await reportGetters.getCollections(tokens.access_token);
      //console.log(response);
      //data = await response.json();
      //return data;
      return response;
    };

    //////////////////////////////////////////////////////////////////////
    /* Run 'Asset Collection per Primary Owner and System Admin' report */
    //////////////////////////////////////////////////////////////////////
    const fetchHistoricalData = async (tokens, emassMap) => {
      var data = {};
      const response = await saReportByAsset.runSAReportByAsset(
        tokens,
        emassMap
      );
      //console.log(response);
      //data = await response.json();
      //return data;
      return response;
    };

    const tokens = await fetchTokens();
    //console.log(tokens);

    var tempCollections = await fetchCollections(tokens);
    //console.log(tempCollections);

    const emassNums = "";
    let emassMap = new Map();
    emassMap = reportUtils.getCollectionsByEmassNumber(
      tempCollections,
      emassNums
    );

    if (emassMap.size === 0) {
      console.log("No Colections found!");
      exit;
    }

    console.log("Run SA Report by Asset");
    //////////////////////////////////////////////////////////////////////
    /* run report to get the data to be saved                           */
    //////////////////////////////////////////////////////////////////////
    const rows = await fetchHistoricalData(tokens, emassMap);
    //console.log(rows);

    /*const output = stringify(rows.rows, function (err, output) {
      //header: true
      console.log(output);
    });*/

    const output = JSON.stringify(rows.rows);

    //////////////////////////////////////////////////////////////////////
    /* Write report data to a file.                                     */
    //////////////////////////////////////////////////////////////////////
    await saveHistoricalData(rows.rows, newFile);
    //await saveHistoricalData(rows.rows, newFile);
  })();
} catch (e) {
  console.log(e);
}

//////////////////////////////////////////////////////////////////////
/* Write report data to a file. Append to the file, if it exits or 
    create the file.                                                 */
//////////////////////////////////////////////////////////////////////
async function saveHistoricalData(reportData, newFile) {
  try {
    /*process.argv.forEach((val, index) => {
      console.log("command line arg" + index + ": " + val);
    });
    if (process.argv.length > 2 && process.argv[2] === "new-file") {
      newFile = true;
    }*/

    const filePath =
      //"C:\\Users\\sandra.mehlmann\\Documents\\oss-stig-reports\\historicalData\\2024-06-11\\run-stigman-reports\\historicalData.csv";
      //"C:\\Users\\sandra.mehlmann\\Downloads\\historicalData.csv";
      ".\\public\\historicalData.json";
    const backupFile = filePath + ".bak";
    //const mergedData = headers.concat(rows);

    if (existsSync(filePath)) {
      console.log(filePath + " exists.");
      if (newFile) {
        fs.copyFile(filePath, backupFile, (err) => {
          if (err) throw err;
          console.log(filePath + " was copied to " + backupFile);
        });
        writeFile(filePath, reportData);
      } else {
        await appendFile(filePath, reportData);
      }
    } else {
      console.log(filePath + " does not exist.");
      writeFile(filePath, reportData);
    }

    /*fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error("Error reading the file", err);
        return;
      }

      // Step 3: Parse the JSON data
      try {
        const jsonData = JSON.parse(data);
        console.log("JSON data:", jsonData);
      } catch (err) {
        console.error("Error parsing JSON data", err);
      }
    });*/

    //const myData = readFile(filePath);
    //console.log(myData);
  } catch (e) {
    console.log(e);
  }
}

function writeFile(filePath, reportData) {
  try {
    const jsonData = JSON.stringify(reportData, null, 2);

    //fs.writeFileSync(reportData);

    //fs.writeFile(filePath, JSON.stringify(reportData, null, 2), (err) => {

    fs.writeFile(filePath, jsonData, "utf8", function (err) {
      if (err) {
        return console.log(err);
      } else {
        console.log("Data written to " + filePath + "!");
      }
    });
  } catch (e) {
    throw e;
  }
}

async function appendFile(filePath, reportData) {
  try {
    const data = await readFile(filePath);
    if (data) {
      //var jsonData = JSON.parse(reportData);
      //jsonData.push(data);
      //var jsonData = reportData;
      //jsonData.concat(data);
      data.forEach(element => {
        reportData.push(element)
      })

      writeFile(filePath, reportData);
    }
  } catch (e) {
    throw e;
  }
  /*fs.appendFile(filePath, reportData, function (err) {
    if (err) {
      return console.log(err);
    } else {
      console.log("Data appended to " + filePath + "!");
    }
  });*/
}

function readFile(filePath) {
  try {
    var jsonData;
    const data = fs.readFileSync(filePath);
    if (data) {
      jsonData = JSON.parse(data);
      console.log("JSON data:", jsonData);
      //return data;
    }

    return jsonData;

    /*fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error("Error reading the file", err);
        return jsonData;
      }

      // Step 3: Parse the JSON data
      try {
        jsonData = JSON.parse(data);
        //console.log("JSON data:", jsonData);
        return jsonData;
      } catch (err) {
        console.error("Error parsing JSON data", err);
      }
    });
    return jsonData;*/
  } catch (e) {
    throw e;
  }
}

function wait(ms = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function poll(fn, fnCondition, ms) {
  let result = await fn();
  while (!fnCondition(result)) {
    await wait(ms);
    result = await fn();
  }
  return result;
}

async function getToken(device_code) {
  try {
    console.log("Requesting token");
    const response = await got
      .post(
        "https://stigman.nren.navy.mil/auth/realms/np-stigman/protocol/openid-connect/token",
        {
          //const response = await got.post('https://stigman.nren.navy.mil/auth/realms/np-stigman/protocol/openid-connect/token',{
          //const response = await got.post('http://localhost:8080/realms/stigman/protocol/openid-connect/token', {
          //const response = await got.post('https://login.microsoftonline.com/863af28d-88be-4b4d-a58a-d5c40ee1fa22/oauth2/v2.0/token', {
          form: {
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
            client_id: "np-stig-manager",
            device_code,
          },
        }
      )
      .json();
    return response;
  } catch (e) {
    console.log(e);
    return {};
  }
}

async function getDeviceCode(url, client_id, scope) {
  return await got
    .post(url, {
      form: {
        client_id,
        scope,
      },
    })
    .json();
}

async function getOidcMetadata(url) {
  return await got.get(`${url}/.well-known/openid-configuration`).json();
}

async function getMetricsData(accessToken, myUrl) {
  //console.log("getMetricsData: Requesting data.")
  return await got
    .get(myUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .json();
}

async function getCsvOutput(rows) {
  await stringify(
    [
      ["1", "2", "3", "4"],
      ["a", "b", "c", "d"],
    ],
    function (err, output) {
      console.log(output);
    }
  );
}

function getRow(collectionName, stigs, assets) {
  var assetNames = "";
  var benchmarkId = stigs.benchmarkId;
  var stigVersion = stigs.lastRevisionStr;

  for (var i = 0; i < assets.length; i++) {
    if (i < assets.length - 1) {
      assetNames += assets[i].name + ", ";
    } else {
      assetNames += assets[i].name;
    }
  }

  var rowData = {
    collectionName: collectionName,
    benchmark: benchmarkId,
    stigVersion: stigVersion,
    assetNames: assetNames,
  };

  return rowData;
}

async function getTokens(oidcBase, client_id, scope) {
  try {
    const oidcMeta = await getOidcMetadata(oidcBase);
    if (!oidcMeta.device_authorization_endpoint) {
      console.log(
        `Device Authorization grant is not supported by the OIDC Provider`
      );
      process.exit(1);
    }
    const response = await getDeviceCode(
      oidcMeta.device_authorization_endpoint,
      client_id,
      scope
    );

    open(response.verification_uri_complete);

    let fetchToken = () => getToken(response.device_code);

    let validate = (result) => !!result.access_token;
    let tokens = await poll(fetchToken, validate, response.interval * 1000);
    console.log(`Got access token from Keycloak`);

    return tokens;
  } catch (e) {
    console.log(e);
  }
}
