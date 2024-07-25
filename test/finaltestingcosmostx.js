import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { coins } from "@cosmjs/amino";

async function broadcastTransaction(mnemonic, recipientAddress, amount, memo = "") {
  // Configuration
  const rpcEndpoint = "https://rpc.cosmoshub-4.citizenweb3.com";
  const prefix = "cosmos";
  const denom = "uatom";

  // Create a wallet from mnemonic
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: prefix });
  const [firstAccount] = await wallet.getAccounts();

  // Create a signing client
  const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);

  // Prepare the transaction
  const fee = {
    amount: coins(5000, denom),
    gas: "200000",
  };

  // Send the transaction
  try {
    const result = await client.sendTokens(
      firstAccount.address,
      recipientAddress,
      coins(amount, denom),
      fee,
      memo
    );

    console.log("Transaction hash:", result.transactionHash);
    return result.transactionHash;
  } catch (error) {
    console.error("Error broadcasting transaction:", error);
    throw error;
  }
}

// Usage
const mnemonic = "your twelve word mnemonic here";
const recipientAddress = "cosmos1..."; // The recipient's address
const amount = "1000000"; // Amount in uatom (1 ATOM = 1,000,000 uatom)
const memo = "Optional memo";

broadcastTransaction(mnemonic, recipientAddress, amount, memo)
  .then(txHash => console.log("Transaction broadcasted successfully:", txHash))
  .catch(error => console.error("Failed to broadcast transaction:", error));