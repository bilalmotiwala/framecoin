require("dotenv").config();
const functions = require("firebase-functions");
const firebaseAdmin = require("firebase-admin");
const { Firestore } = require("firebase-admin/firestore");
const admin = firebaseAdmin.initializeApp();

const corsLib = require("cors");
const cors = corsLib({ origin: "*" });

const { getFrameMessage, getFrameHtmlResponse } = require("@coinbase/onchainkit");
const { createCanvas, loadImage, registerFont } = require("canvas");
const { encodeFunctionData, parseEther } = require("viem");

exports.startCreateToken = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {

    // Getting the request body.
    const body = req.body;
    const { isValid } = await getFrameMessage(body);
    if(!isValid){
      return res.status(500).send("Error in the request.");
    }

    // Getting the fid from the request body.
    const fid = body?.untrustedData?.fid;

    // Saving the fid to the database and start attribution of a new token creation to the user.
    await admin.firestore().collection("tokenCreation").doc(String(fid)).set({
      status: "started",
      timestamp: Firestore.FieldValue.serverTimestamp(),
      fid: fid
    });

    // Creating the frame response.
    let successRes = getFrameHtmlResponse({
      buttons: [
        {
          label: "Set Token Name",
          action: "post",
          target: "https://us-central1-framecoin-production.cloudfunctions.net/saveName"
        },
      ],
      input:{
        text: "Name your token"
      },
      image: "https://framecoin.lol/frames/screen1.png",
      state: {
        fid: fid
      }
    });

    return res.status(200).send(successRes);
  });
});

exports.saveName = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {

    // Getting the request body.
    const body = req.body;
    const { isValid } = await getFrameMessage(body);
    if(!isValid){
      return res.status(500).send("Error in the request.");
    }

    // Getting the fid from the request body.
    console.log("Body: ", body);
    const fid = body?.untrustedData?.fid;

    // Getting the inputText from the request body.
    const inputText = body?.untrustedData?.inputText || "";

    // Trim the input text.
    const tokenName = inputText.trim();

    // Return an error if the token name is empty or less than 3 characters.
    if(tokenName.length < 3){
      return res.status(500).send("Token name must be at least 3 characters.");
    }

    // Creating the frame image.
    const width = 533;
    const height = 300;
    registerFont("./assets/Inter.ttf", { family: "Inter" });
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    var buffer;

    // Load the image.
    await loadImage("./assets/nameBase.png").then( async(image) => {
      context.drawImage(image, 0, 0, width, height);
      context.font = "bold 19.5pt Inter";
      context.fillStyle = "#ffffff";
      context.textAlign = "left";
      context.fillText(tokenName, 202, 68);
    });

    // Convert the canvas to a buffer.
    buffer = canvas.toBuffer("image/png");

    // // Return the image as the response.
    // res.writeHead(200, {
    //   "Content-Type": "image/png",
    //   "Content-Length": buffer.length
    // });

    // return res.end(buffer);

    // Convert the buffer to a base64 string.
    buffer = buffer.toString("base64");

    // Creating the frame response.
    let successRes = getFrameHtmlResponse({
      buttons: [
        {
          label: "Set Ticker Name",
          action: "post",
          target: "https://us-central1-framecoin-production.cloudfunctions.net/saveTicker"
        },
      ],
      input:{
        text: "Name your ticker"
      },
      image: `data:image/png;base64,${buffer}`,
      state: {
        fid: fid,
        name: tokenName
      }
    });

    return res.status(200).send(successRes);
  });
});

exports.saveTicker = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {

    // Getting the request body.
    const body = req.body;
    const { isValid } = await getFrameMessage(body);
    if(!isValid){
      return res.status(500).send("Error in the request.");
    }

    // Getting the fid from the request body.
    console.log("Body: ", body);
    const fid = body?.untrustedData?.fid;

    // Getting the inputText from the request body.
    const inputText = body?.untrustedData?.inputText || "";

    // Trim the input text.
    const ticker = inputText.trim();

    // Return an error if the ticker name is empty or less than 3 characters.
    if(ticker.length < 3){
      return res.status(500).send("Ticker name must be at least 3 characters.");
    }

    // Getting the existing state, decoding it from Uri and parsing it to JSON.
    const state = JSON.parse(decodeURIComponent(body?.untrustedData?.state));

    // Creating the frame image.
    const width = 533;
    const height = 300;
    registerFont("./assets/Inter.ttf", { family: "Inter" });
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    var buffer;

    // Load the image.
    await loadImage("./assets/tickerBase.png").then( async(image) => {
      context.drawImage(image, 0, 0, width, height);
      context.font = "bold 19.5pt Inter";
      context.fillStyle = "#ffffff";
      context.textAlign = "left";
      context.fillText(state.name, 202, 68);

      context.font = "bold 19.5pt Inter";
      context.fillStyle = "#ffffff";
      context.textAlign = "left";
      context.fillText(ticker, 202, 138);
    });

    // Convert the canvas to a buffer.
    buffer = canvas.toBuffer("image/png");

    // Convert the buffer to a base64 string.
    buffer = buffer.toString("base64");

    // Creating the frame response.
    let successRes = getFrameHtmlResponse({
      buttons: [
        {
          label: "Deploy Token",
          action: "tx",
          target: "https://us-central1-framecoin-production.cloudfunctions.net/deployToken",
          postUrl: "https://us-central1-framecoin-production.cloudfunctions.net/deployToken",
        },
      ],
      image: `data:image/png;base64,${buffer}`,
      state: {
        ...state,
        fid: fid,
        ticker: ticker
      },
      postUrl: "https://us-central1-framecoin-production.cloudfunctions.net/deployToken",
    });

    return res.status(200).send(successRes);
  });
});