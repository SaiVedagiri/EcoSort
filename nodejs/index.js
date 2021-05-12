const express = require("express");
const bcrypt = require("bcryptjs");
const path = require("path");
var bodyParser = require("body-parser");
var AWS = require("aws-sdk");
const http = require("http");
const WebSocket = require("ws");
const axios = require("axios");
const NodeRSA = require("node-rsa");
const jwt = require("jsonwebtoken");
const AppleAuth = require("apple-auth");
const dotenv = require("dotenv")
const vision = require('@google-cloud/vision');
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
const setTZ = require("set-tz");
const moment = require('moment');

const PORT = process.env.PORT || 80;
setTZ("America/New_York");
dotenv.config()
const client = new vision.ImageAnnotatorClient();

const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set("authorization", `Key ${process.env.CLARIFAIAPIKEY}`);

const server = http.createServer(function (req, res) {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write("");
  res.end();
});

AWS.config.update({
  region: process.env.AWSDYNAMOREGION,
  endpoint: process.env.AWSDYNAMOENDPOINT,
  accessKeyId: process.env.AWSACCESSKEYID,
  secretAccessKey: process.env.AWSSECRETACCESSKEY,
});

const wss = new WebSocket.Server({ server });

server.listen(1319);

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
  });
});

var docClient = new AWS.DynamoDB.DocumentClient();

async function _getApplePublicKeys() {
  return axios
    .request({
      method: "GET",
      url: "https://appleid.apple.com/auth/keys",
    })
    .then((response) => response.data.keys);
}

const getAppleUserId = async (token) => {
  const keys = await _getApplePublicKeys();
  const decodedToken = jwt.decode(token, { complete: true });
  const kid = decodedToken.header.kid;
  const key = keys.find((k) => k.kid === kid);

  const pubKey = new NodeRSA();
  pubKey.importKey(
    { n: Buffer.from(key.n, "base64"), e: Buffer.from(key.e, "base64") },
    "components-public"
  );
  const userKey = pubKey.exportKey(["public"]);

  return jwt.verify(token, userKey, {
    algorithms: "RS256",
  });
};

