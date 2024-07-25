require('dotenv').config();
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { assertIsBroadcastTxSuccess, SigningStargateClient } = require('@cosmjs/stargate');
const chainConfig = require('./config');

async function sendTransaction( chainConfig) {
  try {
    console.log("Function start");
    const recipient = 'cosmos1g0x26xajpfsns9q9flw3r99przgs8acau9dmde';
    const amount = '0.01';

    console.log("Creating wallet...");
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(process.env.MNEMONIC, { prefix: chainConfig.prefix });
    console.log("Wallet created");

    const [firstAccount] = await wallet.getAccounts();
    console.log("First account address:", firstAccount.address);

    console.log("Connecting to RPC endpoint:", chainConfig.rpcEndpoint);
    const client = await SigningStargateClient.connectWithSigner(chainConfig.rpcEndpoint, wallet);
    console.log("Connected to client");

    const fee = {
      amount: [{ denom: chainConfig.denom, amount: chainConfig.feeAmount }],
      gas: chainConfig.gas
    };
    const sendAmount = {
      denom: chainConfig.denom,
      amount: (parseFloat(amount) * 1000000).toString()
    };
    console.log("Preparing to send transaction");

    console.log("Sending transaction...");
    const result = await client.sendTokens(firstAccount.address, recipient, [sendAmount], fee, 'Sending tokens');
    console.log("Transaction sent");

    // assertIsBroadcastTxSuccess(result);
    console.log('Transaction successful with hash:', result.transactionHash);
  } catch (error) {
    console.error("Error details:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Execute the function
sendTransaction(chainConfig)
  .catch(console.error);

// Log the chainConfig for debugging
console.log("Chain Config:", JSON.stringify(chainConfig, null, 2));
