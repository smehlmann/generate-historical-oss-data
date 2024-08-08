function getCollectionsByEmassNumber(collections, emassNumsFilter) {
  let emassMap = new Map();

  console.log("collections.length: " + collections.length);
  console.log(collections);

  try {
    var emassArray = emassNumsFilter.split(",");

    if (emassNumsFilter) {
      for (var x = 0; x < collections.length; x++) {
        var collectionEmass = collections[x].metadata.eMASS;
        if (collectionEmass) {
          var collectioEmassArray = collectionEmass.split(",");

          for (var iCol = 0; iCol < collectioEmassArray.length; iCol++) {
            for (var j = 0; j < emassArray.length; j++) {
              if (collectioEmassArray[iCol] === emassArray[j]) {
                var myCollections = emassMap.get(emassArray[j]);
                if (myCollections) {
                  myCollections.push(collections[x]);
                  emassMap.set(emassArray[j], myCollections);
                } else {
                  myCollections = [collections[x]];
                  emassMap.set(emassArray[j], myCollections);
                }
              }
            }
          }
        }
      }
    } else {
      for (var x = 0; x < collections.length; x++) {
        var collectionEmass = collections[x].metadata.eMASS;
        if (collectionEmass) {
          var collectioEmassArray = collectionEmass.split(",");

          for (var iCol = 0; iCol < collectioEmassArray.length; iCol++) {
            var myCollections = emassMap.get(collectioEmassArray[iCol]);
            if (myCollections) {
              myCollections.push(collections[x]);
              emassMap.set(collectioEmassArray[iCol], myCollections);
            } else {
              myCollections = [collections[x]];
              emassMap.set(collectioEmassArray[iCol], myCollections);
            }
          }
        }
      }
    }
  } catch (e) {
    console.log("Error in getCollectionsByEmassNumber");
    console.log(e);
  }

  return emassMap;
}

async function getAssetEmassMapByAssets(
  emassFilter,
  assets,
  checkDbWeb,
  collectionEmass
) {
  var assetEmassMap = new Map();
  if (assets) {
    for (var i = 0; i < assets.length; i++) {
      if (checkDbWeb === 1) {
        if (
          assets[i] &&
          assets[i].metadata &&
          assets[i].metadata.cklWebOrDatabase
        ) {
          if (assets[i].metadata.cklWebOrDatabase === "true") {
            continue;
          }
        }
      }

      var emassNum = "";

      if (assets[i] && assets[i].metadata && assets[i].metadata.eMass) {
        // there is an eMASS key for this asset, so get the value
        emassNum = assets[i].metadata.eMass;
        if (emassFilter) {
          // an eMASS filter has been specified
          if (emassNum && emassNum === emassFilter) {
            // the asset eMASS is the same as the eMASS filter so use the asset's emass
            assetEmassMap.set(assets[i].name, emassNum);
          }
        } else if (emassNum) {
          // an eMASS filter has not been specifed but he asset has the eMASS set in its metadata
          assetEmassMap.set(assets[i].name, emassNum);
        } else {
          // emass is not specifed in the asset metadata so use collection eMASS
          assetEmassMap.set(assets[i].name, collectionEmass);
        }
      } else {
        // there is no asset eMass metadata so use collection emass
        assetEmassMap.set(assets[i].name, collectionEmass);
      }
    }
  }

  return assetEmassMap;
}

function getMetadata(labelMap, metrics) {
  var collectionMetadata = {
    primOwner: "",
    sysAdmin: "",
    device: "",
    ccbSAActions: "",
    rmfAction: "",
    isso: "",
    other: "",
  };

  const labels = metrics.labels;
  if(!labels || labels.length === 0){
    return collectionMetadata;
  }
  const nameMap = new Map();

  try {
    for(var i = 0; i < labels.length; i++){
      nameMap.set(labels[i].labelId, labels[i].name)
    }

    labelMap.forEach((value, key, map) => {
      //console.log(key, value);
      var labelId = key;
      var labelDesc = value.toUpperCase();

      var name = nameMap.get(labelId);      

      if(name && name !== ''){
        //labelDesc = labelMap.get(labels[iLabel].labelId);
        //console.log("labelDesc: " + labelDesc);
        //labelDesc = labelMap.get(labels[iLabel].labelId).toUpperCase();

        switch (labelDesc) {
          case "PRIMARY OWNER":
            collectionMetadata.primOwner =
              collectionMetadata.primOwner + name + ";";
            break;
          case "SYS ADMIN":
            collectionMetadata.sysAdmin =
              collectionMetadata.sysAdmin + name + ";";
            break;
          case "CCB_SA_ACTIONS":
            collectionMetadata.ccbSAActions =
              collectionMetadata.ccbSAActions + name + ";";
            break;
          case "RMF ACTION":
            collectionMetadata.rmfAction =
              collectionMetadata.rmfAction + name + ";";
            break;
          case "ISSO":
            collectionMetadata.isso = collectionMetadata.isso + name + ";";
            break;
          case "OTHER":
            collectionMetadata.other = collectionMetadata.other + name + ";";
            break;
          case "ASSET TYPE":
            collectionMetadata.device = collectionMetadata.device + name + ";";
            break;
          default:
            break;
        }
      } // end check for no name
    }); // end for each labelMap

    // remove trailing ';'
    collectionMetadata.primOwner = collectionMetadata.primOwner.replace(
      /;$/,
      ""
    );
    collectionMetadata.sysAdmin = collectionMetadata.sysAdmin.replace(/;$/, "");
    collectionMetadata.ccbSAActions = collectionMetadata.ccbSAActions.replace(
      /;$/,
      ""
    );
    collectionMetadata.rmfAction = collectionMetadata.rmfAction.replace(
      /;$/,
      ""
    );
    collectionMetadata.isso = collectionMetadata.isso.replace(/;$/, "");
    collectionMetadata.other = collectionMetadata.other.replace(/;$/, "");
    collectionMetadata.device = collectionMetadata.device.replace(/;$/, "");

    return collectionMetadata;
  } catch (e) {
    console.log(e);
    throw e;
  }

}

function mergeHeadersAndData(data) {
  const headers = data.headers;
  const rows = data.rows;
  //var jsonData = {};
  var jsonArray = [];
  var myJson = {};
  headers.forEach(function (column) {
    var columnName = column.key;
    var columnValue = column.label;
    myJson[columnName] = columnValue;
  });

  jsonArray.push(myJson);
  //const mergedData = rows.unshift(jsonArray);
  const mergedData = jsonArray.concat(rows);

  return mergedData;
}

export {
  getCollectionsByEmassNumber,
  getAssetEmassMapByAssets,
  getMetadata,
  mergeHeadersAndData,
};