express()
  .use(express.static(path.join(__dirname, "build")))
  .use(express.json())
  .use(bodyParser.urlencoded({ extended: false }))
  .use("/appleAuth", async function (req, res) {
    const user = await getAppleUserId(req.body.id_token);
    let email = user.email;
    let myVal = await searchUserApple(user.sub);
    if (!myVal) {
      await addAppleUser(email, user.sub);
    }
    let myVal2 = await searchUserApple(user.sub);
    while (myVal2 == undefined) {
      myVal2 = await searchUserApple(user.sub);
    }
    let userKey = myVal2.userID;
    const returnVal = {
      userkey: userKey,
      imageurl: "assets/default.png",
      deviceid: myVal2.deviceID
    };
    res.redirect(
      `https://ecosort.saivedagiri.com/appleUser?userkey=${returnVal.userkey}&imageurl=${returnVal.imageurl}&deviceid=${returnVal.deviceid}`
    );
  })
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/*", function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  })
  .post("/callbacks/sign_in_with_apple", (req, response) => {
    const redirect = `intent://callback?${new URLSearchParams(
      req.body
    ).toString()}#Intent;package=com.saivedagiri.ecosort;scheme=signinwithapple;end`;
    response.redirect(307, redirect);
  })
  .post("/sign_in_with_apple", async (req, res) => {
    const auth = new AppleAuth(
      {
        // use the bundle ID as client ID for native apps, else use the service ID for web-auth flows
        // https://forums.developer.apple.com/thread/118135
        client_id:
          req.query.useBundleId === "true"
            ? process.env.APPLEAPPID
            : process.env.APPLESERVICEID,
        team_id: process.env.APPLETEAMID,
        redirect_uri:
          "https://ecosort.saivedagiri.com/callbacks/sign_in_with_apple", // does not matter here, as this is already the callback that verifies the token after the redirection
        key_id: process.env.APPLEKEYID,
      },
      './AuthKey.p8'
    );
    console.log(req.query);
    const accessToken = await auth.accessToken(req.query.code);
    const idToken = jwt.decode(accessToken.id_token);
    const userID = idToken.sub;
    // `userEmail` and `userName` will only be provided for the initial authorization with your app


    const userEmail = idToken.email;
    const userName = `${req.query.firstName} ${req.query.lastName}`;
    console.log(idToken);
    let myVal = await searchUserApple(userID);
    if (!myVal) {
      await addAppleUser(userEmail, userID);
    }
    let myVal2 = await searchUserApple(userID);
    while (myVal2 == undefined) {
      myVal2 = await searchUserApple(userID);
    }
    let userKey = myVal2.userID;
    const returnVal = {
      userkey: userKey,
      imageurl: "assets/default.png",
      deviceid: myVal.deviceID
    };
    res.send(returnVal);
  })
  .post("/googleSignIn", async function (req, res) {
    let profile = req.headers;
    let email = profile.email;
    let name = profile.name;
    let imageURL = profile.imageurl;
    let myVal = await searchUserEmail(email);
    if (!myVal) {
      await addUser(email, imageURL, name, "null");
    }
    let myVal2 = await searchUserEmail(email);
    while (myVal2 == undefined) {
      myVal2 = await searchUserEmail(email);
    }
    let userKey = myVal2.userID;
    const returnVal = {
      userkey: userKey,
      imageurl: imageURL,
      deviceid: myVal.deviceID
    };
    res.send(returnVal);
  })
  .post("/signIn", async function (req, res) {
    let info = req.headers;
    let email = info.email;
    let password = info.password;
    let returnVal;
    let myVal = await searchUserEmail(email);
    if (!myVal) {
      returnVal = {
        data: "Incorrect email address.",
      };
    } else {
      let inputPassword = password;
      let userPassword;
      userPassword = myVal.password;
      if (bcrypt.compareSync(inputPassword, userPassword)) {
        returnVal = {
          data: "Valid",
          id: myVal.userID,
          imageurl: "assets/default.png",
          deviceid: myVal.deviceID
        };
      } else {
        returnVal = {
          data: "Incorrect Password",
        };
      }
    }
    res.send(returnVal);
  })
  .post("/registerDevice", async function (req, res) {
    let info = req.headers;
    let userID = info.userid;
    let deviceID = info.deviceid;
    await updateUser(userID, "deviceID", deviceID);
    res.sendStatus(200);
  })
  .post("/createDevice", async function (req, res) {
    let info = req.headers;
    let deviceID = info.deviceid;
    await createDevice(deviceID);
    res.sendStatus(200);
  })
  .post("/analyzeImageGoogle", async function (req, res) {
    let info = req.headers;
    let imageURL = info.imageurl;
    let deviceID = info.deviceid;
    let returnVal = { data: "false" };
    const [result] = await client.labelDetection(imageURL);
    const labels = result.labelAnnotations;
    console.log('Labels:');
    let mainLabel = "trash";
    labels.forEach((label) => {
      label = label.description;
      console.log(label);
      if(label.toLowerCase().includes("glass") || label.toLowerCase().includes("plastic") || label.toLowerCase().includes("paper")){
        returnVal.data = "true";
        if(mainLabel == "trash"){
          mainLabel = label.toLowerCase();
        }
        console.log("RECYCLABLE");
      }
    });
    if(deviceID != null && deviceID != ""){
      let currentTime = moment().format('MM-DD-yyyy @ hh:mm:ss a');
      addImageToDevice(deviceID, imageURL, currentTime, returnVal.data, mainLabel);
    }
    res.send(returnVal);
  })
  .post("/analyzeImageClarifai", async function (req, res) {
    let info = req.headers;
    let imageURL = info.imageurl;
    let deviceID = info.deviceid;
    let returnVal = {data: "false"};
    let mainLabel = "trash";
    await stub.PostModelOutputs(
      {
        // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
        model_id: "aaa03c23b3724a16a56b629203edc62c",
        inputs: [{ data: { image: { url: imageURL } } }]
      },
      metadata,
      (err, response) => {
        if (err) {
          console.log("Error: " + err);
          return;
        }

        if (response.status.code !== 10000) {
          console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
          return;
        }

        console.log("Predicted concepts, with confidence values:")
        for (const c of response.outputs[0].data.concepts) {
          console.log(c.name + ": " + c.value);
          if(c.name.toLowerCase().includes("recycl") || c.name.toLowerCase().includes("plastic") || c.name.toLowerCase().includes("paper") || c.name.toLowerCase().includes("glass")){
            returnVal.data = "true";
            if(mainLabel == "trash"){
              mainLabel = c.name.toLowerCase();
            }
            console.log("RECYCLABLE");
          }
        }
        if(deviceID != null && deviceID != ""){
          let currentTime = moment().format('MM-DD-yyyy @ hh:mm:ss a');
          addImageToDevice(deviceID, imageURL, currentTime, returnVal.data, mainLabel);
        }
        res.send(returnVal);
      }
    );
    
  })
  .post("/getDeviceStats", async function (req, res) {
    let info = req.headers;
    let deviceID = info.deviceid;
    let returnVal = { data: [] };
    let myVal = await searchDeviceID(deviceID);
    for(let i = 0; i < myVal.picNum; i++){
      returnVal.data.push({
        imageurl: myVal[`image${i}`],
        time: myVal[`time${i}`],
        result: myVal[`result${i}`],
        label: myVal[`label${i}`],
      });
    }
    res.send(returnVal);
  })
  .post("/clearDeviceStats", async function (req, res) {
    let info = req.headers;
    let deviceID = info.deviceid;
    let myVal = await clearDeviceID(deviceID);
    res.sendStatus(200);
  })
  .post("/verifyRegistration", async function (req, res) {
    let info = req.headers;
    let userID = info.userid;
    let myVal = await searchUserID(userID);
    if (myVal.deviceID) {
      returnVal = {
        data: "Valid",
      };
    } else {
      returnVal = {
        data: "Invalid",
      };
    }
    res.send(returnVal);
  })
  .post("/signUp", async function (req, res) {
    let info = req.headers;
    let email = info.email;
    let firstName = info.firstname;
    let lastName = info.lastname;
    let password = info.password;
    let passwordConfirm = info.passwordconfirm;
    let returnVal;
    if (!email) {
      returnVal = {
        data: "Please enter an email address.",
      };
      res.send(returnVal);
      return;
    }
    let myVal = await searchUserEmail(email);
    if (myVal) {
      returnVal = {
        data: "Email already exists.",
      };
    } else if (firstName.length == 0 || lastName.length == 0) {
      returnVal = {
        data: "Invalid Name",
      };
    } else if (
      !(
        /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u.test(
          firstName
        ) &&
        /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u.test(
          lastName
        )
      )
    ) {
      returnVal = {
        data: "Invalid Name",
      };
    } else if (
      !/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
        email
      )
    ) {
      returnVal = {
        data: "Invalid email address.",
      };
    } else if (password.length < 6) {
      returnVal = {
        data: "Your password needs to be at least 6 characters.",
      };
    } else if (password != passwordConfirm) {
      returnVal = {
        data: "Your passwords don't match.",
      };
    } else {
      addUser(
        email,
        "assets/default.png",
        `${firstName} ${lastName}`,
        hash(password)
      );
      let myVal2 = await searchUserEmail(email);
      while (myVal2 == undefined) {
        myVal2 = await searchUserEmail(email);
      }
      returnVal = {
        data: "Valid",
        id: myVal2.userID,
        imageurl: "assets/default.png",
      };
    }
    res.send(returnVal);
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

function hash(value) {
  let salt = bcrypt.genSaltSync(10);
  let hashVal = bcrypt.hashSync(value, salt);
  return hashVal;
}

async function searchUserEmail(key) {
  let params = {
    TableName: "EcoSort-Users",
    IndexName: "email-index",
    KeyConditionExpression: "#key = :value",
    ExpressionAttributeNames: {
      "#key": "email",
    },
    ExpressionAttributeValues: {
      ":value": key,
    },
  };

  await docClient.query(params, async function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      return err;
    } else {
      console.log("Query succeeded.");
      returnVal = await data.Items[0];
    }
  });
  await new Promise((resolve, reject) => setTimeout(resolve, 200));
  return returnVal;
}

async function searchUserID(key) {
  let params = {
    TableName: "EcoSort-Users",
    KeyConditionExpression: "#key = :value",
    ExpressionAttributeNames: {
      "#key": "userID",
    },
    ExpressionAttributeValues: {
      ":value": key,
    },
  };

  await docClient.query(params, async function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      return err;
    } else {
      console.log("Query succeeded.");
      returnVal = await data.Items[0];
    }
  });
  await new Promise((resolve, reject) => setTimeout(resolve, 200));
  return returnVal;
}

async function searchUserApple(key) {
  let params = {
    TableName: "EcoSort-Users",
    IndexName: "appleid-index",
    KeyConditionExpression: "#key = :value",
    ExpressionAttributeNames: {
      "#key": "appleId",
    },
    ExpressionAttributeValues: {
      ":value": key,
    },
  };

  await docClient.query(params, async function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      return err;
    } else {
      console.log("Query succeeded.");
      returnVal = await data.Items[0];
    }
  });
  await new Promise((resolve, reject) => setTimeout(resolve, 200));
  return returnVal;
}

async function addUser(email, imageURL, name, password) {
  let username = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";
  let charactersLength = characters.length;
  for (let i = 0; i < 15; i++) {
    username += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  let params = {
    TableName: "EcoSort-Users",
    Item: {
      userID: username,
      email: email,
      imageURL: imageURL,
      name: name,
      password: password,
    },
  };

  console.log("Adding a new item...");
  await docClient.put(params, async function (err, data) {
    if (err) {
      console.error(
        "Unable to add item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("Added item successfully");
    }
  });
}

async function createDevice(deviceID) {
  let params = {
    TableName: "EcoSort-Devices",
    Item: {
      deviceID: deviceID,
      picNum: 0
    },
  };

  console.log("Adding a new item...");
  await docClient.put(params, async function (err, data) {
    if (err) {
      console.error(
        "Unable to add item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("Added item successfully");
    }
  });
}

async function clearDeviceID(deviceID) {
  let params = {
    TableName: "EcoSort-Devices",
    Key: {
      deviceID: deviceID,
    },
  };

  console.log("Attempting a conditional delete...");
    await docClient.delete(params, async function (err, data) {
      if (err) {
        console.error(
          "Unable to delete item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        console.log("Deleted item successfully");
      }
    });

  createDevice(deviceID);
}

async function addImageToDevice(deviceID, imageURL,timestamp, result, label){
  let params = {
    TableName: "EcoSort-Devices",
    KeyConditionExpression: "#key = :value",
    ExpressionAttributeNames: {
      "#key": "deviceID",
    },
    ExpressionAttributeValues: {
      ":value": deviceID,
    },
  };

  await docClient.query(params, async function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      return err;
    } else {
      console.log("Query succeeded.");
      returnVal = await data.Items[0];
    }
  });
  await new Promise((resolve, reject) => setTimeout(resolve, 200));
  
  let picNum = returnVal.picNum;
  updateDevice(deviceID, "picNum", picNum+1);
  updateDevice(deviceID, `image${picNum}`, imageURL);
  updateDevice(deviceID, `time${picNum}`, timestamp);
  updateDevice(deviceID, `result${picNum}`, result);
  updateDevice(deviceID, `label${picNum}`, label);
}

async function searchDeviceID(key) {
  let params = {
    TableName: "EcoSort-Devices",
    KeyConditionExpression: "#key = :value",
    ExpressionAttributeNames: {
      "#key": "deviceID",
    },
    ExpressionAttributeValues: {
      ":value": key,
    },
  };

  await docClient.query(params, async function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      return err;
    } else {
      console.log("Query succeeded.");
      returnVal = await data.Items[0];
    }
  });
  await new Promise((resolve, reject) => setTimeout(resolve, 200));
  return returnVal;
}

async function addAppleUser(email, sub) {
  let username = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";
  let charactersLength = characters.length;
  for (let i = 0; i < 15; i++) {
    username += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  let params = {
    TableName: "EcoSort-Users",
    Item: {
      userID: username,
      email: email,
      imageURL: "assets/default.png",
      name: "Apple User",
      password: "null",
      appleId: sub
    },
  };

  console.log("Adding a new item...");
  await docClient.put(params, async function (err, data) {
    if (err) {
      console.error(
        "Unable to add item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("Added item successfully");
    }
  });
}

async function updateUser(userID, paramName, paramVal) {
  let params = {
    TableName: "EcoSort-Users",
    Key: {
      userID,
    },
    UpdateExpression: "set " + paramName + " = :v",
    ExpressionAttributeValues: {
      ":v": paramVal,
    },
    ReturnValues: "UPDATED_NEW",
  };

  console.log("Updating the item...");
  await docClient.update(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
  });
}

async function updateDevice(deviceID, paramName, paramVal) {
  let params = {
    TableName: "EcoSort-Devices",
    Key: {
      deviceID,
    },
    UpdateExpression: "set " + paramName + " = :v",
    ExpressionAttributeValues: {
      ":v": paramVal,
    },
    ReturnValues: "UPDATED_NEW",
  };

  console.log("Updating the item...");
  await docClient.update(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
  });
}