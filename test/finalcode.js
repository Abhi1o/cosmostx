const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { SigningStargateClient} = require('@cosmjs/stargate');
const chainConfig = require('./config');

async function sendTransaction(mnemonic, chainConfig) {
    
        const recipient = 'cosmos1w59ngfp904p0dluy6d0pglam5g3c67lu5kf5kp';
        const amount = '0.01'; //this value is in ATOM format
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: chainConfig.prefix });
        const [firstAccount] = await wallet.getAccounts();
        const client = await SigningStargateClient.connectWithSigner(chainConfig.rpcEndpoint, wallet);

        const fee = {
            amount: [{ denom: chainConfig.denom, amount: chainConfig.feeAmount }],
            gas: chainConfig.gas,
        };

        const sendAmount = { denom: chainConfig.denom, amount: (parseFloat(amount) * 1000000).toString() }; // convert amount to uatom format
        const result = await client.sendTokens(firstAccount.address, recipient, [sendAmount], fee, 'Sending tokens');
        //assertIsBroadcastTxSuccess(result); remove this "this is not a function"
        console.log('Transaction successful with hash:', result.transactionHash);
    
}

// Execute the function
sendTransaction('sign public soldier jewel flavor bring you hand inject soft trust lens', chainConfig).catch(console.error);
