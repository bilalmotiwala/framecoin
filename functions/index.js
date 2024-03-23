require("dotenv").config();
const functions = require("firebase-functions");
const firebaseAdmin = require("firebase-admin");
const admin = firebaseAdmin.initializeApp();
const { encodeFunctionData, parseEther } = require("viem");
const { getFrameMessage, getFrameHtmlResponse } = require("@coinbase/onchainkit");
const corsLib = require("cors");
const cors = corsLib({ origin: "*" });

exports.createTokenFrame = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
  });
});