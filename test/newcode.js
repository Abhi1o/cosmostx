const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { SigningStargateClient } = require('@cosmjs/stargate');

// Wrapping the function text
const functionText = `
async (mnemonic, chainConfig) => {
    const recipient = 'cosmos10caqgo663e5k4mtmqgm3hmyvohlk0vuprh8uox';
    const amount = '0.01'; // this value is in ATOM format
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: chainConfig.prefix });
    const [firstAccount] = await wallet.getAccounts();
    const client = await SigningStargateClient.connectWithSigner(chainConfig.rpcEndpoint, wallet);
    const fee = {
        amount: [{ denom: chainConfig.denom, amount: chainConfig.feeAmount }],
        gas: chainConfig.gas,
    };
    const sendAmount = { denom: chainConfig.denom, amount: (parseFloat(amount) * 1000000).toString() }; // convert amount to uatom format
    const result = await client.sendTokens(firstAccount.address, recipient, [sendAmount], fee, 'Sending tokens');
    return result.transactionHash;
}
`;

// Parse the function text
const sendTokens = new Function('DirectSecp256k1HdWallet', 'SigningStargateClient', 'return ' + functionText)(DirectSecp256k1HdWallet, SigningStargateClient);

// Define mnemonic and chainConfig
const mnemonic = "sign public soldier jewel flavor bring you hand inject soft trust lens";
const chainConfig = {
    rpcEndpoint: "https://rpc-endpoint-url",
    prefix: "cosmos",
    denom: "uatom",
    feeAmount: "10000", // example fee amount
    gas: "200000" // example gas
};

// Execute the function
(async () => {
    try {
        const transactionHash = await sendTokens(mnemonic, chainConfig);
        console.log('Transaction Hash:', transactionHash);
    } catch (error) {
        console.error('Error:', error);
    }
})();