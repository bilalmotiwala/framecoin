require("dotenv").config();
const functions = require("firebase-functions");
const firebaseAdmin = require("firebase-admin");
const admin = firebaseAdmin.initializeApp();
const { encodeFunctionData, parseEther } = require("viem");
const { getFrameMessage, getFrameHtmlResponse } = require("@coinbase/onchainkit");
const corsLib = require("cors");
const cors = corsLib({ origin: "*" });

exports.startCreateToken = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {

    // Getting the request body.
    const body = req.body;
    const { isValid } = await getFrameMessage(body);
    if(!isValid){
      return res.status(500).send("Error in the request.");
    }

    // Read the request body and console.log it for debugging.
    console.log("Body: ", body);

    // // If there's a transactionHash, return a success message to the user.
    // if(body?.untrustedData?.transactionId !== undefined){
    //   const transactionId = body.untrustedData.transactionId;
    //   let successRes = getFrameHtmlResponse({
    //     buttons: [
    //       {
    //         label: "View Your Club",
    //         action: "link",
    //         target: "https://footballfounder.xyz/"
    //       },
    //       {
    //         label: "View Transaction",
    //         action: "link",
    //         target: `https://basescan.org/tx/${transactionId}`
    //       }
    //     ],
    //     image: `https://footballfounder.xyz/assets/mintClubSuccess.png?1`,
    //   });
    //   return res.status(200).send(successRes);
    // }

    // const contractAddress = "0xa78980c36cb00644eba525536da985a1e47e0d9a";
    // const contractAbi = [{
    //   "inputs": [],
    //   "name": "buyTokens",
    //   "outputs": [],
    //   "stateMutability": "payable",
    //   "type": "function"
    // }];

    // // Fetching a random number between 1 to 509.
    // const tokenId = Math.floor(Math.random() * 509) + 1;

    // // Fetching that pre-generated club from the database using offset and limit.
    // const genClub = await admin.firestore().collection("pregeneratedClubs").offset(tokenId - 1).limit(1).get();
    // const metadataUrl = genClub.docs[0].data().metadataUrl;
    // const signature = genClub.docs[0].data().signature;

    // // Encoding the function data.
    // const data = encodeFunctionData({
    //   abi: contractAbi,
    //   functionName: "mintClubSender",
    //   args: [metadataUrl, signature],
    // });

    // // Creating the frame response.
    // const frameRes = {
    //   chainId: `eip155:8453`,
    //   method: "eth_sendTransaction",
    //   params: {
    //     abi: [],
    //     data,
    //     to: contractAddress,
    //     value: parseEther("0.01").toString(),
    //   },
    // };

    // return res.status(200).json(frameRes);
    return res.status(500);
  });
});