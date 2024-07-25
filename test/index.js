const express = require('express');
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { assertIsBroadcastTxSuccess, SigningStargateClient } = require('@cosmjs/stargate');
const chainConfig = require('./config');

async function sendTransaction(mnemonic, chainConfig) {
    const recipient = 'cosmos1w59ngfp904p0dluy6d0pglam5g3c67lu5kf5kp';
    const amount = '10000'; // 0.1 ATOM in uatom (1 ATOM = 10^6 uatom)


    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: chainConfig.prefix });
   
    const [firstAccount] = await wallet.getAccounts();
    console.log("after: first account ", firstAccount);
    console.log("after: first account ", firstAccount);

    const client = await SigningStargateClient.connectWithSigner(chainConfig.rpcEndpoint, wallet);
    console.log("after: client ", client);
    
    const fee = {
        amount: [{ denom: chainConfig.denom, amount: chainConfig.feeAmount }],
        gas: chainConfig.gas
    };
    console.log("after: fee ", fee);
    
    const sendAmount = { denom: chainConfig.denom, amount: (parseFloat(amount) * 1000000).toString() };
    const result = await client.sendTokens(firstAccount.address, recipient, [sendAmount], fee, 'Sending tokens');
   
    console.log("after: result ", result);
    
    // assertIsBroadcastTxSuccess(result);
    console.log('Transaction successful with hash:', result.transactionHash);
    return result.transactionHash;
}

const app = express();
const PORT = 5000;

app.use(express.json());

app.post('/send-tx', async (req, res) => {
    const { mnemonic } = req.body;

    if (!mnemonic) {
        return res.status(400).send('Mnemonic is required');
    }

    try {
        const txHash = await sendTransaction(mnemonic, chainConfig);
        res.status(200).send({ transactionHash: txHash });
    } catch (error) {
        console.error('Error sending transaction:', error.message);
        res.status(500).send('An error occurred: ' + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
