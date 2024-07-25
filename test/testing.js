const express = require("express");
const app = express();
const PORT = 5000;
const cors = require('cors');
app.use(express.json());
app.use(cors());
const sendTransaction = ({ input }) => {
  
  const fetch = require("node-fetch");
  const url = "https://7f9a-38-147-83-19.ngrok-free.app/predict";
  const payload = {
    inputs: `<human>:${input}<assistant>:`,
  };

  const headers = {
    "Content-Type": "application/json",
  };

  fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
};

app.post("/send-tx", async (req, res) => {
//   const { input } = req.body;
  try {
    
    res.send("async (DirectSecp256k1HdWallet, SigningStargateClient, mnemonic, chainConfig) => { const recipient = 'cosmos1w59ngfp904p0dluy6d0pglam5g3c67lu5kf5kp'; const amount = '0.01'; const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: chainConfig.prefix }); const [firstAccount] = await wallet.getAccounts(); const client = await SigningStargateClient.connectWithSigner(chainConfig.rpcEndpoint, wallet); const fee = { amount: [{ denom: chainConfig.denom, amount: chainConfig.feeAmount }], gas: chainConfig.gas, }; const sendAmount = { denom: chainConfig.denom, amount: (parseFloat(amount) * 1000000).toString() }; const result = await client.sendTokens(firstAccount.address, recipient, [sendAmount], fee, 'Sending tokens'); return result.transactionHash; }");
  } catch (error) {
    console.error("Error sending transaction:", error.message);
    res.status(500).send("An error occurred: " + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
