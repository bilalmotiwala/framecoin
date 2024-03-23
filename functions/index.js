require("dotenv").config();
const functions = require("firebase-functions");
const firebaseAdmin = require("firebase-admin");
const { Firestore } = require("firebase-admin/firestore");
const { encodeFunctionData, parseEther } = require("viem");
const { getFrameMessage, getFrameHtmlResponse } = require("@coinbase/onchainkit");
const corsLib = require("cors");
const cors = corsLib({ origin: "*" });

const admin = firebaseAdmin.initializeApp();

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
          label: "Proceed",
          action: "post",
          target: "https://us-central1-framecoin-production.cloudfunctions.net/saveName"
        },
      ],
      input:{
        text: "Set a token name"
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

    // Creating the frame response.
    let successRes = getFrameHtmlResponse({
      buttons: [
        {
          label: "Proceed",
          action: "post",
          target: "https://us-central1-framecoin-production.cloudfunctions.net/saveTicker"
        },
      ],
      input:{
        text: "Name your ticker"
      },
      image: "https://framecoin.lol/frames/start.png",
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

    // Getting the existing state, decoding it from Uri and parsing it to JSON.
    const state = JSON.parse(decodeURIComponent(body?.untrustedData?.state));

    // Creating the frame response.
    let successRes = getFrameHtmlResponse({
      buttons: [
        {
          label: "Proceed",
          action: "post",
          target: "https://us-central1-framecoin-production.cloudfunctions.net/deployToken"
        },
      ],
      input:{
        text: "Name your ticker"
      },
      image: "https://framecoin.lol/frames/start.png",
      state: {
        ...state,
        fid: fid,
        ticker: ticker
      }
    });

    return res.status(200).send(successRes);
  });
});